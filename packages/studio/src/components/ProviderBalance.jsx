"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for Tailwind class merging
 */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * A reusable balance pill component for displaying provider-specific credits.
 * 
 * @param {Object} props
 * @param {string} props.provider - The name of the AI provider (e.g., 'muapi', 'fal').
 * @param {number|null} props.balance - The current balance value.
 * @param {boolean} props.loading - Whether the balance is currently being fetched.
 * @param {string} [props.currency='$'] - The currency symbol.
 * @param {boolean} [props.isActive] - Whether an active task is running for this provider.
 * @param {boolean} [props.hasError] - Whether the most recent fetch failed.
 */
const ProviderBalance = ({ provider, balance, loading, currency = '$', isActive, hasError }) => {
  const [showPing, setShowPing] = useState(false);
  const prevBalanceRef = useRef(balance);

  useEffect(() => {
    // Show ping when balance changes to a non-null value while not loading
    if (prevBalanceRef.current !== balance && balance !== null && !loading && !hasError && prevBalanceRef.current !== undefined) {
      setShowPing(true);
      const timer = setTimeout(() => setShowPing(false), 1000);
      return () => clearTimeout(timer);
    }
    prevBalanceRef.current = balance;
  }, [balance, loading, hasError]);

  return (
    <div className="relative inline-flex">
      <motion.div 
        animate={{
          scale: loading ? [1, 1.02, 1] : 1,
          opacity: loading ? [0.6, 0.9, 0.6] : 1,
          boxShadow: isActive 
            ? "0 0 12px rgba(34, 197, 94, 0.4)" 
            : hasError 
              ? "0 0 12px rgba(239, 68, 68, 0.4)" 
              : "0 0 0px rgba(0,0,0,0)"
        }}
        transition={{
          duration: loading ? 1.5 : (isActive || hasError ? 2 : 0.3),
          repeat: (loading || isActive || hasError) ? Infinity : 0,
          ease: "easeInOut"
        }}
        className={cn(
          "flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 transition-colors hover:bg-white/10",
          isActive && "border-green-500/40 bg-green-500/5",
          hasError && "border-red-500/40 bg-red-500/5",
          loading && "cursor-wait"
        )}
      >
         <span className={cn(
           "text-[9px] uppercase font-black tracking-wider transition-colors",
           isActive ? "text-green-400" : hasError ? "text-red-400" : "text-white/20"
         )}>
           {provider}
         </span>
         <span className="text-xs font-bold text-white/90 min-w-[3ch] text-center">
           {balance !== null 
             ? `${currency}${Number(balance).toFixed(2)}` 
             : loading 
               ? '...' 
               : '---'}
         </span>
      </motion.div>

      <AnimatePresence>
        {showPing && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border-2 border-white/30 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProviderBalance;
