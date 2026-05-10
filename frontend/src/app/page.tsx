'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Shield, User as UserIcon, LogOut, LayoutDashboard, PlusCircle, ArrowRight, Zap, Globe, Trophy } from 'lucide-react';
import ResumeUpload from '@/components/ResumeUpload';
import InterviewSession from '@/components/InterviewSession';
import AuthPage from '@/components/AuthPage';
import Dashboard from '@/components/Dashboard';
import EvaluationResult from '@/components/EvaluationResult';

export default function Home() {
  const [view, setView] = useState<'home' | 'interview' | 'dashboard' | 'auth' | 'result'>('home');
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [questions, setQuestions] = useState(null);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleAuthSuccess = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setView('home');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setView('home');
  };

  const handleQuestionsGenerated = (generatedQuestions: any) => {
    setQuestions(generatedQuestions);
    setView('interview');
  };

  return (
    <main className="min-h-screen bg-background text-white selection:bg-primary/30 relative">
      <div className="mesh-gradient" />
      <div className="noise" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-card rounded-none border-t-0 border-x-0 bg-slate-950/20 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => setView('home')}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-secondary flex items-center justify-center shadow-2xl shadow-primary/40 relative group">
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col -gap-1">
              <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                CareerFlow
              </span>
              <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">AI Intelligence</span>
            </div>
          </motion.div>

          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setView('dashboard')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all font-bold text-sm ${view === 'dashboard' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white/5 text-gray-400'}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
                <div className="h-8 w-[1px] bg-white/10" />
                <div className="flex items-center gap-3 pl-4 pr-2 py-1.5 rounded-2xl bg-white/5 border border-white/10 premium-border">
                  <div className="text-sm font-bold">{user.name}</div>
                  <button onClick={handleLogout} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-accent/20 hover:text-accent transition-all">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setView('auth')}
                className="px-8 py-3 rounded-2xl bg-white text-black font-black hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12">
        <AnimatePresence mode="wait">
          {view === 'auth' && (
            <motion.div key="auth" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
              <AuthPage onAuthSuccess={handleAuthSuccess} />
            </motion.div>
          )}

          {view === 'dashboard' && token && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Dashboard token={token} onStartNew={() => setView('home')} onViewResult={(result) => { setSelectedResult(result); setView('result'); }} />
            </motion.div>
          )}

          {view === 'result' && selectedResult && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}>
              <EvaluationResult result={selectedResult} onBack={() => { setView('dashboard'); setSelectedResult(null); }} />
            </motion.div>
          )}

          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto px-6">
              <div className="text-center py-20 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] -z-10 rounded-full" />
                
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
                  <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-primary text-xs font-black tracking-widest mb-10 premium-border">
                    <Zap className="w-4 h-4 fill-primary" />
                    NEXT-GEN RECRUITMENT ENGINE
                  </div>
                  <h1 className="text-8xl font-black mb-8 leading-[1] tracking-tight">
                    Elevate Your <br />
                    <span className="gradient-text">Interview Game.</span>
                  </h1>
                  <p className="text-2xl text-gray-400 max-w-3xl mx-auto mb-14 font-medium leading-relaxed">
                    The world's most advanced AI interview platform. Experience real-time proctoring, oral evaluations, and deep SWOT analysis.
                  </p>
                </motion.div>

                <div className="max-w-3xl mx-auto relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[32px] blur-2xl opacity-20" />
                  <ResumeUpload onQuestionsGenerated={handleQuestionsGenerated} />
                </div>
                
                <div className="mt-20 flex items-center justify-center gap-12 text-gray-500 font-bold uppercase text-xs tracking-[0.3em]">
                  <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> Global Standards</span>
                  <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Secure Proctoring</span>
                  <span className="flex items-center gap-2"><Trophy className="w-4 h-4" /> AI Evaluation</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 mb-32">
                {[
                  { icon: Brain, title: "Deep Intelligence", desc: "Our LLM analyzes your resume's DNA to forge questions that truly test your limits.", color: "primary" },
                  { icon: Shield, title: "Zero Trust Security", desc: "Real-time gaze tracking and tab monitoring ensure a level playing field for everyone.", color: "secondary" },
                  { icon: Sparkles, title: "Strategic SWOT", desc: "Get a boardroom-ready analysis of your strengths and specific paths to mastery.", color: "accent" }
                ].map((feature, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -10 }} 
                    className="glass-card p-10 group relative overflow-hidden premium-border rounded-[32px]"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all" />
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-black mb-4">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed font-medium">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'interview' && questions && (
            <motion.div key="interview" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}>
              <InterviewSession questions={questions} token={token} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
