# CareerFlow AI Intelligence

Welcome to **CareerFlow**, a next-generation AI-powered interview platform designed to conduct dynamic, oral technical interviews, enforce strict proctoring, and provide boardroom-ready performance analysis.

## 🚀 Features

- **Dynamic Question Generation**: Upload a PDF resume, and our AI (powered by Groq & LLaMA 3.3) analyzes the candidate's DNA to generate tailored technical questions across varying difficulty levels (Easy, Medium, Hard).
- **Oral Assessment Interface**: Built-in speech-to-text pipeline enforces spoken-only answers, eliminating copy-pasting or text-based cheating.
- **Zero-Trust Proctoring**: Real-time fullscreen enforcement and tab-switching/visibility detection ensure a secure and level playing field.
- **Deep AI Evaluation**: Get a comprehensive scorecard featuring:
  - Overall Proficiency Score
  - **SWOT Analysis** (Strengths, Weaknesses, Opportunities, Threats)
  - Detailed, question-wise evaluation with expert feedback comparing candidate responses against the ideal model answers.
- **Persistent Dashboard**: User authentication (JWT) and a dashboard to track past performance history and average scores over time.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js (App Router) & React
- **Styling**: Tailwind CSS for a premium, high-contrast, dynamic UI
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Audio Processing**: Web Speech API for real-time transcription

### Backend
- **Framework**: FastAPI (Python)
- **AI Integration**: Groq API (using `llama-3.3-70b-versatile` for high-speed, intelligent reasoning)
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT (Jose) & bcrypt for password hashing
- **PDF Processing**: PyMuPDF (`fitz`) for accurate resume parsing

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js & npm
- Python 3.9+
- A Groq API Key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend` folder and add your keys:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   JWT_SECRET=your_jwt_secret_here
   ```
5. Start the backend server:
   ```bash
   python main.py
   ```
   *The backend runs on `http://0.0.0.0:8000`*

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend runs on `http://localhost:3000`*

## 🛡️ Security & Proctoring
To maintain high-fidelity assessment standards, candidates must grant microphone permissions and enter fullscreen mode to begin the interview. Exiting fullscreen or switching tabs triggers the integrity system, which will terminate the session upon multiple violations.

---
*Elevate Your Interview Game with CareerFlow AI.*
