import React, { useState } from 'react';
import { 
  Grid, 
  Bookmark, 
  Settings, 
  Share2, 
  CheckCircle2, 
  MapPin, 
  Link as LinkIcon, 
  Plus, 
  Edit3,
  X,
  Check,
  LogOut,
  LogIn,
  Trash2,
  Camera
} from 'lucide-react';
import { User, Post } from '../types';
import { clearAllLocalData } from '../lib/supabase';

interface ProfileViewProps {
  currentUser: User;
  userPosts: Post[];
  savedPosts: Post[];
  isLoggedIn: boolean;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
  onSelectPost: (post: Post) => void;
  onUpdateUser: (updates: Partial<User>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  userPosts,
  savedPosts,
  isLoggedIn,
  onOpenAuthModal,
  onSignOut,
  onSelectPost,
  onUpdateUser,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [website, setWebsite] = useState(currentUser.website || '');
  const [location, setLocation] = useState(currentUser.location || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [copiedShare, setCopiedShare] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name: name.trim(),
      bio: bio.trim(),
      website: website.trim(),
      location: location.trim(),
      avatar: avatar.trim() || currentUser.avatar,
    });
    setIsEditingProfile(false);
  };

  const handleShareProfile = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleClearData = () => {
    clearAllLocalData();
    setShowClearConfirm(false);
  };

  const displayedPosts = activeTab === 'posts' ? userPosts : savedPosts;

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 pb-28 text-white">
      {/* Profile Header Card */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/15 shadow-2xl mb-6 bg-black/85">
        <div className="space-y-4">
          {/* Top Row: Avatar & Stats */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full p-1 border-2 border-white/40 shadow-lg bg-black">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full bg-zinc-900"
                />
              </div>
            </div>

            <div className="flex-1 flex justify-around text-center">
              <div>
                <p className="font-bold text-white text-base">{currentUser.postsCount}</p>
                <p className="text-[11px] text-zinc-400">Posts</p>
              </div>
              <div>
                <p className="font-bold text-white text-base">
                  {currentUser.followersCount > 999 
                    ? `${(currentUser.followersCount / 1000).toFixed(1)}k` 
                    : currentUser.followersCount}
                </p>
                <p className="text-[11px] text-zinc-400">Followers</p>
              </div>
              <div>
                <p className="font-bold text-white text-base">{currentUser.followingCount}</p>
                <p className="text-[11px] text-zinc-400">Following</p>
              </div>
            </div>
          </div>

          {/* User Bio & Meta Details */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg text-white tracking-tight">{currentUser.name}</h2>
              {currentUser.verified && (
                <CheckCircle2 className="w-4 h-4 text-white fill-white/20" />
              )}
            </div>
            <p className="text-xs text-zinc-400 font-medium">@{currentUser.username}</p>

            {currentUser.bio && (
              <p className="text-xs text-zinc-200 mt-2 leading-relaxed whitespace-pre-line">
                {currentUser.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-3 mt-3 text-xs text-zinc-400">
              {currentUser.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{currentUser.location}</span>
                </div>
              )}
              {currentUser.website && (
                <a
                  href={currentUser.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-white font-medium hover:underline"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>{currentUser.website.replace('https://', '')}</span>
                </a>
              )}
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setIsEditingProfile(true)}
              className="flex-1 py-2 px-3 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={handleShareProfile}
              className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium border border-white/15 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Share profile link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedShare ? 'Copied' : 'Share'}</span>
            </button>

            {isLoggedIn ? (
              <button
                onClick={onSignOut}
                className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-white/15 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="py-2 px-3 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-white/20 shadow-2xl bg-black/95">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base text-white">Edit Profile</h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-left">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 hover:bg-zinc-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs Row: Posts vs Saved */}
      <div className="flex border-b border-white/10 mb-4">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'posts'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts ({userPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'saved'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved ({savedPosts.length})</span>
        </button>
      </div>

      {/* Grid of Posts */}
      {displayedPosts.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 border border-white/10 text-center space-y-3 bg-black/80">
          <div className="w-14 h-14 rounded-full bg-zinc-900 border border-white/15 flex items-center justify-center mx-auto">
            {activeTab === 'posts' ? (
              <Camera className="w-6 h-6 text-zinc-400" />
            ) : (
              <Bookmark className="w-6 h-6 text-zinc-400" />
            )}
          </div>
          <h3 className="text-sm font-bold text-white">
            {activeTab === 'posts' ? 'No Posts Shared Yet' : 'No Saved Posts Yet'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            {activeTab === 'posts'
              ? 'When you capture photos or write posts, they will appear here.'
              : 'Bookmark any post you like in your feed to save it for later.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {displayedPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => onSelectPost(post)}
              className="relative aspect-square bg-zinc-900 rounded-xl overflow-hidden cursor-pointer group border border-white/10"
            >
              {post.media[0] && (
                <img
                  src={post.media[0].url}
                  alt={post.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
                <span>❤️ {post.likesCount}</span>
                <span>💬 {post.commentsCount}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reset / Delete Local Data Option */}
      <div className="mt-12 pt-6 border-t border-white/10 text-center">
        {showClearConfirm ? (
          <div className="p-4 rounded-2xl bg-zinc-950 border border-white/20 space-y-2">
            <p className="text-xs text-white font-semibold">
              Are you sure you want to delete all local posts and start completely fresh?
            </p>
            <div className="flex gap-2 justify-center pt-1">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                className="px-4 py-1.5 rounded-lg bg-white text-black font-bold text-xs hover:bg-zinc-200 cursor-pointer"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset / Wipe All App Posts</span>
          </button>
        )}
      </div>
    </div>
  );
};
