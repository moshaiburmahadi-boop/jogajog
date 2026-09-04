/**
 * Comprehensive Supabase PostgreSQL Schema Architecture & DDL
 * Ready for the Supabase SQL Editor
 */

export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- 1. EXTENSIONS & SETUP
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. PUBLIC PROFILES TABLE (Mirrors auth.users)
-- ==============================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  location TEXT,
  verified BOOLEAN DEFAULT FALSE,
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  posts_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on auth.users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTRING(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Lumina Creator'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3. POSTS TABLE
-- ==============================================================================
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  caption TEXT,
  location TEXT,
  audio_title TEXT,
  audio_artist TEXT,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  filter_preset TEXT DEFAULT 'original',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone" 
  ON public.posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" 
  ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
  ON public.posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
  ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- ==============================================================================
-- 4. POST MEDIA TABLE (Multi-image/carousel support)
-- ==============================================================================
CREATE TABLE public.post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  aspect_ratio TEXT DEFAULT 'portrait',
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Post media viewable by everyone" ON public.post_media FOR SELECT USING (true);
CREATE POLICY "Users can add media to their own posts" ON public.post_media FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND user_id = auth.uid())
);

-- ==============================================================================
-- 5. LIKES & SAVED POSTS
-- ==============================================================================
CREATE TABLE public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes are viewable by everyone" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Like Counter triggers
CREATE OR REPLACE FUNCTION public.increment_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_post_liked
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.increment_post_likes();

CREATE OR REPLACE FUNCTION public.decrement_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_post_unliked
  AFTER DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.decrement_post_likes();

-- ==============================================================================
-- 6. COMMENTS TABLE
-- ==============================================================================
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- ==============================================================================
-- 7. STORIES TABLE (24h Ephemeral Media)
-- ==============================================================================
CREATE TABLE public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active stories are viewable by everyone" ON public.stories FOR SELECT USING (expires_at > NOW());
CREATE POLICY "Users can post stories" ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 8. CONVERSATIONS & DIRECT MESSAGES (Supabase Realtime)
-- ==============================================================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_one UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_two UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_one, participant_two)
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT,
  media_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their conversations" ON public.conversations 
  FOR ALL USING (auth.uid() = participant_one OR auth.uid() = participant_two);

CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id AND (participant_one = auth.uid() OR participant_two = auth.uid())
    )
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ==============================================================================
-- 9. NOTIFICATIONS TABLE
-- ==============================================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention')),
  target_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_text TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);

-- ==============================================================================
-- 10. REALTIME PUBLICATION ENABLEMENT
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ==============================================================================
-- 11. STORAGE BUCKETS CONFIGURATION (SQL helper)
-- ==============================================================================
-- Note: Create buckets in Supabase Storage UI or via SQL:
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('posts', 'posts', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('stories', 'stories', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public Avatar Images" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Public Post Media" ON storage.objects FOR SELECT USING (bucket_id = 'posts');
CREATE POLICY "Public Story Media" ON storage.objects FOR SELECT USING (bucket_id = 'stories');
`;
