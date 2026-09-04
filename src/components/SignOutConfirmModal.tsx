import React, { useEffect } from 'react';
import { LogOut, X } from 'lucide-react';

interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username?: string;
}

export const SignOutConfirmModal: React.FC<SignOutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  username,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        aria-hidden="true" 
      />

      {/* Dialog Card */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="signout-modal-title"
        className="relative z-10 w-full max-w-sm rounded-3xl p-6 border border-white/15 bg-zinc-950/95 shadow-2xl backdrop-blur-2xl text-center"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mx-auto mb-4 text-white">
          <LogOut className="w-6 h-6" />
        </div>

        {/* Title */}
        <h3 id="signout-modal-title" className="text-lg font-bold text-white mb-2">
          Sign Out of Account?
        </h3>

        {/* Subtitle */}
        <p className="text-xs text-zinc-400 leading-relaxed mb-6">
          {username ? (
            <>Are you sure you want to log out from <span className="text-zinc-200 font-semibold">@{username}</span>? You will need to enter your password to sign back in.</>
          ) : (
            <>Are you sure you want to log out? You will need to enter your email and password to access your feed and messages again.</>
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-white/10 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-black bg-white hover:bg-zinc-200 transition-all shadow-md cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
