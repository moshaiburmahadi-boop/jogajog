import React, { useState } from 'react';
import { Search, Compass, X } from 'lucide-react';
import { ExploreItem, Post } from '../types';

interface ExploreViewProps {
  exploreItems: ExploreItem[];
  posts: Post[];
  onSelectPost: (post: Post) => void;
}

const TRENDING_TAGS = [
  'All',
  'Design',
  'Minimalism',
  'Monochrome',
  'Architecture',
  'Art',
  'Photography',
  'Glass'
];

export const ExploreView: React.FC<ExploreViewProps> = ({
  exploreItems,
  posts,
  onSelectPost,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('All');

  // Items can come from exploreItems or posts
  const combinedItems: ExploreItem[] = exploreItems.length > 0 
    ? exploreItems 
    : posts.map((p) => ({
        id: `exp_${p.id}`,
        postId: p.id,
        mediaUrl: p.media[0]?.url || '',
        type: 'image',
        aspectRatio: 'square',
        likesCount: p.likesCount,
        commentsCount: p.commentsCount,
        tags: p.tags || ['recent'],
      }));

  const filteredItems = combinedItems.filter((item) => {
    const matchesTag =
      activeTag === 'All' ||
      item.tags.some((t) => t.toLowerCase().includes(activeTag.toLowerCase()));

    const matchesSearch =
      !searchQuery.trim() ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTag && matchesSearch;
  });

  const handleItemClick = (item: ExploreItem) => {
    const foundPost = posts.find((p) => p.id === item.postId);
    if (foundPost) {
      onSelectPost(foundPost);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 pb-28 text-white">
      {/* Search Header Bar */}
      <div className="relative mb-4">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            id="explore-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tags, topics, creators..."
            className="w-full glass-input pl-10 pr-10 py-2.5 rounded-full text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 p-1 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Trending Topics Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-4">
        {TRENDING_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTag === tag
                ? 'bg-white text-black shadow-md font-bold'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      {filteredItems.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 border border-white/10 text-center space-y-3 bg-black/80">
          <div className="w-14 h-14 rounded-full bg-zinc-900 border border-white/15 flex items-center justify-center mx-auto text-zinc-400">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-base font-bold text-white">No Explore Posts Yet</h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            {searchQuery
              ? `No results found for "${searchQuery}". Try different keywords.`
              : 'Posts shared by members will automatically appear in Explore.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="relative aspect-square rounded-xl overflow-hidden bg-zinc-950 border border-white/10 cursor-pointer group"
            >
              {item.mediaUrl && (
                <img
                  src={item.mediaUrl}
                  alt="Explore media"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
                <span>❤️ {item.likesCount}</span>
                <span>💬 {item.commentsCount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
