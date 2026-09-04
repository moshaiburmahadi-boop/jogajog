import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, AlertCircle, ArrowRight } from 'lucide-react';
import { signUpUser } from '../lib/supabase';

interface SignUpProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side quick boundary checks
    if (!email.trim() || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await signUpUser({
        email: email.trim(),
        password,
        name: name.trim() || username.trim() || email.split('@')[0],
        username: username.trim() || email.split('@')[0],
      });

      if (!res.success) {
        // Strict failure: display actual message returned by Supabase
        setErrorMessage(res.error || 'Failed to create account. Please check your credentials.');
        setLoading(false);
        return;
      }

      setSuccessMessage('Registration successful! Redirecting to feed...');
      setTimeout(() => {
        setLoading(false);
        onSuccess();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unexpected error occurred during sign up.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1.5">
          Create Your Account
        </h2>
        <p className="text-xs text-zinc-400">
          Sign up with your credentials to join jogajog.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div 
          role="alert"
          className="mb-4 p-3 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 animate-fade-in"
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      {/* Success Banner */}
      {successMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-zinc-900 border border-white/20 text-white text-xs flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="leading-snug">{successMessage}</span>
        </div>
      )}

      {/* Sign-Up Form */}
      <form onSubmit={handleSignUp} className="space-y-4">
        {/* Full Name Input */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <UserIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>
        </div>

        {/* Username Input */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 text-xs font-mono">
              @
            </div>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
              placeholder="username"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>
        </div>

        {/* Email Input */}
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

        {/* Password Input */}
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
            Password (min 6 characters)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Verifying with Supabase...</span>
            </span>
          ) : (
            <>
              <span>Sign Up</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 pt-4 border-t border-white/10 text-center">
        <p className="text-xs text-zinc-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-white font-semibold hover:underline cursor-pointer ml-1"
          >
            Sign In here
          </button>
        </p>
      </div>
    </div>
  );
};
