import React from 'react';
import { 
  Home, 
  Compass, 
  PlusSquare, 
  Heart, 
  User as UserIcon
} from 'lucide-react';
import { NavigationTab } from '../types';

interface BottomDockProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenCreateModal: () => void;
  unreadNotificationsCount: number;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreateModal,
  unreadNotificationsCount,
}) => {
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md">
      <div className="glass-dock rounded-full px-3 py-2 flex items-center justify-around shadow-2xl shadow-black border border-white/15 bg-black/90 text-white">
        {/* Home / Feed */}
        <button
          id="dock-tab-feed"
          onClick={() => onSelectTab('feed')}
          className={`relative p-2.5 rounded-full transition-all duration-300 cursor-pointer ${
            currentTab === 'feed'
              ? 'bg-white text-black scale-105 shadow-md shadow-white/20 font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
          title="Feed"
        >
          <Home className="w-5 h-5" />
          {currentTab === 'feed' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full" />
          )}
        </button>

        {/* Explore */}
        <button
          id="dock-tab-explore"
          onClick={() => onSelectTab('explore')}
          className={`relative p-2.5 rounded-full transition-all duration-300 cursor-pointer ${
            currentTab === 'explore'
              ? 'bg-white text-black scale-105 shadow-md shadow-white/20 font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
          title="Explore"
        >
          <Compass className="w-5 h-5" />
          {currentTab === 'explore' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full" />
          )}
        </button>

        {/* Create Post Center Button */}
        <button
          id="dock-tab-create"
          onClick={onOpenCreateModal}
          className="p-3 rounded-full bg-white hover:bg-zinc-200 text-black shadow-xl shadow-white/15 hover:scale-110 active:scale-95 transition-all duration-200 border border-white cursor-pointer"
          title="Create New Post"
        >
          <PlusSquare className="w-5 h-5 text-black stroke-[2.5]" />
        </button>

        {/* Activity / Notifications */}
        <button
          id="dock-tab-notifications"
          onClick={() => onSelectTab('notifications')}
          className={`relative p-2.5 rounded-full transition-all duration-300 cursor-pointer ${
            currentTab === 'notifications'
              ? 'bg-white text-black scale-105 shadow-md shadow-white/20 font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
          title="Notifications"
        >
          <Heart className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full ring-2 ring-black" />
          )}
          {currentTab === 'notifications' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full" />
          )}
        </button>

        {/* Profile */}
        <button
          id="dock-tab-profile"
          onClick={() => onSelectTab('profile')}
          className={`relative p-2.5 rounded-full transition-all duration-300 cursor-pointer ${
            currentTab === 'profile'
              ? 'bg-white text-black scale-105 shadow-md shadow-white/20 font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
          title="Profile"
        >
          <UserIcon className="w-5 h-5" />
          {currentTab === 'profile' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full" />
          )}
        </button>
      </div>
    </nav>
  );
};
