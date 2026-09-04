import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  INITIAL_POSTS, 
  INITIAL_STORIES, 
  INITIAL_CONVERSATIONS, 
  INITIAL_MESSAGES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_COMMENTS, 
  INITIAL_EXPLORE_ITEMS, 
  CURRENT_USER 
} from '../data/mockData';
import { Post, Story, Conversation, Message, NotificationItem, User, Comment, ExploreItem, AuthSession } from '../types';

// Supabase Configuration for jogajog
const DEFAULT_SUPABASE_URL = 'https://nqlyfvnbevrcpqqgxldv.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xbHlmdm5iZXZyY3BxcWd4bGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NTE4OTksImV4cCI6MjEwNDEyNzg5OX0.MBFeH4s2foI3TAs_q06AqFhBMJoUbao_PHNNQU5lKLo';

// Read env variables, localStorage, or provided credentials
const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const envAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('glass_supabase_url') || '' : '';
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('glass_supabase_key') || '' : '';

export const activeSupabaseUrl = envUrl || storedUrl || DEFAULT_SUPABASE_URL;
export const activeSupabaseKey = envAnonKey || storedKey || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(activeSupabaseUrl && activeSupabaseKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured 
  ? createClient(activeSupabaseUrl, activeSupabaseKey)
  : null;

// Storage keys
const STORAGE_KEYS = {
  CLEAN_FLAG: 'glass_social_v3_clean',
  POSTS: 'glass_social_posts_v3',
  STORIES: 'glass_social_stories_v3',
  CONVERSATIONS: 'glass_social_conversations_v3',
  MESSAGES: 'glass_social_messages_v3',
  NOTIFICATIONS: 'glass_social_notifications_v3',
  COMMENTS: 'glass_social_comments_v3',
  USER: 'glass_social_user_v3',
  EXPLORE: 'glass_social_explore_v3',
  SESSION: 'glass_social_session_v3',
  REGISTERED_USERS: 'glass_social_registered_users_v3',
};

// Purge any old dummy data from earlier versions
if (typeof window !== 'undefined') {
  const isClean = localStorage.getItem(STORAGE_KEYS.CLEAN_FLAG);
  if (!isClean) {
    // Delete legacy mock caches
    [
      'glass_social_posts', 
      'glass_social_stories', 
      'glass_social_conversations', 
      'glass_social_messages', 
      'glass_social_notifications', 
      'glass_social_comments', 
      'glass_social_user', 
      'glass_social_explore'
    ].forEach((k) => localStorage.removeItem(k));
    localStorage.setItem(STORAGE_KEYS.CLEAN_FLAG, 'true');
  }
}

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}

// Reactive store listeners
type Listener = () => void;
const listeners = new Set<Listener>();
function notifyChange() {
  listeners.forEach((l) => l());
}

export function subscribeToStore(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Supabase Realtime Auth listener
if (supabase) {
  try {
    supabase.auth.onAuthStateChange((event, sbSession) => {
      if (sbSession?.user) {
        const email = sbSession.user.email || '';
        const meta = sbSession.user.user_metadata || {};
        const username = meta.username || email.split('@')[0] || 'user';
        const name = meta.name || username;
        const loggedInUser: User = {
          id: sbSession.user.id,
          username,
          name,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
          bio: 'Supabase Realtime User',
          website: '',
          location: '',
          verified: false,
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
        };
        setLocal(STORAGE_KEYS.SESSION, {
          user: loggedInUser,
          email,
          isLoggedIn: true,
        });
        setLocal(STORAGE_KEYS.USER, loggedInUser);
        notifyChange();
      } else if (event === 'SIGNED_OUT') {
        const defaultGuest: User = {
          id: 'usr_guest',
          username: 'guest',
          name: 'Guest User',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
          bio: '',
          verified: false,
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
        };
        setLocal(STORAGE_KEYS.SESSION, {
          user: defaultGuest,
          email: '',
          isLoggedIn: false,
        });
        setLocal(STORAGE_KEYS.USER, defaultGuest);
        notifyChange();
      }
    });
  } catch (err) {
    console.warn('Realtime auth listener setup error:', err);
  }
}

// ==========================================
// AUTHENTICATION ENGINE
// ==========================================

export function getAuthSession(): AuthSession {
  const fallbackSession: AuthSession = {
    user: CURRENT_USER,
    email: '',
    isLoggedIn: false,
  };
  return getLocal<AuthSession>(STORAGE_KEYS.SESSION, fallbackSession);
}

export async function signUpUser(params: {
  email: string;
  password?: string;
  username: string;
  name: string;
}): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const trimmedEmail = params.email.trim().toLowerCase();
    const trimmedUsername = params.username.trim().toLowerCase().replace(/[^a-z0-9._]/g, '');
    const trimmedName = params.name.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!trimmedUsername || trimmedUsername.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters.' };
    }
    if (!trimmedName) {
      return { success: false, error: 'Please enter your full name.' };
    }

    let newUserId = `usr_${Date.now()}`;

    // STRICT SUPABASE SIGN-UP
    if (supabase && params.password) {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: params.password,
        options: {
          data: {
            username: trimmedUsername,
            full_name: trimmedName,
            name: trimmedName,
          },
        },
      });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.user?.id) {
        newUserId = data.user.id;
      }
    }

    const newUser: User = {
      id: newUserId,
      username: trimmedUsername,
      name: trimmedName,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${trimmedUsername}`,
      bio: 'New member of jogajog',
      website: '',
      location: '',
      verified: false,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
    };

    // Save registered user
    const users = getLocal<Record<string, { user: User; password?: string }>>(
      STORAGE_KEYS.REGISTERED_USERS, 
      {}
    );
    users[trimmedEmail] = { user: newUser, password: params.password };
    setLocal(STORAGE_KEYS.REGISTERED_USERS, users);

    // Save session
    const session: AuthSession = {
      user: newUser,
      email: trimmedEmail,
      isLoggedIn: true,
    };
    setLocal(STORAGE_KEYS.SESSION, session);
    setLocal(STORAGE_KEYS.USER, newUser);

    notifyChange();
    return { success: true, user: newUser };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to sign up.' };
  }
}

export async function signInUser(params: {
  email: string;
  password?: string;
}): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const trimmedEmail = params.email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!params.password) {
      return { success: false, error: 'Password is required.' };
    }

    // STRICT SUPABASE AUTHENTICATION
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: params.password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'User not found. Please verify your credentials.' };
      }

      const meta = data.user.user_metadata || {};
      const username = meta.username || trimmedEmail.split('@')[0];
      const name = meta.name || username;

      const loggedInUser: User = {
        id: data.user.id,
        username,
        name,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        bio: 'Member of jogajog',
        website: '',
        location: '',
        verified: false,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
      };

      const session: AuthSession = {
        user: loggedInUser,
        email: trimmedEmail,
        isLoggedIn: true,
      };
      setLocal(STORAGE_KEYS.SESSION, session);
      setLocal(STORAGE_KEYS.USER, loggedInUser);
      notifyChange();

      return { success: true, user: loggedInUser };
    }

    // STRICT FALLBACK (WHEN NO SUPABASE CREDENTIALS PROVIDED)
    // Completely block unregistered users. NO automatic account creation!
    const users = getLocal<Record<string, { user: User; password?: string }>>(
      STORAGE_KEYS.REGISTERED_USERS, 
      {}
    );

    const record = users[trimmedEmail];
    if (!record) {
      return { 
        success: false, 
        error: 'No account found with this email. Please sign up first.' 
      };
    }

    if (record.password !== params.password) {
      return { 
        success: false, 
        error: 'Invalid password. Please check your credentials and try again.' 
      };
    }

    const session: AuthSession = {
      user: record.user,
      email: trimmedEmail,
      isLoggedIn: true,
    };
    setLocal(STORAGE_KEYS.SESSION, session);
    setLocal(STORAGE_KEYS.USER, record.user);

    notifyChange();
    return { success: true, user: record.user };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Sign in failed.' };
  }
}

export async function signOutUser(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut().catch(() => {});
  }
  const defaultGuest: User = {
    id: 'usr_guest',
    username: 'guest',
    name: 'Guest User',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    bio: '',
    verified: false,
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
  };
  setLocal(STORAGE_KEYS.SESSION, {
    user: defaultGuest,
    email: '',
    isLoggedIn: false,
  });
  setLocal(STORAGE_KEYS.USER, defaultGuest);
  notifyChange();
}

export function quickDemoLogin(asUsername = 'black.minimalist'): User {
  const demoUser: User = {
    id: `usr_demo_${Date.now()}`,
    username: asUsername,
    name: 'Monochrome Creator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bio: 'Designing in pure black and white. Aesthetics & minimalism.',
    website: 'https://monochrome.black',
    location: 'Design Studio',
    verified: true,
    followersCount: 1,
    followingCount: 0,
    postsCount: 0,
  };

  const session: AuthSession = {
    user: demoUser,
    email: `${asUsername}@jogajog.app`,
    isLoggedIn: true,
  };
  setLocal(STORAGE_KEYS.SESSION, session);
  setLocal(STORAGE_KEYS.USER, demoUser);
  notifyChange();
  return demoUser;
}

// Data state helpers
export function getPosts(): Post[] {
  return getLocal<Post[]>(STORAGE_KEYS.POSTS, INITIAL_POSTS);
}

export function getStories(): Story[] {
  return getLocal<Story[]>(STORAGE_KEYS.STORIES, INITIAL_STORIES);
}

export function getConversations(): Conversation[] {
  return getLocal<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);
}

export function getMessages(convId: string): Message[] {
  const all = getLocal<Record<string, Message[]>>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
  return all[convId] || [];
}

export function getNotifications(): NotificationItem[] {
  return getLocal<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
}

export function getComments(postId: string): Comment[] {
  const all = getLocal<Record<string, Comment[]>>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS as any);
  return all[postId] || [];
}

export function getExploreItems(): ExploreItem[] {
  return getLocal<ExploreItem[]>(STORAGE_KEYS.EXPLORE, INITIAL_EXPLORE_ITEMS);
}

export function getCurrentUser(): User {
  const session = getAuthSession();
  if (session.isLoggedIn && session.user) {
    return session.user;
  }
  return getLocal<User>(STORAGE_KEYS.USER, CURRENT_USER);
}

// Clear all app data / reset to pure empty
export function clearAllLocalData(): void {
  setLocal(STORAGE_KEYS.POSTS, []);
  setLocal(STORAGE_KEYS.STORIES, []);
  setLocal(STORAGE_KEYS.CONVERSATIONS, []);
  setLocal(STORAGE_KEYS.MESSAGES, {});
  setLocal(STORAGE_KEYS.NOTIFICATIONS, []);
  setLocal(STORAGE_KEYS.COMMENTS, {});
  setLocal(STORAGE_KEYS.EXPLORE, []);
  
  // Reset postsCount of current user
  const user = getCurrentUser();
  const updatedUser = { ...user, postsCount: 0 };
  setLocal(STORAGE_KEYS.USER, updatedUser);

  const session = getAuthSession();
  if (session.isLoggedIn) {
    setLocal(STORAGE_KEYS.SESSION, { ...session, user: updatedUser });
  }

  notifyChange();
}

// Mutations
export function toggleLikePost(postId: string): boolean {
  const posts = getPosts();
  let newLiked = false;
  const updated = posts.map((p) => {
    if (p.id === postId) {
      newLiked = !p.isLiked;
      return {
        ...p,
        isLiked: newLiked,
        likesCount: newLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
      };
    }
    return p;
  });
  setLocal(STORAGE_KEYS.POSTS, updated);
  notifyChange();
  return newLiked;
}

export function toggleSavePost(postId: string): boolean {
  const posts = getPosts();
  let newSaved = false;
  const updated = posts.map((p) => {
    if (p.id === postId) {
      newSaved = !p.isSaved;
      return {
        ...p,
        isSaved: newSaved,
      };
    }
    return p;
  });
  setLocal(STORAGE_KEYS.POSTS, updated);
  notifyChange();
  return newSaved;
}

export function addComment(postId: string, content: string): Comment {
  const user = getCurrentUser();
  const allComments = getLocal<Record<string, Comment[]>>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS as any);
  const postComments = allComments[postId] || [];
  
  const newComment: Comment = {
    id: `comment_${Date.now()}`,
    postId,
    userId: user.id,
    user,
    content,
    createdAt: 'Just now',
    likesCount: 0,
    isLiked: false,
  };

  allComments[postId] = [newComment, ...postComments];
  setLocal(STORAGE_KEYS.COMMENTS, allComments);

  // Update post comments count
  const posts = getPosts();
  const updatedPosts = posts.map((p) => {
    if (p.id === postId) {
      return { ...p, commentsCount: p.commentsCount + 1 };
    }
    return p;
  });
  setLocal(STORAGE_KEYS.POSTS, updatedPosts);

  notifyChange();
  return newComment;
}

export function createPost(newPostData: {
  mediaUrls: string[];
  caption: string;
  location?: string;
  audioTrack?: { title: string; artist: string };
  filter?: string;
  tags?: string[];
}): Post {
  const user = getCurrentUser();
  const posts = getPosts();

  const newPost: Post = {
    id: `post_${Date.now()}`,
    userId: user.id,
    user,
    media: newPostData.mediaUrls.map((url, i) => ({
      id: `media_${Date.now()}_${i}`,
      url,
      type: 'image',
      aspectRatio: 'portrait',
    })),
    caption: newPostData.caption,
    location: newPostData.location || '',
    audioTrack: newPostData.audioTrack,
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    isLiked: false,
    isSaved: false,
    createdAt: 'Just now',
    filter: newPostData.filter,
    tags: newPostData.tags || [],
  };

  const updatedPosts = [newPost, ...posts];
  setLocal(STORAGE_KEYS.POSTS, updatedPosts);

  // Increment user's post count
  const updatedUser = { ...user, postsCount: (user.postsCount || 0) + 1 };
  setLocal(STORAGE_KEYS.USER, updatedUser);
  const session = getAuthSession();
  if (session.isLoggedIn) {
    setLocal(STORAGE_KEYS.SESSION, { ...session, user: updatedUser });
  }

  // Add to explore items as well
  const explore = getExploreItems();
  const newExplore: ExploreItem = {
    id: `exp_${Date.now()}`,
    postId: newPost.id,
    mediaUrl: newPost.media[0]?.url || '',
    type: 'image',
    aspectRatio: 'tall',
    likesCount: 0,
    commentsCount: 0,
    tags: newPostData.tags || ['recent'],
  };
  setLocal(STORAGE_KEYS.EXPLORE, [newExplore, ...explore]);

  notifyChange();
  return newPost;
}

export function createStory(mediaUrl: string, caption?: string): Story {
  const user = getCurrentUser();
  const stories = getStories();

  const newStory: Story = {
    id: `story_${Date.now()}`,
    userId: user.id,
    user,
    mediaUrl,
    type: 'image',
    createdAt: 'Just now',
    expiresAt: '24h left',
    seen: false,
    caption,
  };

  const updated = [newStory, ...stories];
  setLocal(STORAGE_KEYS.STORIES, updated);
  notifyChange();
  return newStory;
}

export function startConversation(participantName: string, participantAvatar?: string): Conversation {
  const conversations = getConversations();
  const newConv: Conversation = {
    id: `conv_${Date.now()}`,
    participant: {
      id: `usr_${Date.now()}`,
      username: participantName.toLowerCase().replace(/\s+/g, '_'),
      name: participantName,
      avatar: participantAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${participantName}`,
      bio: '',
      verified: false,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
    },
    lastMessage: 'Conversation started',
    lastMessageTime: 'Just now',
    unreadCount: 0,
    isOnline: true,
  };

  const updated = [newConv, ...conversations];
  setLocal(STORAGE_KEYS.CONVERSATIONS, updated);
  notifyChange();
  return newConv;
}

export function sendMessage(conversationId: string, text?: string, mediaUrl?: string): Message {
  const user = getCurrentUser();
  const allMessages = getLocal<Record<string, Message[]>>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
  const convMessages = allMessages[conversationId] || [];

  const newMsg: Message = {
    id: `msg_${Date.now()}`,
    conversationId,
    senderId: user.id,
    text,
    mediaUrl,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isRead: true,
  };

  allMessages[conversationId] = [...convMessages, newMsg];
  setLocal(STORAGE_KEYS.MESSAGES, allMessages);

  // Update conversation last message
  const conversations = getConversations();
  const updatedConvs = conversations.map((c) => {
    if (c.id === conversationId) {
      return {
        ...c,
        lastMessage: text || (mediaUrl ? 'Sent a photo' : 'Audio message'),
        lastMessageTime: 'Just now',
      };
    }
    return c;
  });
  setLocal(STORAGE_KEYS.CONVERSATIONS, updatedConvs);

  notifyChange();
  return newMsg;
}

export function updateUserProfile(updates: Partial<User>): User {
  const current = getCurrentUser();
  const updated = { ...current, ...updates };
  setLocal(STORAGE_KEYS.USER, updated);

  const session = getAuthSession();
  if (session.isLoggedIn) {
    setLocal(STORAGE_KEYS.SESSION, { ...session, user: updated });
  }

  notifyChange();
  return updated;
}
