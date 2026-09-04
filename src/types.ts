export interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  website?: string;
  location?: string;
  verified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
}

export interface PostMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  aspectRatio?: 'square' | 'portrait' | 'landscape';
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  media: PostMedia[];
  caption: string;
  location?: string;
  audioTrack?: {
    title: string;
    artist: string;
  };
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  filter?: string;
  tags?: string[];
}

export interface Story {
  id: string;
  userId: string;
  user: User;
  mediaUrl: string;
  type: 'image' | 'video';
  createdAt: string;
  expiresAt: string;
  seen: boolean;
  caption?: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text?: string;
  mediaUrl?: string;
  audioDuration?: string;
  createdAt: string;
  isRead: boolean;
  reaction?: string;
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  user: User;
  targetPost?: {
    id: string;
    imageUrl: string;
  };
  commentText?: string;
  createdAt: string;
  isRead: boolean;
}

export interface ExploreItem {
  id: string;
  postId: string;
  mediaUrl: string;
  type: 'image' | 'video';
  aspectRatio: 'square' | 'tall' | 'wide';
  likesCount: number;
  commentsCount: number;
  tags: string[];
}

export type NavigationTab = 
  | 'feed'
  | 'explore'
  | 'create'
  | 'messages'
  | 'notifications'
  | 'profile'
  | 'supabase_docs';

export interface AuthSession {
  user: User;
  email: string;
  isLoggedIn: boolean;
}
