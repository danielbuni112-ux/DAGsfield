'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ImageStudio, VideoStudio, LipSyncStudio, CinemaStudio, 
  getUserBalance, getFalBalance, ProviderBalance 
} from 'studio';
import { Toaster } from 'sonner';
import ApiKeyModal from './ApiKeyModal';
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const TABS = [
  { id: 'image',   label: 'Image Studio' },
  { id: 'video',   label: 'Video Studio' },
  { id: 'lipsync', label: 'Lip Sync' },
  { id: 'cinema',  label: 'Cinema Studio' },
];

const STORAGE_KEYS = {
  MUAPI: 'muapi_key',
  FAL: 'fal_key'
};

export default function StandaloneShell() {
  const [muapiApiKey, setMuapiApiKey] = useState(null);
  const [falApiKey, setFalApiKey] = useState(null);
  const [activeTab, setActiveTab] = useState('image');
  const [muapiBalance, setMuapiBalance] = useState(null);
  const [falBalance, setFalBalance] = useState(null);
  const [muapiLoading, setMuapiLoading] = useState(false);
  const [falLoading, setFalLoading] = useState(false);
  const [muapiError, setMuapiError] = useState(false);
  const [falError, setFalError] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const fetchMuapiBalance = useCallback(async (key) => {
    if (!key) return;
    setMuapiLoading(true);
    setMuapiError(false);
    try {
      const data = await getUserBalance(key);
      setMuapiBalance(data.balance);
    } catch (err) {
      console.error('Muapi balance fetch failed:', err);
      setMuapiError(true);
    } finally {
      setMuapiLoading(false);
    }
  }, []);

  const fetchFalBalance = useCallback(async (key) => {
    if (!key) return;
    setFalLoading(true);
    setFalError(false);
    try {
      const data = await getFalBalance(key);
      setFalBalance(data.balance);
    } catch (err) {
      console.error('Fal balance fetch failed:', err);
      setFalError(true);
    } finally {
      setFalLoading(false);
    }
  }, []);

  const fetchBalances = useCallback((mKey, fKey) => {
    if (mKey) fetchMuapiBalance(mKey);
    if (fKey) fetchFalBalance(fKey);
  }, [fetchMuapiBalance, fetchFalBalance]);

  useEffect(() => {
    setHasMounted(true);
    const mKey = localStorage.getItem(STORAGE_KEYS.MUAPI);
    const fKey = localStorage.getItem(STORAGE_KEYS.FAL);
    
    if (mKey) setMuapiApiKey(mKey);
    if (fKey) setFalApiKey(fKey);
    
    fetchBalances(mKey, fKey);
  }, [fetchBalances]);

  const handleApiKeysSave = useCallback(({ muapi, fal }) => {
    if (muapi) {
      localStorage.setItem(STORAGE_KEYS.MUAPI, muapi);
      setMuapiApiKey(muapi);
      fetchMuapiBalance(muapi);
    }
    if (fal) {
      localStorage.setItem(STORAGE_KEYS.FAL, fal);
      setFalApiKey(fal);
      fetchFalBalance(fal);
    }
  }, [fetchMuapiBalance, fetchFalBalance]);

  const handleMuapiClear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.MUAPI);
    setMuapiApiKey(null);
    setMuapiBalance(null);
    setMuapiError(false);
  }, []);

  const handleFalClear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.FAL);
    setFalApiKey(null);
    setFalBalance(null);
    setFalError(false);
  }, []);

  // Poll for balances every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (muapiApiKey) fetchMuapiBalance(muapiApiKey);
      if (falApiKey) fetchFalBalance(falApiKey);
    }, 30000);
    return () => clearInterval(interval);
  }, [muapiApiKey, falApiKey, fetchMuapiBalance, fetchFalBalance]);

  const hasSettingsError = useMemo(() => {
    return !muapiApiKey || !falApiKey || muapiError || falError;
  }, [muapiApiKey, falApiKey, muapiError, falError]);

  if (!hasMounted) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="animate-spin text-[#d9ff00] text-3xl">◌</div>
    </div>
  );

  // App is accessible if EITHER key is provided
  if (!muapiApiKey && !falApiKey || showOnboarding) {
    return (
      <ApiKeyModal 
        onSave={(keys) => {
          handleApiKeysSave(keys);
          setShowOnboarding(false);
        }} 
      />
    );
  }

  return (
    <div className="h-screen bg-[#030303] flex flex-col overflow-hidden text-white">
      <Toaster position="bottom-right" richColors theme="dark" />
      {/* Header */}
      <header className="flex-shrink-0 h-14 border-b border-white/[0.03] flex items-center justify-between px-6 bg-black/20 backdrop-blur-md z-40">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight hidden sm:block">OpenGenerativeAI</span>
        </div>

        {/* Center: Navigation */}
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative py-4 text-[13px] font-medium transition-all whitespace-nowrap px-1",
                activeTab === tab.id ? "text-[#d9ff00]" : "text-white/50 hover:text-white"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d9ff00] rounded-full" 
                />
              )}
            </button>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {muapiApiKey && (
              <ProviderBalance 
                provider="muapi" 
                balance={muapiBalance} 
                loading={muapiLoading}
                hasError={muapiError}
              />
            )}
            {falApiKey && (
              <ProviderBalance 
                provider="fal" 
                balance={falBalance} 
                loading={falLoading}
                hasError={falError}
              />
            )}
          </div>

          <div className="relative">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(true)}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#d9ff00] to-yellow-200 border border-white/20 cursor-pointer shadow-lg shadow-[#d9ff00]/10 flex items-center justify-center overflow-hidden" 
            >
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </motion.div>
            {hasSettingsError && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#030303] shadow-lg pointer-events-none z-10" 
              >
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Studio Content */}
      <div className="flex-1">
        {activeTab === 'image'   && (
          <ImageStudio   
            apiKey={muapiApiKey} 
            falApiKey={falApiKey} 
            triggerOnboarding={() => setShowOnboarding(true)}
          />
        )}
        {activeTab === 'video'   && (
          <VideoStudio   
            apiKey={muapiApiKey} 
            falApiKey={falApiKey} 
            triggerOnboarding={() => setShowOnboarding(true)}
          />
        )}
        {activeTab === 'lipsync' && (
          <LipSyncStudio 
            apiKey={muapiApiKey} 
            falApiKey={falApiKey} 
            triggerOnboarding={() => setShowOnboarding(true)}
          />
        )}
        {activeTab === 'cinema'  && (
          <CinemaStudio  
            apiKey={muapiApiKey} 
            falApiKey={falApiKey} 
            triggerOnboarding={() => setShowOnboarding(true)}
          />
        )}
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <SettingsModal 
            onClose={() => setShowSettings(false)}
            muapiApiKey={muapiApiKey}
            falApiKey={falApiKey}
            muapiBalance={muapiBalance}
            falBalance={falBalance}
            muapiError={muapiError}
            falError={falError}
            onSave={handleApiKeysSave}
            onClearMuapi={handleMuapiClear}
            onClearFal={handleFalClear}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SettingsModal({ onClose, muapiApiKey, falApiKey, muapiBalance, falBalance, muapiError, falError, onSave, onClearMuapi, onClearFal }) {
  const [muapiInput, setMuapiInput] = useState(muapiApiKey || '');
  const [falInput, setFalInput] = useState(falApiKey || '');
  const [isEditingMuapi, setIsEditingMuapi] = useState(!muapiApiKey);
  const [isEditingFal, setIsEditingFal] = useState(!falApiKey);

  const handleSave = () => {
    onSave({ muapi: muapiInput, fal: falInput });
    setIsEditingMuapi(false);
    setIsEditingFal(false);
  };

  const maskKey = (key) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return `${key.slice(0, 4)}••••${key.slice(-4)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        className="bg-[#0a0a0a] border border-white/10 rounded-xl p-8 w-full max-w-md shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="mb-8">
          <h2 className="text-white font-bold text-xl mb-1">Settings</h2>
          <p className="text-white/40 text-[13px]">
            Manage your API providers and authentication.
          </p>
        </div>
        
        <div className="space-y-6 mb-10">
          {/* Muapi Key Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-white/30 uppercase tracking-wider">
                Muapi.ai Provider
              </label>
              <div className="flex items-center gap-3">
                {muapiBalance !== null && !muapiError && (
                  <span className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Validated
                  </span>
                )}
                {muapiError && (
                   <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                    Invalid Key
                  </span>
                )}
                {muapiApiKey && !isEditingMuapi && (
                  <button 
                    onClick={() => setIsEditingMuapi(true)}
                    className="text-[10px] text-[#d9ff00]/60 hover:text-[#d9ff00] transition-colors font-bold"
                  >
                    Edit
                  </button>
                )}
                {muapiApiKey && (
                  <button 
                    onClick={onClearMuapi}
                    className="text-[10px] text-red-400/50 hover:text-red-400 transition-colors font-bold"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            {isEditingMuapi ? (
              <input
                type="password"
                value={muapiInput}
                onChange={(e) => setMuapiInput(e.target.value)}
                placeholder="Paste Muapi.ai key..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d9ff00]/50 transition-all"
              />
            ) : (
              <div className="w-full bg-white/[0.02] border border-white/[0.05] rounded-lg px-4 py-3 text-sm text-white/40 font-mono">
                {maskKey(muapiApiKey)}
              </div>
            )}
          </div>

          {/* Fal Key Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-white/30 uppercase tracking-wider">
                fal.ai Provider
              </label>
              <div className="flex items-center gap-3">
                {falBalance !== null && !falError && (
                  <span className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Validated
                  </span>
                )}
                {falError && (
                   <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                    Invalid Key
                  </span>
                )}
                {falApiKey && !isEditingFal && (
                  <button 
                    onClick={() => setIsEditingFal(true)}
                    className="text-[10px] text-[#d9ff00]/60 hover:text-[#d9ff00] transition-colors font-bold"
                  >
                    Edit
                  </button>
                )}
                {falApiKey && (
                  <button 
                    onClick={onClearFal}
                    className="text-[10px] text-red-400/50 hover:text-red-400 transition-colors font-bold"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            {isEditingFal ? (
              <input
                type="password"
                value={falInput}
                onChange={(e) => setFalInput(e.target.value)}
                placeholder="Paste fal.ai key..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#d9ff00]/50 transition-all"
              />
            ) : (
              <div className="w-full bg-white/[0.02] border border-white/[0.05] rounded-lg px-4 py-3 text-sm text-white/40 font-mono">
                {maskKey(falApiKey)}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 text-sm font-bold transition-all border border-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] h-12 rounded-xl bg-[#d9ff00] text-black hover:bg-[#e5ff33] text-sm font-bold transition-all shadow-lg shadow-[#d9ff00]/10"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}
