import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  MapPin, 
  Music, 
  Globe, 
  Check,
  Tag
} from 'lucide-react';
import { User } from '../types';
import confetti from 'canvas-confetti';

interface CreatePostModalProps {
  currentUser: User;
  onClose: () => void;
  onCreatePost: (data: {
    mediaUrls: string[];
    caption: string;
    location?: string;
    audioTrack?: { title: string; artist: string };
    filter?: string;
    tags?: string[];
  }) => void;
}

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
];

const FILTERS = [
  { id: 'original', name: 'Original', style: 'filter-none' },
  { id: 'noir', name: 'Noir Monolith', style: 'grayscale contrast-125' },
  { id: 'frost', name: 'Frosted Glass', style: 'brightness-110 contrast-105' },
  { id: 'shadow', name: 'Deep Shadow', style: 'contrast-130 brightness-95' },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  currentUser,
  onClose,
  onCreatePost,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(PRESET_IMAGES[0]);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('original');
  const [selectedAudio, setSelectedAudio] = useState<{ title: string; artist: string } | undefined>();
  const [audience, setAudience] = useState<'public' | 'close_friends'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    if (!selectedImage) return;
    setIsSubmitting(true);

    const tags = caption
      .split(' ')
      .filter((w) => w.startsWith('#'))
      .map((t) => t.replace(/[^a-zA-Z0-9]/g, '').toLowerCase())
      .filter(Boolean);

    onCreatePost({
      mediaUrls: [selectedImage],
      caption: caption.trim(),
      location: location.trim() || undefined,
      audioTrack: selectedAudio,
      filter: selectedFilter,
      tags: tags.length > 0 ? tags : ['minimal'],
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#ffffff', '#888888', '#222222'],
      });
    } catch {
      // safe fallback
    }

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const currentFilterStyle = FILTERS.find((f) => f.id === selectedFilter)?.style || '';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-4 animate-fade-in text-white">
      <div className="relative w-full max-w-xl max-h-[90vh] glass-panel rounded-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden bg-black/95">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="font-bold text-white text-base">Create New Post</h2>

          <button
            id="create-post-publish-btn"
            onClick={handlePublish}
            disabled={isSubmitting || !selectedImage}
            className="px-4 py-1.5 rounded-full bg-white text-black font-bold text-xs hover:bg-zinc-200 disabled:opacity-40 transition-all cursor-pointer shadow-md"
          >
            {isSubmitting ? 'Sharing...' : 'Share'}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* Media Preview Card */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden glass-card border border-white/15 bg-zinc-950">
            <img
              src={selectedImage}
              alt="Preview"
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-all duration-300 ${currentFilterStyle}`}
            />

            {/* Custom file upload button overlay */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black text-xs text-white border border-white/25 shadow-lg cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-white" />
                <span>Choose Photo</span>
              </button>
            </div>
          </div>

          {/* Sample Preset Thumbnails */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              Select Preset or Upload Photo
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_IMAGES.map((imgUrl, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedImage === imgUrl
                      ? 'border-white scale-95 shadow-md shadow-white/20'
                      : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Preset ${i}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {selectedImage === imgUrl && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center text-black">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Filter Bar */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              Aesthetic Filters
            </label>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedFilter === f.id
                      ? 'bg-white text-black shadow-sm font-bold'
                      : 'bg-zinc-900 text-zinc-300 hover:text-white border border-white/10'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Caption Input with Author info */}
          <div className="glass-card rounded-2xl p-3 border border-white/10 space-y-2 bg-zinc-950">
            <div className="flex items-center gap-2.5">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-white/20"
              />
              <span className="text-xs font-bold text-white">{currentUser.username}</span>
            </div>
            <textarea
              id="create-post-caption-input"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption... Use #hashtags to feature in Explore"
              rows={3}
              className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-white" />
                <span>Supports #monochrome #black #photography</span>
              </div>
              <span>{caption.length} / 500</span>
            </div>
          </div>

          {/* Location & Audio Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="glass-card rounded-xl p-2.5 border border-white/10 flex items-center gap-2 bg-zinc-950">
              <MapPin className="w-4 h-4 text-white shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location (optional)..."
                className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>

            <div className="glass-card rounded-xl p-2.5 border border-white/10 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-white shrink-0" />
                <span className="text-xs text-zinc-300 truncate">
                  {selectedAudio ? `${selectedAudio.title} • ${selectedAudio.artist}` : 'No Audio'}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSelectedAudio(
                    selectedAudio
                      ? undefined
                      : { title: 'Nocturne in Black', artist: 'Lumina Sound' }
                  )
                }
                className="text-[10px] text-white hover:underline cursor-pointer"
              >
                {selectedAudio ? 'Remove' : 'Add Audio'}
              </button>
            </div>
          </div>

          {/* Audience selection */}
          <div className="flex items-center justify-between glass-card rounded-xl p-3 border border-white/10 bg-zinc-950">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-zinc-300" />
              <div>
                <p className="text-xs font-semibold text-white">Audience</p>
                <p className="text-[10px] text-zinc-400">
                  {audience === 'public' ? 'Visible to everyone' : 'Only your close friends'}
                </p>
              </div>
            </div>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as any)}
              className="glass-input rounded-lg px-2.5 py-1 text-xs text-white bg-black border border-white/20 focus:outline-none cursor-pointer"
            >
              <option value="public">Public</option>
              <option value="close_friends">Close Friends</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
