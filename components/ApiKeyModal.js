'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from "motion/react";

export default function ApiKeyModal({ onSave }) {
  const [muapi_key, setMuapi_key] = useState('');
  const [fal_key, setFal_key] = useState('');
  const [showFal, setShowFal] = useState(false);
  const [error, setError] = useState('');

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 0.6,
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedMuapi = muapi_key.trim();
    const trimmedFal = fal_key.trim();
    
    if (!trimmedMuapi && !trimmedFal) {
      setError('Please enter at least one provider API key');
      return;
    }
    
    onSave({ muapi: trimmedMuapi, fal: trimmedFal });
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center px-4 font-inter">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/10 rounded-xl p-10 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <motion.div 
            variants={itemVariants}
            className="w-14 h-14 bg-[#d9ff00]/5 rounded-2xl flex items-center justify-center border border-[#d9ff00]/10 mb-6 group hover:border-[#d9ff00]/30 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d9ff00" strokeWidth="1.5" className="group-hover:scale-110 transition-transform">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L12 17.25l-4.5-4.5L15.5 7.5z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          <motion.h1 
            variants={itemVariants}
            className="text-xl font-bold text-white tracking-tight mb-2"
          >
            Open Generative AI
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-white/40 text-[13px] leading-relaxed px-4"
          >
            Enter your API keys to start creating
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div 
            variants={itemVariants}
            className="space-y-2"
          >
            <label className="flex justify-between items-center text-xs font-bold text-white/30 ml-1">
              Muapi.ai Key
              <a href="https://muapi.ai/access-keys" target="_blank" rel="noreferrer" className="text-[#d9ff00] hover:text-[#e5ff33] transition-colors font-normal">
                Get key →
              </a>
            </label>
            <input
              type="password"
              value={muapi_key}
              onChange={(e) => { setMuapi_key(e.target.value); setError(''); }}
              placeholder="Paste Muapi.ai key here..."
              className="w-full bg-white/5 border border-white/[0.03] rounded-md px-5 py-3 text-sm text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-[#d9ff00]/30 focus:bg-white/[0.07] transition-all"
              suppressHydrationWarning
            />
          </motion.div>

          <AnimatePresence mode="wait">
            {showFal ? (
              <motion.div 
                key="fal-input"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <label className="flex justify-between items-center text-xs font-bold text-white/30 ml-1">
                  fal.ai Key
                  <a href="https://fal.ai/dashboard/keys" target="_blank" rel="noreferrer" className="text-[#d9ff00] hover:text-[#e5ff33] transition-colors font-normal">
                    Get key →
                  </a>
                </label>
                <input
                  type="password"
                  value={fal_key}
                  onChange={(e) => { setFal_key(e.target.value); setError(''); }}
                  placeholder="Paste fal.ai key here..."
                  className="w-full bg-white/5 border border-white/[0.03] rounded-md px-5 py-3 text-sm text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-[#d9ff00]/30 focus:bg-white/[0.07] transition-all"
                  suppressHydrationWarning
                />
              </motion.div>
            ) : (
              <motion.button
                key="fal-button"
                type="button"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                onClick={() => setShowFal(true)}
                className="w-full py-2 border border-white/5 rounded-md text-[11px] font-bold text-white/40 hover:text-white/60 hover:bg-white/5 transition-all"
              >
                + Add fal.ai Provider
              </motion.button>
            )}
          </AnimatePresence>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-red-500/80 text-[11px] font-medium ml-1"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-[#d9ff00] text-black font-medium py-2.5 rounded-md hover:bg-[#e5ff33] transition-all shadow-lg shadow-[#d9ff00]/5"
            suppressHydrationWarning
          >
            Get Started
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
