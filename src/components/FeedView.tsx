import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  Music, 
  MoreHorizontal, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX,
  Share2,
  Plus,
  MapPin,
  Sparkles,
  Camera
} from 'lucide-react';
import { Post, Story, User } from '../types';
import confetti from 'canvas-confetti';

interface FeedViewProps {
  posts: Post[];
  stories: Story[];
  currentUser: User;
  onLikePost: (postId: string) => void;
  onSavePost: (postId: string) => void;
  onOpenComments: (post: Post) => void;
  onOpenStory: (story: Story) => void;
  onOpenCreateStory: () => void;
  onOpenCreatePost: () => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  posts,
  stories,
  currentUser,
  onLikePost,
  onSavePost,
  onOpenComments,
  onOpenStory,
  onOpenCreateStory,
  onOpenCreatePost,
}) => {
  const [activeFilter, setActiveFilter] = useState<'for_you' | 'following' | 'trending'>('for_you');
  const [activeCarouselIndices, setActiveCarouselIndices] = useState<Record<string, number>>({});
  const [audioPlayingPost, setAudioPlayingPost] = useState<string | null>(null);
  const [doubleTapLikes, setDoubleTapLikes] = useState<Record<string, boolean>>({});
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  const handleNextMedia = (postId: string, total: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveCarouselIndices((prev) => ({
      ...prev,
      [postId]: ((prev[postId] || 0) + 1) % total,
    }));
  };

  const handlePrevMedia = (postId: string, total: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveCarouselIndices((prev) => ({
      ...prev,
      [postId]: ((prev[postId] || 0) - 1 + total) % total,
    }));
  };

  const handleDoubleTap = (post: Post) => {
    if (!post.isLiked) {
      onLikePost(post.id);
    }
    setDoubleTapLikes((prev) => ({ ...prev, [post.id]: true }));
    setTimeout(() => {
      setDoubleTapLikes((prev) => ({ ...prev, [post.id]: false }));
    }, 900);
  };

  const handleShare = async (post: Post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.user.name}`,
          text: post.caption,
          url: window.location.href,
        });
      } catch {
        copyLink(post.id);
      }
    } else {
      copyLink(post.id);
    }
  };

  const copyLink = (postId: string) => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedPostId(postId);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (activeFilter === 'following') return post.user.isFollowing || post.userId === currentUser.id;
    return true;
  });

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 pb-28 text-white">
      {/* Feed Filter Chips - Black & White */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-zinc-900/90 border border-white/10">
          {(['for_you', 'following', 'trending'] as const).map((filter) => (
            <button
              key={filter}
              id={`feed-filter-${filter}`}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-white text-black shadow-md font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenCreatePost}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Post</span>
        </button>
      </div>

      {/* Stories Tray */}
      <div className="mb-6 overflow-hidden">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-1">
          {/* Add Story Bubble */}
          <div
            id="add-story-button"
            onClick={onOpenCreateStory}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full p-0.5 border-2 border-dashed border-white/40 group-hover:border-white transition-colors flex items-center justify-center bg-black">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white text-black rounded-full flex items-center justify-center shadow-lg border-2 border-black">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
            <span className="text-[11px] font-medium text-zinc-300 max-w-[64px] truncate">
              Your Story
            </span>
          </div>

          {/* Active Stories List */}
          {stories.map((story) => (
            <div
              key={story.id}
              id={`story-item-${story.id}`}
              onClick={() => onOpenStory(story)}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-white via-zinc-400 to-zinc-600 group-hover:scale-105 transition-transform duration-200 shadow-md shadow-white/5">
                <div className="w-full h-full rounded-full p-[2px] bg-black">
                  <img
                    src={story.user.avatar}
                    alt={story.user.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[11px] font-medium text-zinc-300 max-w-[64px] truncate">
                {story.user.username}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Feed Posts Stream */}
      <div className="space-y-6">
        {/* Empty Feed State */}
        {filteredPosts.length === 0 && (
          <div className="glass-card rounded-3xl p-8 sm:p-10 border border-white/10 text-center space-y-4 bg-black/80">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/15 flex items-center justify-center mx-auto text-white">
              <Camera className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Posts Yet</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto mt-1 leading-relaxed">
                All dummy data has been removed. Share your first photo or thought with the community.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={onOpenCreatePost}
                className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all shadow-lg cursor-pointer"
              >
                Create Your First Post
              </button>
            </div>
          </div>
        )}

        {filteredPosts.map((post) => {
          const carouselIndex = activeCarouselIndices[post.id] || 0;
          const currentMedia = post.media[carouselIndex] || post.media[0];
          const hasMultipleMedia = post.media.length > 1;

          return (
            <article
              key={post.id}
              id={`post-${post.id}`}
              className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 bg-black/85"
            >
              {/* Post Header */}
              <div className="p-3.5 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={post.user.avatar}
                      alt={post.user.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-white/15 ring-2 ring-white/10"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs sm:text-sm text-white hover:underline cursor-pointer">
                        {post.user.username}
                      </span>
                      {post.user.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white fill-white/20" />
                      )}
                    </div>
                    {post.location && (
                      <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        <span>{post.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400">{post.createdAt}</span>
                  <button className="p-1 rounded-full text-zinc-400 hover:text-white cursor-pointer">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Media Container with Double-tap to Like */}
              <div
                className="relative aspect-[4/5] sm:aspect-square bg-black overflow-hidden select-none cursor-pointer"
                onDoubleClick={() => handleDoubleTap(post)}
              >
                {currentMedia && (
                  <img
                    src={currentMedia.url}
                    alt={post.caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300"
                  />
                )}

                {/* Double Tap Heart Burst Animation */}
                {doubleTapLikes[post.id] && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping">
                    <Heart className="w-24 h-24 text-white fill-white drop-shadow-2xl" />
                  </div>
                )}

                {/* Multi-image indicator and arrows */}
                {hasMultipleMedia && (
                  <>
                    <button
                      onClick={(e) => handlePrevMedia(post.id, post.media.length, e)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md cursor-pointer transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleNextMedia(post.id, post.media.length, e)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md cursor-pointer transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-medium text-white border border-white/15">
                      {carouselIndex + 1} / {post.media.length}
                    </div>
                  </>
                )}

                {/* Attached Audio Track Chip */}
                {post.audioTrack && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setAudioPlayingPost(audioPlayingPost === post.id ? null : post.id);
                    }}
                    className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-medium text-white border border-white/15 flex items-center gap-2 hover:bg-black cursor-pointer"
                  >
                    <Music className="w-3.5 h-3.5 text-white animate-pulse" />
                    <span className="max-w-[140px] truncate">
                      {post.audioTrack.artist} — {post.audioTrack.title}
                    </span>
                    {audioPlayingPost === post.id ? (
                      <Volume2 className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </div>
                )}
              </div>

              {/* Post Interactive Actions & Details */}
              <div className="p-3.5 sm:p-4 space-y-2.5">
                {/* Action Buttons Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Like button */}
                    <button
                      id={`post-like-btn-${post.id}`}
                      onClick={() => onLikePost(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-semibold p-1.5 rounded-full transition-colors cursor-pointer ${
                        post.isLiked
                          ? 'text-white'
                          : 'text-zinc-300 hover:text-white'
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 transition-transform active:scale-125 ${
                          post.isLiked ? 'fill-white text-white' : ''
                        }`}
                      />
                      <span>{post.likesCount}</span>
                    </button>

                    {/* Comments drawer trigger */}
                    <button
                      id={`post-comment-btn-${post.id}`}
                      onClick={() => onOpenComments(post)}
                      className="flex items-center gap-1.5 text-xs font-semibold p-1.5 rounded-full text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.commentsCount}</span>
                    </button>

                    {/* Share Post button */}
                    <button
                      id={`post-share-btn-${post.id}`}
                      onClick={() => handleShare(post)}
                      className="p-1.5 rounded-full text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Share Post"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Bookmark / Save toggle */}
                  <button
                    id={`post-save-btn-${post.id}`}
                    onClick={() => onSavePost(post.id)}
                    className={`p-2 rounded-full border transition-all cursor-pointer ${
                      post.isSaved
                        ? 'bg-white text-black border-white'
                        : 'text-zinc-300 hover:text-white bg-zinc-900 border-white/10'
                    }`}
                    title={post.isSaved ? 'Saved' : 'Save'}
                  >
                    <Bookmark
                      className={`w-4.5 h-4.5 ${post.isSaved ? 'fill-black text-black' : ''}`}
                    />
                  </button>
                </div>

                {copiedPostId === post.id && (
                  <div className="text-[11px] text-white bg-zinc-800 px-3 py-1 rounded-lg border border-white/20 text-center animate-fade-in">
                    Link copied to clipboard!
                  </div>
                )}

                {/* Caption */}
                <div className="text-sm text-zinc-200 leading-relaxed">
                  <span className="font-bold text-white mr-2">
                    {post.user.username}
                  </span>
                  <span>{post.caption}</span>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium text-zinc-400 hover:text-white hover:underline cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* View comments button */}
                {post.commentsCount > 0 && (
                  <button
                    onClick={() => onOpenComments(post)}
                    className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors pt-1 block cursor-pointer"
                  >
                    View all {post.commentsCount} comments
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
