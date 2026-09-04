import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { signInUser, signUpUser } from '../lib/supabase';

interface AuthScreenProps {
  onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signInUser({ email, password });
        if (!res.success) {
          setError(res.error || 'Invalid credentials.');
          setLoading(false);
          return;
        }
        setSuccessMsg(`Welcome back, ${res.user?.name || res.user?.username}! Redirecting to Home...`);
      } else {
        const res = await signUpUser({
          email,
          password,
          name,
          username: username || email.split('@')[0],
        });
        if (!res.success) {
          setError(res.error || 'Failed to create account.');
          setLoading(false);
          return;
        }
        setSuccessMsg(`Account created! Welcome, ${res.user?.name}! Redirecting to Home...`);
      }

      // Realtime transition to Home
      setTimeout(() => {
        setLoading(false);
        onSuccess();
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Authentication error.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between relative overflow-hidden px-4 py-8 select-none">
      {/* Subtle Apple Monochrome Ambient Glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-20 -left-20 w-80 h-80 bg-white/[0.02] rounded-full blur-2xl pointer-events-none" />

      {/* Top Bar with Brand */}
      <header className="relative z-10 max-w-md mx-auto w-full flex items-center justify-between pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold text-sm shadow-md">
            L
          </div>
          <div>
            <span className="font-extrabold tracking-wider text-sm uppercase text-white">Lumina</span>
            <span className="block text-[10px] text-zinc-400">Monochrome Social PWA</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 max-w-md mx-auto w-full my-auto">
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl bg-zinc-950/90 backdrop-blur-2xl">
          {/* Card Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5">
              {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
            </h1>
            <p className="text-xs text-zinc-400">
              {mode === 'signin'
                ? 'Sign in to access your feed, messages, and profile.'
                : 'Join the monochrome glass community today.'}
            </p>
          </div>

          {/* Mode Tabs: Sign In / Sign Up */}
          <div className="flex p-1 rounded-2xl bg-zinc-900 border border-white/10 mb-5">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-zinc-900 border border-white/30 text-white text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      required
                      className="w-full glass-input pl-10 pr-3.5 py-2.5 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="alex_creator"
                      required
                      className="w-full glass-input pl-8 pr-3.5 py-2.5 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@domain.com"
                  required
                  className="w-full glass-input pl-10 pr-3.5 py-2.5 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={4}
                  className="w-full glass-input pl-10 pr-10 py-2.5 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-xs text-zinc-500">
        Designed in Apple Glassmorphism • Pure Black & White Minimalist
      </footer>
    </div>
  );
};
