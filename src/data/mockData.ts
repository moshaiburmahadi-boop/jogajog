import { User, Post, Story, Conversation, Message, NotificationItem, ExploreItem } from '../types';

export const CURRENT_USER: User = {
  id: 'usr_guest',
  username: 'user',
  name: 'New User',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  bio: 'Welcome to jogajog.',
  website: '',
  location: '',
  verified: false,
  followersCount: 0,
  followingCount: 0,
  postsCount: 0,
};

export const MOCK_USERS: User[] = [CURRENT_USER];

export const INITIAL_STORIES: Story[] = [];

export const INITIAL_POSTS: Post[] = [];

export const INITIAL_CONVERSATIONS: Conversation[] = [];

export const INITIAL_MESSAGES: Record<string, Message[]> = {};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_COMMENTS: Record<string, any[]> = {};

export const INITIAL_EXPLORE_ITEMS: ExploreItem[] = [];
