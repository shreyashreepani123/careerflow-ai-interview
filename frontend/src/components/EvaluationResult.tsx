import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Target, Sparkles as SparklesIcon, AlertTriangle, ShieldCheck, Activity, ArrowLeft } from 'lucide-react';

interface EvaluationResultProps {
  result: any;
  onBack: () => void;
}

export default function EvaluationResult({ result, onBack }: EvaluationResultProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto p-6 py-12 space-y-12">
      <motion.div 
        initial={{ y: 20 }} 
        animate={{ y: 0 }}
        className="premium-card p-16 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500" />
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ type: "spring", damping: 12, delay: 0.2 }}
        >
          <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]" />
          </div>
        </motion.div>
        <h1 className="text-3xl font-black mb-4 tracking-tight">Assessment Performance</h1>
        <div className="text-7xl font-black gradient-text mb-6 tracking-tighter">{result.overall_score}%</div>
        <p className="text-lg text-gray-400 max-w-3xl mx-auto font-medium leading-relaxed italic">
          "{result.summary}"
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Strengths', data: result.swot?.strengths, color: 'text-emerald-400', bg: 'bg-emerald-400/5', icon: Zap },
          { label: 'Areas of Focus', data: result.swot?.weaknesses, color: 'text-rose-400', bg: 'bg-rose-400/5', icon: Target },
          { label: 'Opportunities', data: result.swot?.opportunities, color: 'text-indigo-400', bg: 'bg-indigo-400/5', icon: SparklesIcon },
          { label: 'Strategic Risks', data: result.swot?.threats, color: 'text-amber-400', bg: 'bg-amber-400/5', icon: AlertTriangle }
        ].map((item, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 + (i * 0.1) }} 
            className={`premium-card p-6 ${item.bg}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <h3 className={`font-black uppercase tracking-widest text-[10px] ${item.color}`}>{item.label}</h3>
            </div>
            <ul className="space-y-3">
              {item.data?.map((text: string, j: number) => (
                <li key={j} className="text-xs text-gray-400 font-medium leading-relaxed flex gap-2 group">
                  <span className={`w-1 h-1 rounded-full mt-1.5 shrink-0 transition-all group-hover:scale-150 ${item.color.replace('text', 'bg')}`} />
                  {text}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6 pt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight">Comprehensive Analysis</h2>
          <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest">
            Detailed Evaluations
          </div>
        </div>
        {result.evaluations?.map((ev: any, i: number) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="premium-card p-8 group hover:bg-white/[0.03]"
          >
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
              <div className="flex-1">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2 block">Question {i + 1}</span>
                <h3 className="text-xl font-bold leading-snug text-white">{ev.question}</h3>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <div className="text-4xl font-black gradient-text">{ev.score}<span className="text-lg opacity-40">/10</span></div>
                <div className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">Proficiency Index</div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 relative group/item">
                <div className="flex items-center gap-2 mb-3 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-black text-[10px] uppercase tracking-widest">Target Response</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed font-medium group-hover/item:text-gray-300 transition-colors">{ev.model_answer}</p>
              </div>
              <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 relative group/item">
                <div className="flex items-center gap-2 mb-3 text-indigo-400">
                  <Activity className="w-4 h-4" />
                  <span className="font-black text-[10px] uppercase tracking-widest">Expert Feedback</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed font-medium group-hover/item:text-gray-300 transition-colors">{ev.feedback}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="flex justify-center pt-10">
        <button 
          onClick={onBack} 
          className="px-12 py-5 rounded-2xl bg-white text-black font-black hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
        >
          <ArrowLeft className="w-6 h-6" />
          RETURN TO DASHBOARD
        </button>
      </div>
    </motion.div>
  );
}
