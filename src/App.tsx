import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomDock } from './components/BottomDock';
import { FeedView } from './components/FeedView';
import { ExploreView } from './components/ExploreView';
import { MessagesView } from './components/MessagesView';
import { NotificationsView } from './components/NotificationsView';
import { ProfileView } from './components/ProfileView';
import { StoryViewerModal } from './components/StoryViewerModal';
import { CreatePostModal } from './components/CreatePostModal';
import { CommentsDrawer } from './components/CommentsDrawer';
import { PostDetailModal } from './components/PostDetailModal';
import { AuthModal } from './components/AuthModal';
import { AuthScreen } from './components/AuthScreen';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SignOutConfirmModal } from './components/SignOutConfirmModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';

import { NavigationTab, Post, Story } from './types';
import { 
  getPosts, 
  getStories, 
  getConversations, 
  getMessages, 
  getNotifications, 
  getExploreItems, 
  getCurrentUser, 
  getComments, 
  toggleLikePost, 
  toggleSavePost, 
  addComment, 
  createPost, 
  sendMessage, 
  updateUserProfile, 
  subscribeToStore,
  getAuthSession,
  signOutUser
} from './lib/supabase';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('feed');
  
  // App State connected to reactive store
  const [posts, setPosts] = useState(getPosts);
  const [stories, setStories] = useState(getStories);
  const [conversations, setConversations] = useState(getConversations);
  const [notifications, setNotifications] = useState(getNotifications);
  const [exploreItems, setExploreItems] = useState(getExploreItems);
  const [currentUser, setCurrentUser] = useState(getCurrentUser);
  const [isLoggedIn, setIsLoggedIn] = useState(() => getAuthSession().isLoggedIn);

  // Modals state
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [commentingPost, setCommentingPost] = useState<Post | null>(null);
  const [inspectingPost, setInspectingPost] = useState<Post | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);

  // Subscribe to persistent store updates
  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setPosts(getPosts());
      setStories(getStories());
      setConversations(getConversations());
      setNotifications(getNotifications());
      setExploreItems(getExploreItems());
      setCurrentUser(getCurrentUser());
      setIsLoggedIn(getAuthSession().isLoggedIn);
    });
    return unsubscribe;
  }, []);

  // Handlers
  const handleLikePost = (postId: string) => {
    toggleLikePost(postId);
  };

  const handleSavePost = (postId: string) => {
    toggleSavePost(postId);
  };

  const handleAddComment = (postId: string, content: string) => {
    addComment(postId, content);
  };

  const handleCreatePost = (data: {
    mediaUrls: string[];
    caption: string;
    location?: string;
    audioTrack?: { title: string; artist: string };
    filter?: string;
    tags?: string[];
  }) => {
    createPost(data);
    setCurrentTab('feed');
  };

  const handleSendMessage = (conversationId: string, text?: string, mediaUrl?: string) => {
    sendMessage(conversationId, text, mediaUrl);
  };

  const handleSendStoryReply = (userId: string, replyText: string) => {
    const conv = conversations.find((c) => c.participant.id === userId) || conversations[0];
    if (conv) {
      sendMessage(conv.id, replyText);
    }
  };

  const handleUpdateUser = (updates: any) => {
    updateUserProfile(updates);
  };

  const handleSignOut = () => {
    signOutUser();
    setIsLoggedIn(false);
  };

  // Counts
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  // Filter user posts & saved posts for Profile
  const myPosts = posts.filter((p) => p.userId === currentUser.id);
  const savedPosts = posts.filter((p) => p.isSaved);

  // Protected Route: If no active session, forcefully redirected to Login / Sign-up
  return (
    <ProtectedRoute
      onSessionInvalid={() => {
        setIsLoggedIn(false);
      }}
      fallback={
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
          <PWAInstallBanner />
          <AuthScreen
            onSuccess={() => {
              setIsLoggedIn(true);
              setCurrentTab('feed');
              setCurrentUser(getCurrentUser());
            }}
          />
        </div>
      }
    >
      <div className="min-h-screen bg-black text-white relative overflow-x-hidden selection:bg-white selection:text-black">
      {/* PWA Floating Install Banner */}
      <PWAInstallBanner />

      {/* Apple Frosted Navbar with Auth Controls */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        unreadMessagesCount={unreadMessagesCount}
        isLoggedIn={isLoggedIn}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={() => setIsSignOutConfirmOpen(true)}
        currentUser={currentUser}
      />

      {/* Main Tab View Canvas */}
      <main className="relative z-10 w-full pt-1">
        {currentTab === 'feed' && (
          <FeedView
            posts={posts}
            stories={stories}
            currentUser={currentUser}
            onLikePost={handleLikePost}
            onSavePost={handleSavePost}
            onOpenComments={(post) => setCommentingPost(post)}
            onOpenStory={(story) => setActiveStory(story)}
            onOpenCreateStory={() => setIsCreateModalOpen(true)}
            onOpenCreatePost={() => setIsCreateModalOpen(true)}
          />
        )}

        {currentTab === 'explore' && (
          <ExploreView
            exploreItems={exploreItems}
            posts={posts}
            onSelectPost={(post) => setInspectingPost(post)}
            onOpenCreatePost={() => setIsCreateModalOpen(true)}
          />
        )}

        {currentTab === 'messages' && (
          <MessagesView
            conversations={conversations}
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
            getMessages={getMessages}
          />
        )}

        {currentTab === 'notifications' && (
          <NotificationsView
            notifications={notifications}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            userPosts={myPosts}
            savedPosts={savedPosts}
            onSelectPost={(post) => setInspectingPost(post)}
            onUpdateUser={handleUpdateUser}
            isLoggedIn={isLoggedIn}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onSignOut={() => setIsSignOutConfirmOpen(true)}
            onOpenCreatePost={() => setIsCreateModalOpen(true)}
          />
        )}
      </main>

      {/* Floating Apple macOS/iOS Glass Dock */}
      <BottomDock
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
      />

      {/* Modals & Drawers */}

      {/* 1. Auth Modal (For in-app switching) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsLoggedIn(true);
          setCurrentUser(getCurrentUser());
        }}
      />

      {/* 2. Fullscreen Story Viewer */}
      {activeStory && (
        <StoryViewerModal
          stories={stories}
          initialStory={activeStory}
          currentUser={currentUser}
          onClose={() => setActiveStory(null)}
          onSendStoryReply={handleSendStoryReply}
        />
      )}

      {/* 3. Create Post Modal */}
      {isCreateModalOpen && (
        <CreatePostModal
          currentUser={currentUser}
          onClose={() => setIsCreateModalOpen(false)}
          onCreatePost={handleCreatePost}
        />
      )}

      {/* 4. Comments Drawer */}
      {commentingPost && (
        <CommentsDrawer
          post={commentingPost}
          comments={getComments(commentingPost.id)}
          currentUser={currentUser}
          onClose={() => setCommentingPost(null)}
          onAddComment={handleAddComment}
        />
      )}

      {/* 5. Post Deep Detail Modal (From Explore/Profile) */}
      {inspectingPost && (
        <PostDetailModal
          post={inspectingPost}
          comments={getComments(inspectingPost.id)}
          onClose={() => setInspectingPost(null)}
          onLikePost={handleLikePost}
          onSavePost={handleSavePost}
          onOpenCommentsDrawer={(post) => {
            setInspectingPost(null);
            setCommentingPost(post);
          }}
        />
      )}

      {/* 6. Sign Out Confirmation Popup */}
      <SignOutConfirmModal
        isOpen={isSignOutConfirmOpen}
        onClose={() => setIsSignOutConfirmOpen(false)}
        onConfirm={handleSignOut}
        username={currentUser?.username}
      />
    </div>
    </ProtectedRoute>
  );
}
