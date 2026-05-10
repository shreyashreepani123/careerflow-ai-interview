'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, StopCircle, AlertTriangle, ShieldAlert, ChevronRight, Play, Volume2, Sparkles as SparklesIcon, Trophy, Target, ListChecks, ArrowLeft, Loader2, User, Activity, Clock, ShieldCheck, Zap } from 'lucide-react';
import ProctoringSystem from './ProctoringSystem';
import axios from 'axios';
import EvaluationResult from './EvaluationResult';

interface InterviewSessionProps {
  questions: {
    easy: string[];
    medium: string[];
    hard: string[];
  };
  token: string | null;
}

export default function InterviewSession({ questions, token }: InterviewSessionProps) {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [proctorStatus, setProctorStatus] = useState<'safe' | 'warning' | 'terminated'>('safe');
  const [warningCount, setWarningCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [transcript, setTranscript] = useState("");
  const transcriptRef = useRef("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const normalizedQuestions = (questions as any).questions || questions;
  const currentQuestions = normalizedQuestions[difficulty] || [];
  const currentQuestion = currentQuestions[currentQuestionIndex] || "Question structure error. Please restart.";

  const speakQuestion = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Natural')) || voices[0];
    if (premiumVoice) utterance.voice = premiumVoice;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (currentQuestion && proctorStatus === 'safe' && isFullscreen && !evaluationResult) {
      speakQuestion(currentQuestion);
    }
  }, [currentQuestion, proctorStatus, isFullscreen, evaluationResult]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
          let accumulatedFinal = "";
          let currentInterim = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcriptChunk = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              accumulatedFinal += transcriptChunk;
            } else {
              currentInterim += transcriptChunk;
            }
          }

          // Update live transcript display with both final and interim parts
          const fullLiveText = (transcriptRef.current + " " + accumulatedFinal + currentInterim).trim();
          setTranscript(fullLiveText);

          // Store only final portions in the persistent ref
          if (accumulatedFinal) {
            transcriptRef.current = (transcriptRef.current + " " + accumulatedFinal).trim();
          }
        };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === 'network') {
          // Handle network errors or restart if needed
        }
      };
    }
  }, []);

  const handleViolation = (type: string) => {
    if (proctorStatus === 'terminated') return;
    setWarningCount(prev => {
      const next = prev + 1;
      if (next >= 2) {
        setProctorStatus('terminated');
        if (document.fullscreenElement) document.exitFullscreen();
      } else {
        setProctorStatus('warning');
        setTimeout(() => setProctorStatus('safe'), 4000);
      }
      return next;
    });
  };

  useEffect(() => {
    const handleVisibilityChange = () => { if (document.hidden && isFullscreen) handleViolation('tab'); };
    const handleFullscreenChange = () => { setIsFullscreen(!!document.fullscreenElement); if (!document.fullscreenElement && isFullscreen) handleViolation('fs'); };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen]);

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen().then(() => setIsFullscreen(true));
  };

  const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.start();
        
        if (recognitionRef.current) {
          try {
            // Reset transcript buffers
            transcriptRef.current = "";
            setTranscript("");
            recognitionRef.current.start();
          } catch (e) {
            console.warn("SpeechRecognition already started", e);
          }
        }
        
        setIsRecording(true);
      } catch (err) { console.error(err); }
    };

  const finalizeTranscript = () => {
        // Ensure any remaining interim speech is flushed into the persistent ref
        if (recognitionRef.current && recognitionRef.current.resultIndex !== undefined) {
          // Force a final update by processing the latest interim result if any
          const interim = transcriptRef.current;
          // No additional action needed as onresult already updates the ref for final parts
        }
      };

      const stopRecording = () => {
        if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            console.warn("SpeechRecognition already stopped", e);
          }
        }
        // Flush any leftover interim transcript before saving
        finalizeTranscript();
        setIsRecording(false);
        const finalVal = transcriptRef.current;
        setAnswers(prev => ({ ...prev, [currentQuestion]: finalVal }));
      };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const endInterview = async () => {
    setIsEvaluating(true);
    const data = currentQuestions.map(q => ({ 
      question: q, 
      answer: answers[q] || "" 
    }));
    try {
      const response = await axios.post('http://localhost:8000/evaluate-interview', { answers: data }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setEvaluationResult(response.data);
      if (document.fullscreenElement) document.exitFullscreen();
    } catch (err) { console.error(err); }
    finally { setIsEvaluating(false); }
  };

  if (!mounted) return null;

  if (evaluationResult) {
    return <EvaluationResult result={evaluationResult} onBack={() => window.location.reload()} />;
  }

  if (proctorStatus === 'terminated') {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="premium-card p-20 max-w-3xl text-center border-rose-500/30 bg-rose-500/5 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)]" />
          <ShieldAlert className="w-24 h-24 text-rose-500 mx-auto mb-8 animate-pulse" />
          <h1 className="text-5xl font-black mb-6 text-rose-500 tracking-tighter uppercase">Integrity Breach</h1>
          <p className="text-2xl text-gray-400 font-medium leading-relaxed mb-12">Session Invalidated: Multiple security violations detected. Your assessment has been terminated for quality assurance.</p>
          <button onClick={() => window.location.reload()} className="px-12 py-5 rounded-2xl bg-rose-500 text-white font-black hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20">RESTART ASSESSMENT</button>
        </motion.div>
      </div>
    );
  }

  if (!isFullscreen) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="premium-card p-16 max-w-2xl text-center"
        >
          <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShieldAlert className="w-12 h-12 text-indigo-500" />
          </div>
          <h2 className="text-4xl font-black mb-6 tracking-tight">Security Protocol</h2>
          <p className="text-xl text-gray-400 font-medium leading-relaxed mb-12">
            To maintain high-fidelity assessment standards, this session requires dedicated Fullscreen access. Tab-switching is restricted.
          </p>
          <button 
            onClick={enterFullscreen} 
            className="w-full py-6 rounded-2xl bg-indigo-600 text-white font-black text-xl shadow-xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            INITIALIZE SECURE MODE
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6 h-[calc(100vh-80px)] flex flex-col gap-6">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="premium-card p-4 px-8 flex items-center justify-between"
      >
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
          {(['easy', 'medium', 'hard'] as const).map((level) => (
            <button 
              key={level} 
              onClick={() => { setDifficulty(level); setCurrentQuestionIndex(0); }} 
              className={`px-8 py-3 rounded-xl capitalize font-black text-xs transition-all ${difficulty === level ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-white'}`}
            >
              {level}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-10">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Session Progress</span>
            <div className="font-black text-2xl flex items-center gap-2">
              <span className="text-indigo-500">{currentQuestionIndex + 1}</span>
              <span className="opacity-20 text-sm">/</span>
              <span className="opacity-40">{currentQuestions.length}</span>
            </div>
          </div>
          <div className="h-12 w-[1px] bg-white/5" />
          <button 
            onClick={endInterview} 
            disabled={isEvaluating} 
            className="px-8 py-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all font-black text-sm tracking-widest flex items-center gap-3"
          >
            {isEvaluating ? <Loader2 className="w-5 h-5 animate-spin" /> : "COMPLETE SESSION"}
          </button>
        </div>
      </motion.div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Left Side */}
        <motion.div 
          key={currentQuestion} 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="premium-card p-8 lg:p-10 flex flex-col justify-center relative group overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.4)]" />
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-indigo-500" />
              </div>
              <span className="font-black text-[9px] uppercase tracking-[0.4em] text-gray-500">AI Inquiry Module</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/10 backdrop-blur-md">
              <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Active Analysis</span>
            </div>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-2 tracking-tight text-white">{currentQuestion}</h2>
            <p className="text-sm text-gray-500 italic mb-6">Please answer verbally; avoid typed explanations.</p>
          
          <div className="premium-card p-6 bg-white/[0.02] border-white/5 min-h-[140px] relative overflow-hidden">
            <div className="absolute top-3 left-5 flex items-center gap-2 text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">
              <Mic className="w-3 h-3" /> Audio-to-Text Pipeline
            </div>
            <div className="mt-6 text-lg font-medium text-gray-400 italic leading-relaxed">
              {isRecording ? (
                <div className="flex gap-4 items-start">
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3].map(i => (
                      <motion.div
                        key={i}
                        animate={{ height: [8, 20, 8] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                        className="w-1 bg-rose-500 rounded-full"
                      />
                    ))}
                  </div>
                  <span className="text-white not-italic">{transcript || "Processing vocal input..."}</span>
                </div>
              ) : (
                answers[currentQuestion] ? (
                  <div className="text-indigo-100 not-italic">{answers[currentQuestion]}</div>
                ) : (
                  <span className="opacity-30">Vocalize your response to continue...</span>
                )
              )}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button 
              onClick={() => speakQuestion(currentQuestion)} 
              className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all group"
            >
              <Volume2 className="w-6 h-6 text-gray-500 group-hover:text-white" />
            </button>
            <button 
              onClick={() => isRecording ? stopRecording() : startRecording()} 
              className={`flex-1 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-2xl ${isRecording ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-white hover:shadow-indigo-500/20'}`}
            >
              {isRecording ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              {isRecording ? 'HALT RECORDING' : 'START RESPONSE'}
            </button>
            <button 
              onClick={nextQuestion} 
              className="w-16 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 hover:translate-x-1 transition-all"
            >
              <ChevronRight className="w-7 h-7 text-white" />
            </button>
          </div>
        </motion.div>

        {/* Right Side */}
        <div className="relative premium-card rounded-[48px] overflow-hidden bg-slate-950/40 p-0 border-white/5">
          <ProctoringSystem onViolation={() => handleViolation('gaze')} />
          <div className="absolute top-8 left-8 flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-xl z-20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Surveillance Active</span>
          </div>
          
          <AnimatePresence>
            {proctorStatus === 'warning' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-rose-500/20 backdrop-blur-2xl flex flex-col items-center justify-center p-12 text-center z-50"
              >
                <div className="premium-card p-12 bg-rose-500/10 border-rose-500/20 max-w-md">
                  <AlertTriangle className="w-20 h-20 text-rose-500 mx-auto mb-8 animate-bounce" />
                  <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">Security Alert</h3>
                  <p className="text-lg text-gray-200 font-bold leading-relaxed">Gaze deviation detected. Maintain visual contact with the module.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

