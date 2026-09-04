import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  ChevronLeft, 
  CheckCheck,
  Search,
  MessageCircle,
  Plus,
  User as UserIcon,
  X
} from 'lucide-react';
import { Conversation, Message, User } from '../types';
import { startConversation } from '../lib/supabase';

interface MessagesViewProps {
  conversations: Conversation[];
  currentUser: User;
  onSendMessage: (conversationId: string, text?: string, mediaUrl?: string) => void;
  getMessages: (conversationId: string) => Message[];
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  conversations,
  currentUser,
  onSendMessage,
  getMessages,
}) => {
  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    conversations[0]?.id || null
  );
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === selectedConvId);
  const messages = activeConversation ? getMessages(activeConversation.id) : [];

  useEffect(() => {
    if (conversations.length > 0 && !selectedConvId) {
      setSelectedConvId(conversations[0].id);
    }
  }, [conversations, selectedConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, selectedConvId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    onSendMessage(activeConversation.id, inputText.trim());
    setInputText('');
  };

  const handleCreateNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatName.trim()) return;
    const newConv = startConversation(newChatName.trim());
    setSelectedConvId(newConv.id);
    setNewChatName('');
    setIsNewChatOpen(false);
  };

  const filteredConversations = conversations.filter((c) =>
    c.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.participant.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 pb-28 h-[calc(100vh-5.5rem)] flex flex-col text-white">
      <div className="flex-1 glass-panel rounded-3xl border border-white/15 overflow-hidden shadow-2xl flex flex-col md:flex-row bg-black/90">
        {/* Left Column: Conversations List */}
        <div 
          className={`w-full md:w-80 border-r border-white/10 flex flex-col ${
            selectedConvId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header & Search */}
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-white text-base">Direct Messages</h2>
              <button
                onClick={() => setIsNewChatOpen(true)}
                className="p-1.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer"
                title="New Chat"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full glass-input pl-9 pr-3 py-1.5 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          {/* New Chat Dialog */}
          {isNewChatOpen && (
            <div className="p-3 bg-zinc-950 border-b border-white/10">
              <form onSubmit={handleCreateNewChat} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Start New Chat</span>
                  <button
                    type="button"
                    onClick={() => setIsNewChatOpen(false)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  placeholder="Enter name or @username..."
                  required
                  className="w-full glass-input px-3 py-1.5 rounded-lg text-xs text-white"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-lg bg-white text-black font-bold text-xs hover:bg-zinc-200"
                >
                  Start Chat
                </button>
              </form>
            </div>
          )}

          {/* List of Conversations */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto text-zinc-400">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-zinc-400">No conversations yet.</p>
                <button
                  onClick={() => setIsNewChatOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200"
                >
                  Start a Message
                </button>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = c.id === selectedConvId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedConvId(c.id)}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-white/10 border-l-2 border-white'
                        : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={c.participant.avatar}
                        alt={c.participant.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-full object-cover border border-white/15"
                      />
                      {c.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-black" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-xs text-white truncate">
                          {c.participant.name}
                        </p>
                        <span className="text-[10px] text-zinc-400">{c.lastMessageTime}</span>
                      </div>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {c.lastMessage}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Box */}
        <div 
          className={`flex-1 flex flex-col ${
            !selectedConvId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-black/50">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConvId(null)}
                    className="p-1 rounded-full text-zinc-400 hover:text-white md:hidden"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="relative">
                    <img
                      src={activeConversation.participant.avatar}
                      alt={activeConversation.participant.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover border border-white/20"
                    />
                    {activeConversation.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-black" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-white">
                      {activeConversation.participant.name}
                    </h3>
                    <p className="text-[10px] text-zinc-400">
                      @{activeConversation.participant.username}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-zinc-400 text-xs">
                    <MessageCircle className="w-8 h-8 mx-auto text-zinc-500 mb-2" />
                    <p>No messages yet in this conversation.</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Say hi to get started!</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === currentUser.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] sm:max-w-xs md:max-w-sm rounded-2xl px-4 py-2.5 text-xs ${
                            isMe
                              ? 'bg-white text-black font-medium shadow-md'
                              : 'bg-zinc-900 text-white border border-white/10'
                          }`}
                        >
                          {m.text && <p className="leading-relaxed">{m.text}</p>}
                          {m.mediaUrl && (
                            <img
                              src={m.mediaUrl}
                              alt="Chat attachment"
                              referrerPolicy="no-referrer"
                              className="rounded-xl mt-1.5 max-h-48 object-cover"
                            />
                          )}
                        </div>

                        <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-500 px-1">
                          <span>{m.createdAt}</span>
                          {isMe && <CheckCheck className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black/60 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 glass-input px-4 py-2.5 rounded-full text-xs text-white placeholder-zinc-500 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-full bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-colors shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400">
              <MessageCircle className="w-12 h-12 text-zinc-600 mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">Your Direct Messages</h3>
              <p className="text-xs max-w-xs mb-4">
                Select an existing conversation or start a new message to chat.
              </p>
              <button
                onClick={() => setIsNewChatOpen(true)}
                className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200"
              >
                Start New Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
