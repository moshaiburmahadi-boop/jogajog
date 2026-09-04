import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Copy, 
  Check, 
  ShieldCheck, 
  Radio, 
  HardDrive, 
  Key, 
  Code2
} from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../lib/supabaseSchema';
import { activeSupabaseUrl, activeSupabaseKey, isSupabaseConfigured } from '../lib/supabase';

interface SupabaseDocsModalProps {
  onClose: () => void;
}

export const SupabaseDocsModal: React.FC<SupabaseDocsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'rls' | 'realtime' | 'connect'>('sql');
  const [copied, setCopied] = useState(false);
  const [urlInput, setUrlInput] = useState(activeSupabaseUrl);
  const [keyInput, setKeyInput] = useState(activeSupabaseKey);
  const [connectSaved, setConnectSaved] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('glass_supabase_url', urlInput.trim());
    localStorage.setItem('glass_supabase_key', keyInput.trim());
    setConnectSaved(true);
    setTimeout(() => {
      setConnectSaved(false);
      window.location.reload();
    }, 600);
  };

  const handleClearConnection = () => {
    localStorage.removeItem('glass_supabase_url');
    localStorage.removeItem('glass_supabase_key');
    setUrlInput('');
    setKeyInput('');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 animate-fade-in text-white">
      <div className="relative w-full max-w-2xl h-[90vh] glass-panel rounded-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden bg-black/95">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/20 flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Supabase Backend Architecture</h2>
              <p className="text-[11px] text-zinc-400">PostgreSQL Schemas, RLS Policies, Realtime & Storage</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-2.5 border-b border-white/10 overflow-x-auto no-scrollbar bg-black/60">
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>SQL Schema (DDL)</span>
          </button>

          <button
            onClick={() => setActiveTab('rls')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'rls'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>RLS Policies</span>
          </button>

          <button
            onClick={() => setActiveTab('realtime')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'realtime'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Realtime & Storage</span>
          </button>

          <button
            onClick={() => setActiveTab('connect')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'connect'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Connect Live Project</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar space-y-4">
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-300">
                  Run this full SQL script in the <strong>Supabase SQL Editor</strong> to bootstrap all tables, relations, triggers, and indices:
                </p>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>

              <div className="rounded-2xl bg-zinc-950 border border-white/10 p-4 font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-[55vh]">
                <pre>{SUPABASE_SQL_SCHEMA}</pre>
              </div>
            </div>
          )}

          {activeTab === 'rls' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-white" />
                Row Level Security (RLS) Architecture
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Supabase enforces PostgreSQL RLS on every table to guarantee that user data and private messages remain secure:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="glass-card rounded-xl p-3 border border-white/10 space-y-1 bg-zinc-950">
                  <h4 className="font-semibold text-white text-xs">profiles</h4>
                  <p className="text-[11px] text-zinc-400">
                    Publicly readable; write access strictly restricted to <code className="text-white bg-zinc-900 px-1 py-0.5 rounded">auth.uid() = id</code>.
                  </p>
                </div>

                <div className="glass-card rounded-xl p-3 border border-white/10 space-y-1 bg-zinc-950">
                  <h4 className="font-semibold text-white text-xs">posts & media</h4>
                  <p className="text-[11px] text-zinc-400">
                    Publicly readable; insert/update/delete restricted to post owner (<code className="text-white bg-zinc-900 px-1 py-0.5 rounded">auth.uid() = user_id</code>).
                  </p>
                </div>

                <div className="glass-card rounded-xl p-3 border border-white/10 space-y-1 bg-zinc-950">
                  <h4 className="font-semibold text-white text-xs">conversations & messages</h4>
                  <p className="text-[11px] text-zinc-400">
                    Only participants can query or receive realtime streams.
                  </p>
                </div>

                <div className="glass-card rounded-xl p-3 border border-white/10 space-y-1 bg-zinc-950">
                  <h4 className="font-semibold text-white text-xs">stories</h4>
                  <p className="text-[11px] text-zinc-400">
                    Filter automatically validates 24h ephemeral lifecycles.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'realtime' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-white" />
                  Supabase Realtime Broadcast Configuration
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Realtime replication allows live chat messages, likes counters, and notifications to stream over WebSockets:
                </p>
                <div className="rounded-xl bg-zinc-950 p-3 border border-white/10 font-mono text-[11px] text-white">
                  ALTER PUBLICATION supabase_realtime ADD TABLE public.posts, public.messages, public.post_likes, public.notifications;
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-white" />
                  Supabase Storage Buckets
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Configured public media buckets for user uploads:
                </p>
                <ul className="text-xs text-zinc-300 space-y-1.5 list-disc list-inside">
                  <li><code className="text-white font-mono">avatars</code>: Profile photo storage</li>
                  <li><code className="text-white font-mono">posts</code>: High-resolution post media</li>
                  <li><code className="text-white font-mono">stories</code>: Ephemeral 24h media</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'connect' && (
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-3 bg-zinc-950">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Live Supabase Credentials
                  </h3>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full border ${
                      isSupabaseConfigured
                        ? 'bg-white text-black font-bold border-white'
                        : 'bg-zinc-900 text-zinc-400 border-white/10'
                    }`}
                  >
                    {isSupabaseConfigured ? 'Connected to Supabase' : 'Local Fast Mock State'}
                  </span>
                </div>

                <form onSubmit={handleSaveConnection} className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Project URL
                    </label>
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://xyzproject.supabase.co"
                      className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Anon Public API Key
                    </label>
                    <input
                      type="password"
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                      className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors shadow-md cursor-pointer"
                    >
                      {connectSaved ? 'Connected!' : 'Save & Reload'}
                    </button>

                    {isSupabaseConfigured && (
                      <button
                        type="button"
                        onClick={handleClearConnection}
                        className="px-3.5 py-2 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white text-xs border border-white/10 transition-colors cursor-pointer"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
