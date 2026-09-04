import React, { useState } from 'react';
import { Heart, MessageCircle, UserPlus, AtSign, Bell } from 'lucide-react';
import { NotificationItem, User } from '../types';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  currentUser: User;
  onFollowToggle?: (userId: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  currentUser,
  onFollowToggle,
}) => {
  const [filter, setFilter] = useState<'all' | 'likes' | 'comments' | 'follows'>('all');
  const [followedUsers, setFollowedUsers] = useState<Record<string, boolean>>({});

  const handleToggleFollow = (userId: string) => {
    setFollowedUsers((prev) => ({ ...prev, [userId]: !prev[userId] }));
    onFollowToggle?.(userId);
  };

  const filtered = notifications.filter((item) => {
    if (filter === 'likes') return item.type === 'like';
    if (filter === 'comments') return item.type === 'comment';
    if (filter === 'follows') return item.type === 'follow';
    return true;
  });

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 pb-28 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-white" />
          <h2 className="font-bold text-white text-lg">Activity</h2>
        </div>
        <span className="text-xs text-zinc-400">All caught up</span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 mb-6 p-1 rounded-full bg-zinc-900 border border-white/10 w-fit">
        {(['all', 'likes', 'comments', 'follows'] as const).map((tab) => (
          <button
            key={tab}
            id={`notif-filter-${tab}`}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
              filter === tab
                ? 'bg-white text-black shadow-sm font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notification Stream */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 border border-white/10 text-center space-y-3 bg-black/80">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/15 flex items-center justify-center mx-auto text-zinc-400">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white">No Notifications Yet</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              When people like your posts, comment, or start following you, you will see alerts here.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isFollowing = followedUsers[item.user.id];

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl glass-card flex items-center justify-between gap-3 border border-white/10 bg-black/80 transition-all hover:border-white/25"
              >
                {/* User Avatar with Action Badge */}
                <div className="relative shrink-0">
                  <img
                    src={item.user.avatar}
                    alt={item.user.name}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover ring-1 ring-white/20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border border-black bg-zinc-900 shadow-md">
                    {item.type === 'like' && <Heart className="w-2.5 h-2.5 text-white fill-white" />}
                    {item.type === 'comment' && <MessageCircle className="w-2.5 h-2.5 text-white" />}
                    {item.type === 'follow' && <UserPlus className="w-2.5 h-2.5 text-white" />}
                    {item.type === 'mention' && <AtSign className="w-2.5 h-2.5 text-white" />}
                  </div>
                </div>

                {/* Notification Description */}
                <div className="flex-1 min-w-0 text-xs">
                  <p className="text-zinc-300 leading-snug">
                    <span className="font-bold text-white mr-1.5 hover:underline cursor-pointer">
                      {item.user.username}
                    </span>
                    {item.type === 'like' && 'liked your post.'}
                    {item.type === 'comment' && 'commented on your post.'}
                    {item.type === 'follow' && 'started following you.'}
                    {item.type === 'mention' && 'mentioned you in a comment.'}
                  </p>
                  <span className="text-[10px] text-zinc-500">{item.createdAt}</span>
                </div>

                {/* Target Post Thumbnail or Follow Button */}
                {item.type === 'follow' ? (
                  <button
                    onClick={() => handleToggleFollow(item.user.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isFollowing
                        ? 'bg-zinc-900 text-zinc-300 border border-white/10'
                        : 'bg-white text-black font-bold hover:bg-zinc-200'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                ) : item.targetPost ? (
                  <img
                    src={item.targetPost.imageUrl}
                    alt="Target thumbnail"
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
