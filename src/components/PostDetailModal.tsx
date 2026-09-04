import React from 'react';
import { X, Heart, MessageCircle, Bookmark, CheckCircle2, MapPin } from 'lucide-react';
import { Post, Comment } from '../types';

interface PostDetailModalProps {
  post: Post | null;
  comments: Comment[];
  onClose: () => void;
  onLikePost: (postId: string) => void;
  onSavePost: (postId: string) => void;
  onOpenCommentsDrawer: (post: Post) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  comments,
  onClose,
  onLikePost,
  onSavePost,
  onOpenCommentsDrawer,
}) => {
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 animate-fade-in text-white">
      <div className="relative w-full max-w-2xl max-h-[90vh] glass-panel rounded-3xl border border-white/20 shadow-2xl flex flex-col md:flex-row overflow-hidden bg-black/95">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Media Frame */}
        <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-black flex items-center justify-center overflow-hidden">
          <img
            src={post.media[0]?.url}
            alt={post.caption}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Post Info & Discussion */}
        <div className="w-full md:w-1/2 flex flex-col justify-between p-4 overflow-y-auto no-scrollbar bg-black/90">
          {/* Header */}
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <img
              src={post.user.avatar}
              alt={post.user.name}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover border border-white/20"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-white">{post.user.username}</span>
                {post.user.verified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white fill-white/20" />
                )}
              </div>
              {post.location && (
                <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <MapPin className="w-2.5 h-2.5 text-zinc-400" />
                  <span>{post.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Caption */}
          <div className="py-3 flex-1 overflow-y-auto no-scrollbar space-y-3">
            <p className="text-xs text-zinc-200 leading-relaxed">{post.caption}</p>

            {/* Comments Snippet */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Comments ({comments.length})
              </span>
              {comments.slice(0, 3).map((c) => (
                <div key={c.id} className="text-xs space-y-0.5">
                  <span className="font-semibold text-white mr-1.5">{c.user.username}</span>
                  <span className="text-zinc-300">{c.content}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-zinc-900 border border-white/10">
                <button
                  onClick={() => onLikePost(post.id)}
                  className="p-1 flex items-center gap-1 text-xs text-white cursor-pointer"
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-white text-white' : ''}`} />
                  <span>{post.likesCount}</span>
                </button>

                <button
                  onClick={() => onOpenCommentsDrawer(post)}
                  className="p-1 flex items-center gap-1 text-xs text-zinc-300 hover:text-white cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.commentsCount}</span>
                </button>
              </div>

              <button
                onClick={() => onSavePost(post.id)}
                className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                  post.isSaved
                    ? 'bg-white text-black border-white'
                    : 'text-zinc-400 hover:text-white bg-zinc-900 border-white/10'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-black text-black' : ''}`} />
              </button>
            </div>

            <button
              onClick={() => onOpenCommentsDrawer(post)}
              className="w-full py-2 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 text-xs text-center cursor-pointer shadow-md"
            >
              Add a comment...
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
