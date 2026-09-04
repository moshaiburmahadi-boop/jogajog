import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { signInUser } from '../lib/supabase';

interface LoginProps {
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await signInUser({
        email: email.trim(),
        password,
      });

      if (!res.success) {
        // STRICT: completely block access, no bypassing, display red error
        setErrorMessage(res.error || 'Invalid login credentials. Access denied.');
        setLoading(false);
        return;
      }

      // Successful verified session
      setLoading(false);
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1.5">
          Sign In
        </h2>
        <p className="text-xs text-zinc-400">
          Enter your registered email and password to access jogajog.
        </p>
      </div>

      {/* Red Error State (Access Blocked) */}
      {errorMessage && (
        <div 
          role="alert"
          className="mb-4 p-3 rounded-2xl bg-red-950/50 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-fade-in"
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Authenticating...</span>
            </span>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Sign Up */}
      <div className="mt-6 pt-4 border-t border-white/10 text-center">
        <p className="text-xs text-zinc-400">
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-white font-semibold hover:underline cursor-pointer ml-1"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
};
