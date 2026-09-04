import React, { useState } from 'react';
import { X, Heart, Send, MessageCircle } from 'lucide-react';
import { Post, Comment, User } from '../types';

interface CommentsDrawerProps {
  post: Post | null;
  comments: Comment[];
  currentUser: User;
  onClose: () => void;
  onAddComment: (postId: string, content: string) => void;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  post,
  comments,
  currentUser,
  onClose,
  onAddComment,
}) => {
  const [commentInput, setCommentInput] = useState('');
  const [likedCommentIds, setLikedCommentIds] = useState<Record<string, boolean>>({});

  if (!post) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    onAddComment(post.id, commentInput.trim());
    setCommentInput('');
  };

  const handleToggleLike = (commentId: string) => {
    setLikedCommentIds((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4 text-white">
      {/* Tap backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Card */}
      <div className="relative z-10 w-full sm:max-w-lg h-[80vh] sm:h-[75vh] glass-panel rounded-t-3xl sm:rounded-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden animate-slide-up bg-black/95">
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-base">Comments</h3>
            <span className="text-xs text-zinc-400 font-medium">({comments.length})</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Caption Preview */}
        <div className="p-4 bg-zinc-950 border-b border-white/10 flex items-start gap-3">
          <img
            src={post.user.avatar}
            alt={post.user.name}
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/15"
          />
          <div className="text-xs space-y-1">
            <p className="text-zinc-200">
              <span className="font-bold text-white mr-1.5">{post.user.username}</span>
              {post.caption}
            </p>
            <span className="text-[10px] text-zinc-500 block">{post.createdAt}</span>
          </div>
        </div>

        {/* Comments Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {comments.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 space-y-2">
              <MessageCircle className="w-8 h-8 mx-auto text-zinc-600" />
              <p className="text-xs font-semibold text-white">No comments yet</p>
              <p className="text-[11px] text-zinc-500">Be the first to share your thoughts.</p>
            </div>
          ) : (
            comments.map((c) => {
              const isLiked = likedCommentIds[c.id] || c.isLiked;
              const currentLikes = c.likesCount + (isLiked && !c.isLiked ? 1 : !isLiked && c.isLiked ? -1 : 0);

              return (
                <div key={c.id} className="flex items-start justify-between gap-3 group">
                  <div className="flex items-start gap-2.5">
                    <img
                      src={c.user.avatar}
                      alt={c.user.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{c.user.username}</span>
                        <span className="text-[10px] text-zinc-500">{c.createdAt}</span>
                      </div>
                      <p className="text-xs text-zinc-200 leading-relaxed">{c.content}</p>
                    </div>
                  </div>

                  {/* Heart like comment */}
                  <button
                    onClick={() => handleToggleLike(c.id)}
                    className="flex flex-col items-center gap-0.5 pt-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${isLiked ? 'fill-white text-white' : ''}`}
                    />
                    {currentLikes > 0 && (
                      <span className="text-[9px] font-semibold text-zinc-400">{currentLikes}</span>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="p-3 border-t border-white/10 bg-black/80 flex items-center gap-2"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover border border-white/15"
          />

          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder={`Add a comment as @${currentUser.username}...`}
            className="flex-1 glass-input px-3.5 py-2 rounded-full text-xs text-white placeholder-zinc-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!commentInput.trim()}
            className="p-2 rounded-full bg-white text-black hover:bg-zinc-200 disabled:opacity-30 transition-colors shadow-md cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
