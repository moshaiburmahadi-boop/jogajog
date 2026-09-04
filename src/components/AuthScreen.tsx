import React, { useState } from 'react';
import { Login } from './Login';
import { SignUp } from './SignUp';

interface AuthScreenProps {
  onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between relative overflow-hidden px-4 py-8 select-none">
      {/* Subtle Apple Monochrome Ambient Glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-20 -left-20 w-80 h-80 bg-white/[0.02] rounded-full blur-2xl pointer-events-none" />

      {/* Top Bar with Brand */}
      <header className="relative z-10 max-w-md mx-auto w-full flex items-center justify-between pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold text-sm shadow-md">
            J
          </div>
          <div>
            <span className="font-extrabold tracking-wider text-sm uppercase text-white">jogajog</span>
            <span className="block text-[10px] text-zinc-400">Social Platform</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 max-w-md mx-auto w-full my-auto">
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl bg-zinc-950/90 backdrop-blur-2xl">
          {/* Mode Selector Tabs: Sign In / Sign Up */}
          <div className="flex p-1 rounded-2xl bg-zinc-900 border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => setMode('signin')}
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
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Strict Auth Form Components */}
          {mode === 'signin' ? (
            <Login
              onSuccess={onSuccess}
              onSwitchToSignUp={() => setMode('signup')}
            />
          ) : (
            <SignUp
              onSuccess={onSuccess}
              onSwitchToLogin={() => setMode('signin')}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-xs text-zinc-500">
        jogajog • End-to-End Encrypted Session Security
      </footer>
    </div>
  );
};
