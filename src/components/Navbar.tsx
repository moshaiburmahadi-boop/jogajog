import React from 'react';
import { 
  Sparkles, 
  Download, 
  MessageCircle, 
  Wifi, 
  WifiOff, 
  LogIn,
  LogOut,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { NavigationTab, User } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  unreadMessagesCount: number;
  currentUser: User;
  isLoggedIn: boolean;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  unreadMessagesCount,
  currentUser,
  isLoggedIn,
  onOpenAuthModal,
  onSignOut,
}) => {
  const { isInstallable, isIOS, isInstalled, promptInstall } = usePWAInstall();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-black/90 border-b border-white/10 transition-all text-white">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo - Pure Black and White Aesthetic */}
        <div 
          onClick={() => onSelectTab('feed')}
          className="flex items-center gap-2.5 cursor-pointer group"
          id="navbar-brand-button"
        >
          <div className="w-9 h-9 rounded-xl bg-white text-black border border-white/20 flex items-center justify-center shadow-lg shadow-white/10 group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-5 h-5 text-black fill-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-white text-lg">jogajog</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded-full bg-zinc-900 text-white border border-white/15">
                App
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Online / Offline Status */}
          <div 
            title={isOnline ? 'Online (Realtime connected)' : 'Offline mode (Cached via PWA)'}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-900 border border-white/10 text-zinc-300"
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-zinc-300">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-400" />
                <span className="text-[11px] text-amber-300">Offline</span>
              </>
            )}
          </div>

          {/* PWA Install Button */}
          {(!isInstalled && (isInstallable || isIOS)) && (
            <button
              id="navbar-pwa-install-btn"
              onClick={promptInstall}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white border border-white/20 shadow-md backdrop-blur-md transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          {/* Messages Quick Access */}
          <button
            id="navbar-messages-btn"
            onClick={() => onSelectTab('messages')}
            className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
              currentTab === 'messages'
                ? 'bg-white text-black border-white'
                : 'bg-zinc-900 hover:bg-zinc-800 text-white border-white/10'
            }`}
            title="Direct Messages"
          >
            <MessageCircle className="w-4.5 h-4.5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border border-black">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          {/* Authentication CTA */}
          {isLoggedIn ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onSelectTab('profile')}
                className="flex items-center gap-2 p-1 pr-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/15 transition-all cursor-pointer"
                title="Your Profile"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-white/20"
                />
                <span className="text-xs font-semibold text-white hidden md:inline max-w-[90px] truncate">
                  {currentUser.username}
                </span>
              </button>

              <button
                onClick={onSignOut}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="navbar-auth-btn"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all shadow-md shadow-white/10 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-black" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
