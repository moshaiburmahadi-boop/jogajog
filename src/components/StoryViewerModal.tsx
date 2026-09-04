import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Send, Sparkles, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { Story, User } from '../types';
import confetti from 'canvas-confetti';

interface StoryViewerModalProps {
  stories: Story[];
  initialStory: Story;
  currentUser: User;
  onClose: () => void;
  onSendStoryReply: (userId: string, replyText: string) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialStory,
  currentUser,
  onClose,
  onSendStoryReply,
}) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = stories.findIndex((s) => s.id === initialStory.id);
    return idx >= 0 ? idx : 0;
  });

  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [reactionSent, setReactionSent] = useState(false);
  const currentStory = stories[currentIndex];

  const duration = 5000; // 5 seconds per story
  const intervalTime = 50;

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (intervalTime / duration) * 100;
        if (next >= 100) {
          // Advance to next story or close
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((curr) => curr + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, stories.length, onClose]);

  // Reset progress when index changes
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handleSendReaction = (emoji: string) => {
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.8 },
    });
    onSendStoryReply(currentStory.userId, `Reacted ${emoji} to your story`);
    setReactionSent(true);
    setTimeout(() => setReactionSent(false), 2000);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onSendStoryReply(currentStory.userId, replyText);
    setReplyText('');
    setReactionSent(true);
    setTimeout(() => setReactionSent(false), 2000);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, stories.length]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-0 sm:p-4">
      {/* Background Ambience from Story */}
      <div 
        className="absolute inset-0 opacity-20 filter blur-3xl scale-125 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url(${currentStory.mediaUrl})` }}
      />

      {/* Story Stage Frame */}
      <div 
        className="relative w-full h-full sm:max-w-md sm:h-[88vh] sm:rounded-3xl overflow-hidden glass-panel border border-white/20 shadow-2xl flex flex-col justify-between"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Story Progress Indicators Bar */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5">
          {stories.map((story, i) => (
            <div
              key={story.id}
              className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden backdrop-blur-sm"
            >
              <div
                className="h-full bg-white transition-all ease-linear"
                style={{
                  width:
                    i < currentIndex
                      ? '100%'
                      : i === currentIndex
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Top Header Card: Author, Time, Close */}
        <div className="relative z-30 pt-7 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={currentStory.user.avatar}
              alt={currentStory.user.name}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white/50"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-white">
                  {currentStory.user.username}
                </span>
                <span className="text-[11px] text-white/70">
                  {currentStory.createdAt}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-full glass-pill text-white/80 hover:text-white cursor-pointer"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full glass-pill text-white/80 hover:text-white cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tap areas for previous / next navigation */}
        <div className="absolute inset-0 z-20 flex">
          <div 
            onClick={handlePrev} 
            className="w-1/3 h-full cursor-pointer" 
            title="Previous Story" 
          />
          <div 
            onClick={handleNext} 
            className="w-2/3 h-full cursor-pointer" 
            title="Next Story" 
          />
        </div>

        {/* Story Media */}
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <img
            src={currentStory.mediaUrl}
            alt={currentStory.caption || 'Story'}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover select-none"
          />
          {currentStory.caption && (
            <div className="absolute bottom-24 left-4 right-4 z-20 glass-pill px-4 py-2.5 rounded-2xl border border-white/20 text-white text-sm text-center shadow-lg">
              {currentStory.caption}
            </div>
          )}
        </div>

        {/* Bottom Action Footer: Emoji Reactions & Reply Input */}
        <div className="relative z-30 p-4 pb-6 space-y-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          {/* Reaction confirmation alert */}
          {reactionSent && (
            <div className="text-xs text-white font-medium text-center bg-zinc-900/90 py-1 px-3 rounded-full border border-white/20">
              Reaction sent to {currentStory.user.username}!
            </div>
          )}

          {/* Quick Reaction Emoji Bar */}
          <div className="flex items-center justify-around glass-pill p-1.5 rounded-full border border-white/20">
            {['🔥', '❤️', '👏', '😮', '😂', '✨'].map((emoji) => (
              <button
                key={emoji}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendReaction(emoji);
                }}
                className="text-lg hover:scale-130 active:scale-95 transition-transform p-1 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Reply Form */}
          <form 
            onSubmit={handleSendReply}
            onClick={(e) => e.stopPropagation()} 
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${currentStory.user.username}...`}
              className="flex-1 glass-input py-2.5 px-4 rounded-full text-xs text-white placeholder-zinc-400 border border-white/20 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="p-2.5 rounded-full bg-white hover:bg-zinc-200 disabled:opacity-40 text-black shadow-md transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
