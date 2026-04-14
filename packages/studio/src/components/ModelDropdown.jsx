"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { memo } from "react";

/**
 * Standardized Badge for Providers
 */
const ProviderBadge = memo(({ provider }) => {
  const isFal = provider === 'fal';
  return (
    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border transition-colors ${
      isFal 
        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
        : 'bg-[#d9ff00]/10 text-[#d9ff00] border-[#d9ff00]/20'
    }`}>
      {provider || 'muapi'}
    </span>
  );
});

ProviderBadge.displayName = 'ProviderBadge';

/**
 * Individual Model Item - Memoized for performance
 */
const ModelItem = memo(({ model, isSelected, onSelect }) => {
  const isFal = model.provider === 'fal';
  
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(model);
      }}
      className={`flex items-center justify-between p-3.5 hover:bg-white/5 rounded-lg cursor-pointer transition-all border border-transparent hover:border-white/5 ${
        isSelected ? "bg-white/5 border-white/5" : ""
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`w-10 h-10 ${
            model.family === "kontext"
              ? "bg-blue-500/10 text-blue-400"
              : model.family === "effects"
                ? "bg-purple-500/10 text-purple-400"
                : isFal 
                  ? "bg-purple-500/10 text-purple-500"
                  : "bg-primary/10 text-primary"
          } border border-white/5 rounded-full flex items-center justify-center font-bold text-xs shadow-inner uppercase`}
        >
          {model.name.charAt(0)}
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white tracking-tight">
              {model.name}
            </span>
            <ProviderBadge provider={model.provider} />
          </div>
        </div>
      </div>
      {isSelected && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#d9ff00"
          strokeWidth="4"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  );
});

ModelItem.displayName = 'ModelItem';

const RECENT_KEY = "hg_recent_models";

/**
 * Shared ModelDropdown component
 * Handles 150+ models with grouping, search, and recently used tracking.
 */
export default function ModelDropdown({ models, selectedModel, onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const [recentIds, setRecentIds] = useState([]);

  // Load recently used models from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) {
        setRecentIds(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load recent models", e);
    }
  }, []);

  const handleSelect = useCallback((model) => {
    // Update recently used
    const newRecent = [model.id, ...recentIds.filter(id => id !== model.id)].slice(0, 5);
    setRecentIds(newRecent);
    localStorage.setItem(RECENT_KEY, JSON.stringify(newRecent));
    
    onSelect(model);
    onClose();
  }, [recentIds, onSelect, onClose]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return models.filter(
      (m) =>
        m.name.toLowerCase().includes(s) ||
        m.id.toLowerCase().includes(s),
    );
  }, [models, search]);

  const grouped = useMemo(() => {
    // Recently used models (top 5) - only those that are in the current models list
    const currentModelIds = new Set(models.map(m => m.id));
    const recent = recentIds
      .filter(id => currentModelIds.has(id))
      .map(id => models.find(m => m.id === id))
      .slice(0, 5);

    // Fal models (grouped)
    const fal = filtered.filter(m => m.provider === 'fal');
    
    // Muapi models (grouped)
    const muapi = filtered.filter(m => m.provider !== 'fal');

    return { recent, fal, muapi };
  }, [filtered, models, recentIds]);

  const hasSearch = search.trim().length > 0;

  return (
    <div className="flex flex-col gap-2 h-full max-h-[60vh] w-full min-w-[300px]">
      <div className="border-b border-white/5 shrink-0 px-1 pb-3">
        <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5 border border-white/5 focus-within:border-primary/50 transition-colors">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-white/40"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search 150+ models..."
            value={search}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-xs text-white focus:ring-0 w-full p-0 focus:outline-none"
            autoFocus
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-1 pb-2">
        {/* Recently Used (only show if no search) */}
        {!hasSearch && grouped.recent.length > 0 && (
          <div className="flex flex-col gap-1.5 mb-2">
            <div className="text-[10px] font-black uppercase text-white/30 tracking-widest px-3.5 py-2">
              Recently Used
            </div>
            {grouped.recent.map(m => (
              <ModelItem 
                key={`recent-${m.id}`} 
                model={m} 
                isSelected={selectedModel === m.id} 
                onSelect={handleSelect} 
              />
            ))}
            <div className="h-px bg-white/5 mx-3.5 my-1" />
          </div>
        )}

        {/* Fal.ai Models */}
        {grouped.fal.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="text-[10px] font-black uppercase text-white/30 tracking-widest px-3.5 py-2 flex items-center gap-2">
              fal.ai Models
              <span className="bg-purple-500/10 text-purple-400 text-[8px] px-1.5 py-0.5 rounded-full border border-purple-500/20">
                {grouped.fal.length}
              </span>
            </div>
            {grouped.fal.map(m => (
              <ModelItem 
                key={m.id} 
                model={m} 
                isSelected={selectedModel === m.id} 
                onSelect={handleSelect} 
              />
            ))}
          </div>
        )}

        {/* Muapi Models */}
        {grouped.muapi.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="text-[10px] font-black uppercase text-white/30 tracking-widest px-3.5 py-2 flex items-center gap-2">
              muapi.ai Models
              <span className="bg-[#d9ff00]/10 text-[#d9ff00] text-[8px] px-1.5 py-0.5 rounded-full border border-[#d9ff00]/20">
                {grouped.muapi.length}
              </span>
            </div>
            {grouped.muapi.map(m => (
              <ModelItem 
                key={m.id} 
                model={m} 
                isSelected={selectedModel === m.id} 
                onSelect={handleSelect} 
              />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <span className="text-xs text-white/30 font-medium">No models found matching "{search}"</span>
          </div>
        )}
      </div>
    </div>
  );
}
