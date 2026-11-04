import React, { useState, useEffect } from 'react';
import { getApiBaseUrl, setApiBaseUrl, apiClient } from '../services/apiClient';
import { Server, CheckCircle2, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

export const BackendConnectionBar: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [inputUrl, setInputUrl] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const checkConnection = async (urlToCheck?: string) => {
    setIsChecking(true);
    setStatusMessage('Checking server health...');
    try {
      const health = await apiClient.checkHealth(urlToCheck);
      if (health && health.status === 'ok') {
        setIsConnected(true);
        setStatusMessage(
          `Connected: ${health.database?.engine || 'Neon PostgreSQL'} (${health.storage?.provider || 'Storage Ready'})`
        );
      } else {
        setIsConnected(false);
        setStatusMessage('Unable to reach server. Please verify your Render URL.');
      }
    } catch {
      setIsConnected(false);
      setStatusMessage('Server offline or unreachable.');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const active = getApiBaseUrl();
    setCurrentUrl(active);
    setInputUrl(active.replace(/\/api\/?$/, ''));

    // Check health on mount
    if (active) {
      checkConnection(active);
    } else {
      setIsConnected(false);
      setIsExpanded(true); // Automatically expand if no backend is configured yet
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    const formatted = inputUrl.trim().replace(/\/+$/, '');
    setApiBaseUrl(formatted);
    const newActive = getApiBaseUrl();
    setCurrentUrl(newActive);
    await checkConnection(newActive);
  };

  const isRemote =
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';

  // If already connected and on localhost, keep it minimal
  if (isConnected && !isRemote && !isExpanded) {
    return null;
  }

  return (
    <div className={`w-full text-xs border-b transition-colors ${
      isConnected
        ? 'bg-emerald-950/80 border-emerald-800 text-emerald-100'
        : 'bg-amber-950/90 border-amber-800 text-amber-100'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Server className="w-3.5 h-3.5 shrink-0 text-[#F5B700]" />
          <span className="font-bold">
            {isConnected ? 'Backend API Active:' : 'Backend Setup Required:'}
          </span>
          <span className="font-mono text-[11px] truncate text-slate-200">
            {currentUrl || 'No Render URL set'}
          </span>
          {isConnected ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              <span>Live Neon DB</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded-full">
              <AlertCircle className="w-3 h-3" />
              <span>Paste Render URL</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {statusMessage && (
            <span className="hidden md:inline text-[11px] text-slate-300">
              {statusMessage}
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Hide' : 'Configure Render URL'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-3 pt-1 border-t border-white/10">
          <form onSubmit={handleSave} className="flex flex-wrap items-center gap-2">
            <label htmlFor="render-url-input" className="text-xs font-semibold text-white whitespace-nowrap">
              Render Backend URL:
            </label>
            <input
              id="render-url-input"
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://nsl-portal-api.onrender.com"
              className="flex-1 min-w-[260px] px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-white placeholder:text-slate-400 font-mono text-xs focus:outline-none focus:border-[#F5B700]"
            />
            <button
              type="submit"
              disabled={isChecking}
              className="px-3.5 py-1.5 rounded-lg bg-[#F5B700] hover:bg-[#e0a800] text-[#0B1F3A] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isChecking && <RefreshCw className="w-3 h-3 animate-spin" />}
              <span>Connect & Save</span>
            </button>
            <button
              type="button"
              onClick={() => checkConnection(inputUrl)}
              disabled={isChecking || !inputUrl}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              Test
            </button>
          </form>
          <p className="text-[11px] text-slate-300 mt-1.5">
            Paste the URL of your Render Web Service. It will be saved in your browser and used for all citizen submissions, evidence uploads, and admin authentication.
          </p>
        </div>
      )}
    </div>
  );
};
