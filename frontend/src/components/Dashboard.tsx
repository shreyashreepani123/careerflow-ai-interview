'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Award, ChevronRight, History, Loader2, Plus, ArrowUpRight, TrendingUp } from 'lucide-react';
import axios from 'axios';

interface DashboardProps {
  token: string;
  onViewResult: (result: any) => void;
  onStartNew: () => void;
}

export default function Dashboard({ token, onViewResult, onStartNew }: DashboardProps) {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await axios.get('http://localhost:8000/interviews', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInterviews(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInterviews();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        <p className="text-gray-400 font-medium animate-pulse">Syncing your progress...</p>
      </div>
    );
  }

  const avgScore = interviews.length > 0 
    ? Math.round(interviews.reduce((acc, curr) => acc + curr.overall_score, 0) / interviews.length)
    : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 py-12">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-5xl font-bold mb-3 gradient-text">Dashboard</h1>
          <p className="text-gray-400 text-lg">Track your interview excellence and performance metrics.</p>
        </motion.div>
        <motion.button 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onStartNew}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold glow-button group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Start New Interview</span>
        </motion.button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          { label: 'Avg Proficiency', value: `${avgScore}%`, icon: Award, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
          { label: 'Total Sessions', value: interviews.length, icon: History, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'Last Active', value: interviews.length > 0 ? new Date(interviews[0].timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A', icon: Calendar, color: 'text-rose-400', bg: 'bg-rose-400/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="premium-card group hover:scale-[1.02] cursor-default"
          >
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-6`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-1">{stat.label}</h3>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-bold text-white">{stat.value}</p>
              <TrendingUp className="w-5 h-5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white/90">Interview History</h2>
          <span className="text-sm text-gray-500 bg-white/5 px-4 py-1 rounded-full border border-white/5">{interviews.length} Sessions</span>
        </div>
        
        <div className="space-y-4">
          <AnimatePresence>
            {interviews.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="premium-card p-16 text-center"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plus className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-300 mb-2">No activity found</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-8">
                  Your interview results will appear here. Start your first session to begin tracking your performance.
                </p>
                <button onClick={onStartNew} className="text-indigo-400 font-bold hover:underline">Start Now</button>
              </motion.div>
            ) : (
              interviews.map((interview, i) => (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ x: 8 }}
                  onClick={() => onViewResult(interview)}
                  className="premium-card p-6 flex items-center justify-between cursor-pointer group hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-8">
                    <div className="relative">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="transparent"
                          className="text-white/5"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="transparent"
                          strokeDasharray={175.9}
                          strokeDashoffset={175.9 * (1 - interview.overall_score / 100)}
                          className="text-indigo-500 transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">
                        {interview.overall_score}%
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-white group-hover:text-indigo-400 transition-colors mb-1">
                        {new Date(interview.timestamp).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </h4>
                      <p className="text-gray-400 line-clamp-1 max-w-xl italic">"{interview.summary}"</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="hidden md:block text-sm font-semibold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">View Analysis</span>
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                      <ArrowUpRight className="w-6 h-6 text-gray-400 group-hover:text-white" />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

