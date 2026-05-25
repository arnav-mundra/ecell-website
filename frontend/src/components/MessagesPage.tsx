/**
 * E-Cell GH Raisoni — WhatsApp-Style One-to-One & Group Chats
 * /src/components/MessagesPage.tsx
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, ArrowLeft, MessageSquare, Video, Info, Plus, Users, UserPlus, Check } from 'lucide-react';
import { MsgAPI, UserAPI, timeAgo } from '../utils/db';
import { User, Message, GroupChat } from '../types';

interface MessagesPageProps {
  currentUser: User;
  triggerToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  activeChatUser: User | null;
  setActiveChatUser: (user: User | null) => void;
  onOpenProfile: (id: string) => void;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({
  currentUser,
  triggerToast,
  activeChatUser,
  setActiveChatUser,
  onOpenProfile
}) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [activeGroup, setActiveGroup] = useState<GroupChat | null>(null);
  
  const [searchContact, setSearchContact] = useState('');
  const [msgText, setMsgText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  // Group creation modal states
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const replyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize chat loading
  useEffect(() => {
    loadChatData();
    return () => {
      if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    };
  }, [currentUser, activeChatUser]);

  useEffect(() => {
    if (activeGroup) {
      const gThread = MsgAPI.getGroupThread(activeGroup.id);
      setMessages(gThread);
    }
  }, [activeGroup]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatData = () => {
    // 1. Fetch direct messaging logs
    const convos = MsgAPI.getConversations(currentUser.id);
    const myConns = currentUser.connections || [];
    const seenIds = new Set(convos.map(c => c.otherId));

    const mergedList: any[] = [];
    convos.forEach(c => {
      const u = UserAPI.getById(c.otherId);
      if (u) mergedList.push({ user: u, lastMsg: c.last });
    });

    myConns.forEach(uid => {
      if (!seenIds.has(uid)) {
        const u = UserAPI.getById(uid);
        if (u) mergedList.push({ user: u, lastMsg: null });
      }
    });

    setConversations(mergedList);

    // 2. Fetch group chat listings
    const allGroups = MsgAPI.getGroups();
    const joinedGroups = allGroups.filter(g => g.members.includes(currentUser.id));
    setGroups(joinedGroups);

    // 3. Thread selection logic
    if (activeChatUser) {
      // 1-to-1 selected externally
      setActiveGroup(null);
      const thread = MsgAPI.getThread(currentUser.id, activeChatUser.id);
      setMessages(thread);
    } else if (!activeGroup) {
      // Lazy auto-select first group if available, otherwise first direct conversation
      if (joinedGroups.length > 0) {
        setActiveGroup(joinedGroups[0]);
        setActiveChatUser(null);
        const gThread = MsgAPI.getGroupThread(joinedGroups[0].id);
        setMessages(gThread);
      } else if (mergedList.length > 0) {
        setActiveChatUser(mergedList[0].user);
        setActiveGroup(null);
        const dThread = MsgAPI.getThread(currentUser.id, mergedList[0].user.id);
        setMessages(dThread);
      }
    } else {
      // Sync current active group
      const gThread = MsgAPI.getGroupThread(activeGroup.id);
      setMessages(gThread);
    }
  };

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenDirectChat = (user: User) => {
    setActiveGroup(null);
    setActiveChatUser(user);
    const thread = MsgAPI.getThread(currentUser.id, user.id);
    setMessages(thread);
  };

  const handleOpenGroupChat = (group: GroupChat) => {
    setActiveChatUser(null);
    setActiveGroup(group);
    const thread = MsgAPI.getGroupThread(group.id);
    setMessages(thread);
  };

  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      triggerToast('Please provide a Group Channel Name.', 'error');
      return;
    }

    const members = [currentUser.id, ...selectedMemberIds];
    const newG = MsgAPI.createGroup(newGroupName.trim(), members, currentUser.id);
    
    // Add starter welcome message automatically
    MsgAPI.sendGroupMessage(
      newG.id, 
      currentUser.id, 
      `Group Chat "${newGroupName.trim()}" created by ${currentUser.name}. Welcome everyone! 👋`
    );

    triggerToast(`Group Chat "${newG.name}" created successfully!`, 'success');
    setNewGroupName('');
    setSelectedMemberIds([]);
    setShowCreateGroupModal(false);
    
    // Auto focus group chat
    setActiveChatUser(null);
    setActiveGroup(newG);
    loadChatData();
  };

  const handleToggleMemberSelect = (uid: string) => {
    if (selectedMemberIds.includes(uid)) {
      setSelectedMemberIds(selectedMemberIds.filter(id => id !== uid));
    } else {
      setSelectedMemberIds([...selectedMemberIds, uid]);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!msgText.trim()) return;
    const text = msgText.trim();
    setMsgText('');

    if (activeGroup) {
      // --- Group Message ---
      MsgAPI.sendGroupMessage(activeGroup.id, currentUser.id, text);
      const updatedMessages = MsgAPI.getGroupThread(activeGroup.id);
      setMessages(updatedMessages);

      // Reactive group simulations
      if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
      const currentG = activeGroup;

      replyTimerRef.current = setTimeout(() => {
        // Find other members
        const candidates = currentG.members.filter(id => id !== currentUser.id);
        if (candidates.length === 0) return;

        const randomMemberId = candidates[Math.floor(Math.random() * candidates.length)];
        const memberUser = UserAPI.getById(randomMemberId);
        
        if (memberUser) {
          const groupReplies = [
            `That sounds like a solid startup update! Let's schedule a huddle.`,
            `Grateful for the update. Dr. Gupta, should we benchmark this at the next incubation board meet?`,
            `Checked the tech sheet, looking robust! Let me know if you need review on Solidity or React.`,
            `Let's coordinate on Github later this evening.`,
            `We have prototype documentation prepped for verification.`
          ];
          const textReply = groupReplies[Math.floor(Math.random() * groupReplies.length)];
          MsgAPI.sendGroupMessage(currentG.id, randomMemberId, textReply);

          if (activeGroup?.id === currentG.id) {
            setMessages(MsgAPI.getGroupThread(currentG.id));
          } else {
            triggerToast(`New update in ${currentG.name} group chat! 👥`, 'info');
            loadChatData();
          }
        }
      }, 1800);

    } else if (activeChatUser) {
      // --- 1-to-1 Chat ---
      MsgAPI.send(currentUser.id, activeChatUser.id, text);
      const updatedThread = MsgAPI.getThread(currentUser.id, activeChatUser.id);
      setMessages(updatedThread);

      const convos = MsgAPI.getConversations(currentUser.id);
      const updatedConvos = conversations.map(c => {
        if (c.user.id === activeChatUser.id) {
          return { ...c, lastMsg: { from: currentUser.id, text, ts: Date.now() } };
        }
        return c;
      });
      setConversations(updatedConvos);

      if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
      const partner = activeChatUser;

      replyTimerRef.current = setTimeout(() => {
        const responses = [
          "That's an excellent point! I'm free to sync on Thursday afternoon.",
          "Sure, let's connect! When are you free contextually?",
          "Sounds like a plan! Let me run this past my team lead.",
          "Interesting idea! Love to collaborate and wireframe some concepts.",
          "Can you share more on the business model?"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        MsgAPI.send(partner.id, currentUser.id, randomResponse);

        if (activeChatUser?.id === partner.id) {
          loadChatData();
        } else {
          triggerToast(`New message received from ${partner.name}! 💬`, 'info');
        }
      }, 1500);
    }
  };

  // Lists matching contacts for searching
  const filteredConvos = conversations.filter(c =>
    c.user.name.toLowerCase().includes(searchContact.toLowerCase())
  );
  
  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchContact.toLowerCase())
  );

  return (
    <div className="bg-[#0d0d0f] border border-zinc-800/80 rounded-2xl shadow-xl h-[calc(100vh-100px)] flex overflow-hidden max-w-[1400px] mx-auto min-h-[500px] text-zinc-200">
      
      {/* LEFT SIDEBAR: Conversations Directory */}
      <div className={`w-full md:w-80 flex-shrink-0 border-r border-zinc-800/80 flex flex-col bg-[#0d0d0f] ${activeChatUser || activeGroup ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header toolbar */}
        <div className="p-4 border-b border-zinc-800/60 select-none">
          <div className="flex items-center justify-between mb-3 leading-none">
            <h3 className="text-lg font-extrabold text-white tracking-tight">E-Cell Chats</h3>
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/25 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
              title="Create new WhatsApp-style Group Chat"
            >
              <Plus className="w-4 h-4" />
              <span>New Group</span>
            </button>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchContact}
              onChange={(e) => setSearchContact(e.target.value)}
              className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#D4AF37] font-semibold text-zinc-200"
              placeholder="Search chats and channels..."
            />
          </div>
        </div>

        {/* Channels Streams List */}
        <div className="flex-1 overflow-y-auto select-none space-y-4 py-2 scrollbar-thin">
          
          {/* Section: GROUP CHANNELS */}
          <div>
            <div className="px-4 py-1 flex items-center justify-between text-[10px] font-extrabold text-[#D4AF37] tracking-widest uppercase">
              <span>Group Channels ({filteredGroups.length})</span>
              <Users className="w-3.5 h-3.5 text-[#D4AF37]/75" />
            </div>

            <div className="mt-1 divide-y divide-zinc-800/20">
              {filteredGroups.length === 0 ? (
                <p className="px-4 py-3 text-[11px] text-zinc-500 font-semibold italic">No matching groups found.</p>
              ) : (
                filteredGroups.map((group) => {
                  const isActive = activeGroup?.id === group.id;
                  return (
                    <button
                      key={group.id}
                      onClick={() => handleOpenGroupChat(group)}
                      className={`w-full text-left flex items-start gap-3 p-3.5 hover:bg-zinc-800/15 transition border-l-3 relative cursor-pointer ${
                        isActive ? 'bg-[#141417]/80 border-l-[#D4AF37] bg-yellow-500/5' : 'border-l-transparent'
                      }`}
                    >
                      <div className="w-9 h-9 bg-[#D4AF37]/10 text-[#D4AF37] font-bold border border-[#D4AF37]/20 rounded-full flex items-center justify-center shrink-0 text-xs">
                        {group.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <div className="text-xs font-extrabold text-zinc-200 truncate leading-none">
                            {group.name}
                          </div>
                        </div>
                        <p className="text-[10px] text-zinc-550 text-zinc-450 font-bold truncate">
                          👥 {group.members.length} members in workspace
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Section: DIRECT MESSAGES */}
          <div>
            <div className="px-4 py-1 text-[10px] font-extrabold text-zinc-400 tracking-widest uppercase flex items-center justify-between">
              <span>Direct Messages ({filteredConvos.length})</span>
              <Users className="w-3.5 h-3.5 text-zinc-500" />
            </div>

            <div className="mt-1 divide-y divide-zinc-800/20">
              {filteredConvos.length === 0 ? (
                <p className="px-4 py-3 text-[11px] text-zinc-500 font-semibold italic">No matching connections.</p>
              ) : (
                filteredConvos.map((convo) => {
                  const isActive = activeChatUser?.id === convo.user.id;
                  const preview = convo.lastMsg ? convo.lastMsg.text : 'Initiate discussion...';

                  return (
                    <button
                      key={convo.user.id}
                      onClick={() => handleOpenDirectChat(convo.user)}
                      className={`w-full text-left flex items-start gap-3 p-3.5 hover:bg-zinc-800/15 transition border-l-3 relative cursor-pointer ${
                        isActive ? 'bg-[#141417]/80 border-l-[#D4AF37]' : 'border-l-transparent'
                      }`}
                    >
                      <div className="w-9 h-9 bg-zinc-800 text-zinc-300 font-bold border border-zinc-700/80 rounded-full flex items-center justify-center shrink-0 text-xs uppercase">
                        {convo.user.initials}
                      </div>
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <div className="text-xs font-extrabold text-zinc-250 truncate leading-none">
                            {convo.user.name}
                          </div>
                          {convo.lastMsg && (
                            <span className="text-[9px] text-zinc-500 font-bold shrink-0">
                              {timeAgo(convo.lastMsg.ts)}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 font-semibold truncate">
                          {preview}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT SIDEBAR: Chat Pane container */}
      <div className={`flex-grow flex flex-col bg-[#0a0a0b]/75 ${!activeChatUser && !activeGroup ? 'hidden md:flex' : 'flex'}`}>
        {activeChatUser || activeGroup ? (
          <>
            {/* Header toolbar */}
            <div className="h-16 bg-[#0d0d0f] border-b border-zinc-800/80 px-6 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setActiveChatUser(null); setActiveGroup(null); }}
                  className="md:hidden p-1 rounded-lg text-zinc-400 hover:bg-zinc-800/40 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                {activeGroup ? (
                  /* Group Headers */
                  <>
                    <div className="w-9 h-9 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 text-xs font-extrabold rounded-full flex items-center justify-center shrink-0 uppercase select-none">
                      👥
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-150 leading-tight">
                        {activeGroup.name} (Group)
                      </h4>
                      <p className="text-[9px] text-[#D4AF37] font-bold mt-0.5">
                        {activeGroup.members.length} members active in workspace
                      </p>
                    </div>
                  </>
                ) : (
                  /* 1-to-1 headers */
                  <>
                    <button
                      type="button"
                      onClick={() => activeChatUser && onOpenProfile(activeChatUser.id)}
                      className="w-9 h-9 bg-[#D4AF37]/10 text-[#D4AF37] hover:scale-105 border border-[#D4AF37]/25 text-xs font-bold rounded-full flex items-center justify-center shrink-0 uppercase select-none transition cursor-pointer"
                    >
                      {activeChatUser?.initials}
                    </button>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-150 leading-tight">
                        {activeChatUser?.name}
                      </h4>
                      <p className="text-[9px] text-emerald-500 font-bold flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        <span>Active Now</span>
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerToast('Video meeting channels are in development!', 'info')}
                  className="p-2 text-zinc-404 text-zinc-400 rounded-xl hover:bg-zinc-805 hover:bg-zinc-800/40 transition cursor-pointer"
                  title="Initiate video connection"
                >
                  <Video className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (activeChatUser) {
                      onOpenProfile(activeChatUser.id);
                    } else if (activeGroup) {
                      const namesStr = activeGroup.members.map(id => UserAPI.getById(id)?.name || 'Guest').join(', ');
                      triggerToast(`Group Members: ${namesStr}`, 'info');
                    }
                  }}
                  className="p-2 text-zinc-404 text-zinc-400 rounded-xl hover:bg-zinc-805 hover:bg-zinc-800/40 transition cursor-pointer"
                  title="Workspace Details"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              <div className="text-center my-4 relative select-none">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-805 border-zinc-800/40" />
                </div>
                <span className="relative bg-[#0a0a0b] px-3.5 text-[9px] text-zinc-550 text-zinc-500 font-bold uppercase tracking-wider">
                  G H Raisoni Encrypted Network Feed
                </span>
              </div>

              {messages.length === 0 ? (
                <div className="text-center py-16 text-zinc-550 select-none">
                  <p className="text-xs text-zinc-500 font-semibold italic">No messages in this chat. Start coordination!</p>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isMine = m.from === currentUser.id;
                  const sender = UserAPI.getById(m.from);
                  const senderName = sender ? sender.name : 'Unknown Founder';
                  const senderInitials = sender ? sender.initials : '??';

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col max-w-[70%] animate-in fade-in slide-in-from-bottom-2 duration-150 ${
                        isMine ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      {/* Show sender details in group chats */}
                      {activeGroup && !isMine && (
                        <div className="flex items-center gap-1.5 mb-1 px-1 select-none">
                          <span className="w-4 h-4 bg-zinc-800 border border-zinc-700 text-[8px] font-bold text-zinc-350 rounded-full flex items-center justify-center shrink-0 uppercase">
                            {senderInitials}
                          </span>
                          <span className="text-[10px] text-zinc-450 font-bold text-zinc-400">
                            {senderName}
                          </span>
                        </div>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-2.5 text-xs font-semibold leading-relaxed shadow-md ${
                          isMine
                            ? 'bg-[#D4AF37] text-white rounded-tr-none'
                            : 'bg-[#141417] text-zinc-200 border border-zinc-800 rounded-tl-none'
                        }`}
                      >
                        {m.text}
                      </div>
                      
                      <span className="text-[9px] text-zinc-500 mt-1 px-1 font-semibold select-none">
                        {timeAgo(m.ts)}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Message Input form */}
            <form onSubmit={handleSendMessage} className="p-4 bg-[#0d0d0f] border-t border-zinc-800/80 flex items-center gap-2.5 shrink-0 select-none">
              <input
                type="text"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                placeholder={activeGroup ? `Message Group ${activeGroup.name}...` : `Message ${activeChatUser?.name.split(' ')[0]}...`}
                className="flex-1 bg-[#0a0a0b] border border-zinc-800 text-xs font-semibold rounded-xl p-3 focus:outline-none focus:border-[#D4AF37] text-white"
              />
              <button
                type="submit"
                className="w-10 h-10 bg-[#D4AF37] hover:bg-[#c29e2f] hover:scale-105 active:scale-95 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-yellow-600/10 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-550 select-none">
            <MessageSquare className="w-12 h-12 text-zinc-650 mb-3 animate-bounce" />
            <h4 className="font-bold text-zinc-400 text-sm">Select or Create a Chat Channel</h4>
            <p className="text-xs text-zinc-500 mt-1 font-semibold">
              Create a group workspace chat channel or select a direct discussion to coordinate.
            </p>
          </div>
        )}
      </div>

      {/* CREATE GROUP MODAL DIALOG */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4 select-none">
          <div className="bg-[#0c0c0e] border border-zinc-850 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            
            <div className="p-5 border-b border-zinc-800/70 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-[#D4AF37]" /> Create Workspace Group
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateGroupModal(false)}
                className="text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit}>
              <div className="p-5 space-y-4">
                
                <div>
                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Group Channel Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Smart India Board, CSE Developers"
                    className="w-full bg-[#050506] border border-zinc-800 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-[#D4AF37] text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Select Founders &amp; Mentors ({selectedMemberIds.length} Selected)
                  </label>
                  
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto bg-[#050506] border border-zinc-850 p-2.5 rounded-xl scrollbar-thin">
                    {UserAPI.getAll().filter(u => u.id !== currentUser.id && u.profileComplete).map((u) => {
                      const checked = selectedMemberIds.includes(u.id);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleToggleMemberSelect(u.id)}
                          className={`w-full text-left p-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                            checked ? 'bg-yellow-500/5 text-[#D4AF37]' : 'hover:bg-zinc-800/30 text-zinc-305 text-zinc-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-zinc-800/80 border border-zinc-700 font-mono text-[9px] flex items-center justify-center shrink-0">
                              {u.initials}
                            </span>
                            <div>
                              <span>{u.name}</span>
                              <span className="text-[9px] text-zinc-500 font-medium ml-1.5">({u.branch})</span>
                            </div>
                          </div>
                          
                          <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 transition ${
                            checked ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-zinc-700'
                          }`}>
                            {checked && <Check className="w-3 h-3 text-black stroke-[3.5px]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              <div className="bg-[#050506] p-4 flex gap-2.5 justify-end border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-zinc-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c29e2f] active:scale-95 text-white text-xs font-bold rounded-xl transition"
                >
                  Create Group Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
