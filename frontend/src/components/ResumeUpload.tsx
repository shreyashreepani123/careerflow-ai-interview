'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, Loader2, Sparkles, X } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface ResumeUploadProps {
  onQuestionsGenerated: (questions: any) => void;
}

export default function ResumeUpload({ onQuestionsGenerated }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/parse-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onQuestionsGenerated(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload resume. Ensure backend is running.');
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="premium-card p-10 w-full max-w-xl text-center relative"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="w-16 h-16 text-indigo-400" />
        </div>

        <h2 className="text-4xl font-black mb-4 gradient-text tracking-tighter">Elevate Your Career</h2>
        <p className="text-gray-400 mb-10 text-base">Upload your professional resume to generate high-fidelity, AI-tailored interview simulations.</p>


        <div 
          className={`relative group border-2 border-dashed rounded-3xl p-12 mb-8 transition-all duration-500 cursor-pointer overflow-hidden
            ${file ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
          />
          
          <AnimatePresence mode='wait'>
            {file ? (
              <motion.div 
                key="file-selected"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center"
              >
                <div className="relative">
                  <div className="absolute -inset-4 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
                  <CheckCircle2 className="w-16 h-16 text-indigo-400 mb-4 relative" />
                </div>
                <p className="text-xl font-bold text-white mb-1">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document</p>
                
                <button 
                  onClick={clearFile}
                  className="mt-6 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all flex items-center gap-2 text-xs font-bold"
                >
                  <X className="w-3 h-3" /> Remove File
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="no-file"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Upload className="w-10 h-10 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                </div>
                <p className="text-xl font-bold text-gray-300 mb-2">Click or drag to upload PDF</p>
                <p className="text-sm text-gray-500">Maximum size: 10MB • Exclusive PDF support</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl mb-6 flex items-center gap-3 text-rose-400 text-sm font-medium"
          >
            <X className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`w-full py-5 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-3 shadow-2xl
            ${!file || isUploading ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'glow-button text-white shadow-indigo-500/20'}`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Synthesizing Interview Data...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              <span>Generate Questions</span>
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}

