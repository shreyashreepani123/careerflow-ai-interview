from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
import os
import fitz  # PyMuPDF
from groq import Groq
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from pydantic import BaseModel
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import bcrypt
from jose import JWTError, jwt

load_dotenv()

# --- Database Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./careerflow.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    hashed_password = Column(String)

class InterviewResult(Base):
    __tablename__ = "interview_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    overall_score = Column(Integer)
    summary = Column(String)
    swot = Column(JSON)
    evaluations = Column(JSON)

Base.metadata.create_all(bind=engine)

# --- Auth Setup ---
SECRET_KEY = os.getenv("JWT_SECRET", "careerflow_ultra_secret_key_2024")
ALGORITHM = "HS256"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Password Hashing Helpers ---
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# --- Schemas ---
class UserCreate(BaseModel):
    name: str
    email: str
    phone: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class InterviewAnswer(BaseModel):
    question: str
    answer: str

class EvaluationRequest(BaseModel):
    answers: List[InterviewAnswer]

# --- App Initialization ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# --- Helper Functions ---
def get_current_user_id(authorization: str = Header(None)):
    if not authorization: return None
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except: return None

# --- Auth Routes ---
@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user: 
            raise HTTPException(status_code=400, detail="Email already registered")
        
        new_user = User(
            name=user.name,
            email=user.email,
            phone=user.phone,
            hashed_password=hash_password(user.password)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"message": "User created successfully"}
    except Exception as e:
        print(f"Registration Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during registration")

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    try:
        db_user = db.query(User).filter(User.email == user.email).first()
        if not db_user or not verify_password(user.password, db_user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        token = jwt.encode({"sub": str(db_user.id), "exp": datetime.utcnow() + timedelta(days=7)}, SECRET_KEY, algorithm=ALGORITHM)
        return {"token": token, "user": {"name": db_user.name, "email": db_user.email}}
    except Exception as e:
        print(f"Login Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during login")

# --- Interview Routes ---
@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    try:
        contents = await file.read()
        doc = fitz.open(stream=contents, filetype="pdf")
        text = "".join([page.get_text() for page in doc])
        prompt = f"""
        Generate 15 professional technical interview questions based on this resume: {text}
        
        CRITICAL GUIDELINES:
        1. These are ORAL questions. Avoid questions that require writing code, complex math, or drawing diagrams.
        2. Focus on: Conceptual understanding, architectural decisions, past experiences, soft skills in technical scenarios, and theoretical principles.
        3. Structure: 5 Easy, 5 Medium, 5 Hard.
        4. JSON Structure: {{ "easy": [], "medium": [], "hard": [] }}
        """
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "system", "content": "Return ONLY valid JSON structure."}, {"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate-interview")
async def evaluate_interview(request: EvaluationRequest, user_id: Optional[str] = Depends(get_current_user_id), db: Session = Depends(get_db)):
    try:
        history = "\n".join([f"Q: {a.question}\nA: {a.answer}" for a in request.answers])
        prompt = f"""
        Act as an expert technical interviewer. Evaluate the following oral interview responses.
        
        STRICT JSON STRUCTURE REQUIRED:
        {{
          "overall_score": <number 0-100>,
          "summary": "<string summary>",
          "swot": {{
            "strengths": ["...", "..."],
            "weaknesses": ["...", "..."],
            "opportunities": ["...", "..."],
            "threats": ["...", "..."]
          }},
          "evaluations": [
            {{
              "question": "<original question>",
              "model_answer": "<ideal spoken answer>",
              "score": <number 0-10>,
              "feedback": "<specific feedback>"
            }}
          ]
        }}
        
        Interview Data:
        {history}
        """
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "system", "content": "Return ONLY valid JSON."}, {"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        result_str = completion.choices[0].message.content
        result = json.loads(result_str)
        
        # Save to database if user is logged in
        if user_id:
            try:
                db_result = InterviewResult(
                    user_id=int(user_id),
                    overall_score=result.get("overall_score", 0),
                    summary=result.get("summary", "N/A"),
                    swot=result.get("swot", {}),
                    evaluations=result.get("evaluations", [])
                )
                db.add(db_result)
                db.commit()
            except Exception as db_e:
                print(f"Database Save Error: {str(db_e)}")
                db.rollback()
            
        return result
    except Exception as e:
        print(f"Evaluation Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/interviews")
def get_interviews(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    if not user_id: raise HTTPException(status_code=401)
    results = db.query(InterviewResult).filter(InterviewResult.user_id == int(user_id)).order_by(InterviewResult.timestamp.desc()).all()
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
