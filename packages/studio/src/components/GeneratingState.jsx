"use client";

import { motion } from "motion/react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for Tailwind class merging
 */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Standardized progress/loading UI for all generation studios.
 */
export default function GeneratingState({
  modelName,
  provider,
  statusText = "Processing...",
  onCancel,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300 w-full h-full min-h-[400px]",
        className
      )}
    >
      <div className="relative mb-10">
        {/* Animated Background Glow Effect */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-[#d9ff00]/20 blur-[80px] rounded-full"
        />

        {/* Central Card */}
        <div className="relative w-32 h-32 bg-white/[0.03] rounded-[2.5rem] flex items-center justify-center border border-white/[0.08] backdrop-blur-xl shadow-4xl overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#d9ff00]/10 to-transparent opacity-40" />
          
          {/* Main Spinning Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-16 h-16 border-2 border-[#d9ff00]/10 border-t-[#d9ff00] rounded-full relative z-10"
          />
          
          {/* Pulsing Inner Core */}
          <motion.div
            animate={{ 
              scale: [0.8, 1.2, 0.8], 
              opacity: [0.4, 1, 0.4],
              boxShadow: [
                "0 0 0px rgba(217, 255, 0, 0)",
                "0 0 20px rgba(217, 255, 0, 0.4)",
                "0 0 0px rgba(217, 255, 0, 0)"
              ]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-3 h-3 bg-[#d9ff00] rounded-full z-20"
          />

          {/* Decorative floating particles */}
          <motion.div
            animate={{ 
              y: [-5, 5, -5],
              x: [-3, 3, -3],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-6 right-6 w-1 h-1 bg-[#d9ff00] rounded-full"
          />
          <motion.div
            animate={{ 
              y: [5, -5, 5],
              x: [3, -3, 3],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute bottom-8 left-8 w-1 h-1 bg-[#d9ff00] rounded-full"
          />
        </div>
      </div>

      <div className="space-y-4 z-10 max-w-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {modelName || "AI Generation"}
            </h3>
            <span className={cn(
              "text-[10px] font-black uppercase px-2 py-0.5 rounded border leading-none tracking-wider",
              provider === 'fal' 
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                : 'bg-[#d9ff00]/10 text-[#d9ff00] border-[#d9ff00]/20'
            )}>
              {provider || "muapi"}
            </span>
          </div>
          <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-[#d9ff00]/30 to-transparent rounded-full" />
        </div>
        
        <div className="space-y-1">
          <p className="text-white font-medium tracking-wide animate-pulse-slow">
            {statusText}
          </p>
          <p className="text-white/30 text-xs font-medium uppercase tracking-[0.1em]">
            This usually takes 10-60 seconds
          </p>
        </div>

        {onCancel && (
          <motion.button
            whileHover={{ scale: 1.05, color: "#f87171" }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="mt-8 px-6 py-2 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-bold text-white/30 hover:border-red-400/20 uppercase tracking-[0.2em] transition-all"
          >
            Cancel Request
          </motion.button>
        )}
      </div>
      
      {/* CSS for custom animation if needed, but Tailwind/Motion handles it */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
