'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ImageStudio, VideoStudio, LipSyncStudio, CinemaStudio, MarketingStudio, getUserBalance } from 'studio';

const TABS = [
  { id: 'image',     label: 'Image Studio',     available: true  },
  { id: 'video',     label: 'Video Studio',     available: true  },
  { id: 'lipsync',   label: 'Lip Sync',         available: true  },
  { id: 'cinema',    label: 'Cinema Studio',    available: true  },
  { id: 'marketing', label: 'Marketing Studio', available: true  },
  { id: 'workflows', label: 'Workflows',        available: false },
  { id: 'agents',    label: 'Agents',           available: false },
];

// Server-managed: API ключ fal.ai живёт только в .env.production на сервере
// (FAL_KEY), инжектится в запросы серверным прокси /api/fal/*. Клиент
// не видит и не хранит ключ.
const SERVER_MANAGED_KEY = '';

// ─── Coming Soon placeholder ─────────────────────────────────────────────────
function ComingSoon({ feature }) {
  return (
    <div className="h-full flex items-center justify-center bg-[#030303]">
      <div className="max-w-md text-center p-10 rounded-2xl border border-white/[0.05] bg-white/[0.02]">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#d9ff00]/10 border border-[#d9ff00]/20 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d9ff00" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h2 className="text-white text-2xl font-bold mb-3">Coming Soon</h2>
        <p className="text-white/50 text-sm leading-relaxed mb-6">
          Раздел <span className="text-[#d9ff00]">{feature}</span> появится в ближайших обновлениях.
        </p>
        <p className="text-white/30 text-xs">
          Следите за новостями на plugtown.ru
        </p>
      </div>
    </div>
  );
}

export default function StandaloneShell() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug || [];
  const idFromParams = params?.id;
  const tabFromParams = params?.tab;

  const getWorkflowInfo = useCallback(() => {
    if (idFromParams) {
      return { id: idFromParams, tab: tabFromParams || null };
    }
    const wfIndex = slug.findIndex((s) => s === 'workflows' || s === 'workflow');
    if (wfIndex === -1) return { id: null, tab: null };
    return { id: slug[wfIndex + 1] || null, tab: slug[wfIndex + 2] || null };
  }, [slug, idFromParams, tabFromParams]);

  const { id: urlWorkflowId } = getWorkflowInfo();

  const getInitialTab = () => {
    if (idFromParams || slug.includes('workflow')) return 'workflows';
    if (slug.includes('agents')) return 'agents';
    const firstSegment = slug[0];
    if (firstSegment && TABS.find((t) => t.id === firstSegment)) return firstSegment;
    return 'image';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [balance, setBalance] = useState(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState(null);

  useEffect(() => {
    const info = getWorkflowInfo();
    if (info.id) {
      setActiveTab('workflows');
    } else if (slug.includes('agents')) {
      setActiveTab('agents');
    } else {
      const firstSegment = slug[0];
      if (firstSegment && TABS.find((t) => t.id === firstSegment)) {
        setActiveTab(firstSegment);
      }
    }
  }, [slug, getWorkflowInfo]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    router.push(`/studio/${tabId}`);
  };

  useEffect(() => {
    const isEditingWorkflow = (activeTab === 'workflows' || !!idFromParams) && urlWorkflowId;
    if (isEditingWorkflow) setIsHeaderVisible(false);
    else setIsHeaderVisible(true);
  }, [activeTab, urlWorkflowId, idFromParams]);

  useEffect(() => {
    const fromBuilder = sessionStorage.getItem('fromWorkflowBuilder');
    if (fromBuilder && activeTab !== 'workflows') {
      sessionStorage.removeItem('fromWorkflowBuilder');
      window.location.reload();
    }
  }, [activeTab]);

  const fetchBalance = useCallback(async () => {
    try {
      const data = await getUserBalance(SERVER_MANAGED_KEY);
      setBalance(data?.balance ?? null);
    } catch (err) {
      console.error('Balance fetch failed:', err);
    }
  }, []);

  useEffect(() => {
    setHasMounted(true);
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) setDroppedFiles(files);
  }, []);

  const handleFilesHandled = useCallback(() => {
    setDroppedFiles(null);
  }, []);

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin text-[#d9ff00] text-3xl">◌</div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'image':
        return <ImageStudio apiKey={SERVER_MANAGED_KEY} droppedFiles={droppedFiles} onFilesHandled={handleFilesHandled} />;
      case 'video':
        return <VideoStudio apiKey={SERVER_MANAGED_KEY} droppedFiles={droppedFiles} onFilesHandled={handleFilesHandled} />;
      case 'lipsync':
        return <LipSyncStudio apiKey={SERVER_MANAGED_KEY} droppedFiles={droppedFiles} onFilesHandled={handleFilesHandled} />;
      case 'cinema':
        return <CinemaStudio apiKey={SERVER_MANAGED_KEY} />;
      case 'marketing':
        return <MarketingStudio apiKey={SERVER_MANAGED_KEY} droppedFiles={droppedFiles} onFilesHandled={handleFilesHandled} />;
      case 'workflows':
        return <ComingSoon feature="Workflows" />;
      case 'agents':
        return <ComingSoon feature="AI Agents" />;
      default:
        return <ComingSoon feature="Unknown" />;
    }
  };

  return (
    <div
      className="h-screen bg-[#030303] flex flex-col overflow-hidden text-white relative"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="fixed inset-0 z-[100] bg-[#d9ff00]/10 backdrop-blur-md border-4 border-dashed border-[#d9ff00]/50 flex items-center justify-center pointer-events-none transition-all duration-300">
          <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-4 scale-110 animate-pulse">
            <div className="w-20 h-20 bg-[#d9ff00] rounded-2xl flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-white">Drop your media here</span>
              <span className="text-sm text-white/40">Images, videos, or audio files</span>
            </div>
          </div>
        </div>
      )}

      {isHeaderVisible && (
        <header className="flex-shrink-0 h-14 border-b border-white/[0.03] flex items-center justify-between px-6 bg-black/20 backdrop-blur-md z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight hidden sm:block">OpenGenerativeAI</span>
          </div>

          <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative py-4 text-[13px] font-medium transition-all whitespace-nowrap px-1 ${
                  activeTab === tab.id
                    ? 'text-[#d9ff00]'
                    : tab.available
                      ? 'text-white/50 hover:text-white'
                      : 'text-white/20 hover:text-white/40'
                }`}
              >
                {tab.label}
                {!tab.available && (
                  <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-white/30">
                    soon
                  </span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d9ff00] rounded-full" />
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 transition-colors">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white/90">
                  {balance !== null ? `$${balance}` : 'fal.ai'}
                </span>
              </div>
            </div>
          </div>
        </header>
      )}

      <div className="flex-1 min-h-0 relative overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  );
}
