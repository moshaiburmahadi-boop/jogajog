import React, { useState } from 'react';
import { Download, X, Share, PlusSquare, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled || dismissed) return null;
  if (!isInstallable && !isIOS) return null;

  const handleAction = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
    } else {
      const installed = await promptInstall();
      if (installed) {
        setDismissed(true);
      }
    }
  };

  return (
    <>
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md animate-fade-in text-white">
        <div className="glass-card rounded-2xl p-3 border border-white/20 shadow-2xl flex items-center justify-between gap-3 bg-black/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>

            <div className="text-xs">
              <p className="font-bold text-white leading-tight">Install Glass Social</p>
              <p className="text-[11px] text-zinc-400">Install as Apple PWA on your home screen</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="pwa-banner-install-action"
              onClick={handleAction}
              className="px-3.5 py-1.5 rounded-full bg-white text-black font-bold text-xs hover:bg-zinc-200 shadow-md cursor-pointer"
            >
              {isIOS ? 'Instructions' : 'Install'}
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-full text-zinc-400 hover:text-white cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in text-white">
          <div className="w-full max-w-sm glass-panel rounded-3xl p-5 border border-white/20 shadow-2xl space-y-4 bg-black/95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Install on iOS</h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-900 border border-white/10">
                <Share className="w-5 h-5 text-white shrink-0" />
                <p>1. Tap the <strong>Share</strong> button at the bottom of Safari.</p>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-900 border border-white/10">
                <PlusSquare className="w-5 h-5 text-white shrink-0" />
                <p>2. Scroll down and tap <strong>Add to Home Screen</strong>.</p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer shadow-md"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
