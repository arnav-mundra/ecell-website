/**
 * E-Cell GH Raisoni — Home Feed Page (LinkedIn-Style)
 * /src/components/FeedPage.tsx
 */

import React, { useState, useEffect } from 'react';
import { Lightbulb, Briefcase, Sparkles, MessageSquare, ThumbsUp, Share2, Trash2, Edit2, UserPlus, Check, Pin } from 'lucide-react';
import { PostAPI, UserAPI, tagColor, timeAgo } from '../utils/db';
import { User, Post } from '../types';

interface FeedPageProps {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  triggerToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  activePostModalPreset: string; /* 'idea', 'hiring', 'update' etc */
  onOpenProfile: (id: string) => void;
}

export const FeedPage: React.FC<FeedPageProps> = ({
  currentUser,
  setCurrentUser,
  triggerToast,
  onOpenProfile
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [modalBody, setModalBody] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);

  /* Comment toggle states inline */
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});

  /* Sidebar suggested users */
  const [suggestions, setSuggestions] = useState<User[]>([]);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = () => {
    setPosts(PostAPI.getAll());
    /* Get some student suggestions who aren't currently connected */
    const allUsers = UserAPI.getAll().filter(u => u.id !== currentUser.id && u.role === 'student' && u.profileComplete);
    /* Filter to non-connections preferably */
    const nonConnected = allUsers.filter(u => !(currentUser.connections || []).includes(u.id));
    setSuggestions(nonConnected.slice(0, 4));
  };

  const handleOpenPostModal = (preset: string = '') => {
    setEditingPostId(null);
    setModalBody('');
    setModalImage(null);
    if (preset === 'idea') {
      setSelectedTags(['Startup Ideas']);
    } else if (preset === 'hiring') {
      setSelectedTags(['Hiring']);
    } else if (preset === 'update') {
      setSelectedTags(['Update']);
    } else {
      setSelectedTags([]);
    }
    setShowPostModal(true);
  };

  const handleOpenEditPost = (post: Post) => {
    setEditingPostId(post.id);
    setModalBody(post.body);
    setSelectedTags(post.tags);
    setModalImage(post.image || null);
    setShowPostModal(true);
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmitPost = () => {
    if (!modalBody.trim()) {
      triggerToast('Please write something in your post.', 'error');
      return;
    }

    if (editingPostId) {
      PostAPI.update(editingPostId, {
        body: modalBody,
        tags: selectedTags,
        image: modalImage
      });
      triggerToast('Post updated successfully!', 'success');
    } else {
      PostAPI.create(currentUser.id, {
        body: modalBody,
        tags: selectedTags,
        image: modalImage
      });
      triggerToast('Post published on feed!', 'success');
    }

    setShowPostModal(false);
    loadFeed();
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this feed post?')) {
      PostAPI.delete(postId);
      triggerToast('Post deleted.', 'info');
      loadFeed();
    }
  };

  const handleToggleLike = (postId: string) => {
    PostAPI.toggleLike(postId, currentUser.id);
    loadFeed();
  };

  const handleToggleComments = (postId: string) => {
    setExpandedCommentsPostId(expandedCommentsPostId === postId ? null : postId);
  };

  const handleAddComment = (postId: string) => {
    const text = newCommentText[postId]?.trim();
    if (!text) return;

    const res = PostAPI.addComment(postId, currentUser.id, text);
    if (res) {
      setNewCommentText(p => ({ ...p, [postId]: '' }));
      triggerToast('Comment added successfully!', 'success');
      loadFeed();
    }
  };

  const handleConnect = (targetId: string) => {
    const ok = UserAPI.connect(currentUser.id, targetId);
    if (ok) {
      /* Re-read session user */
      const freshMe = UserAPI.getById(currentUser.id);
      if (freshMe) setCurrentUser(freshMe);
      triggerToast('Connected! 🤝 Choose standard messaging to talk.', 'success');
      loadFeed();
    } else {
      triggerToast('You are already connected with this member.', 'info');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto text-zinc-200">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Main Feed Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* COMPOSER BOX */}
          <div className="bg-[#0d0d0f] border border-zinc-800/80 rounded-2xl p-5 shadow-lg shadow-black/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-11 h-11 bg-[#D4AF37]/10 text-[#D4AF37] font-extrabold text-sm rounded-full flex items-center justify-center uppercase select-none shrink-0 border border-[#D4AF37]/20">
                {currentUser.initials}
              </div>
              <button
                type="button"
                onClick={() => handleOpenPostModal()}
                className="flex-1 bg-[#0a0a0b] border border-zinc-800 hover:border-[#D4AF37] text-left px-5 py-3 rounded-full text-sm text-zinc-500 font-medium transition cursor-pointer"
              >
                What's on your mind, {currentUser.name.split(' ')[0]}?
              </button>
            </div>

            <div className="flex gap-2 pt-4 border-t border-zinc-800/60">
              <button
                onClick={() => handleOpenPostModal('idea')}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2 text-xs font-bold text-zinc-405 text-zinc-400 hover:bg-zinc-800/30 rounded-xl transition cursor-pointer"
              >
                <Lightbulb className="w-4 h-4 text-[#2ea055]" />
                <span>Share Idea</span>
              </button>
              <button
                onClick={() => handleOpenPostModal('hiring')}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2 text-xs font-bold text-zinc-405 text-zinc-400 hover:bg-zinc-800/30 rounded-xl transition cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-blue-500" />
                <span>Hiring</span>
              </button>
              <button
                onClick={() => handleOpenPostModal('update')}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2 text-xs font-bold text-zinc-405 text-zinc-400 hover:bg-zinc-800/30 rounded-xl transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Update</span>
              </button>
            </div>
          </div>

          {/* POSTS CARDS */}
          {posts.length === 0 ? (
            <div className="bg-[#0d0d0f] text-center py-16 px-4 rounded-2xl border border-zinc-805 border-zinc-800/80 text-zinc-500 shadow-xl">
              <MessageSquare className="w-12 h-12 text-zinc-650 mx-auto mb-4" />
              <p className="font-semibold text-zinc-400">No feed items found. Be the first to publish!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const likedByMe = post.likes.includes(currentUser.id);
                const isMyPost = post.authorId === currentUser.id;

                /* Dig up author specs */
                const authorUser = UserAPI.getById(post.authorId);
                const authorMeta = authorUser
                  ? `${authorUser.branch}${authorUser.year ? ', ' + authorUser.year : ''}`
                  : 'Incubator Network Member';

                return (
                  <article
                    key={post.id}
                    className="bg-[#0d0d0f] border border-zinc-800/80 rounded-2xl p-6 shadow-md transition hover:border-zinc-700/60 relative"
                  >
                    {/* Post Author Info Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <button
                        type="button"
                        onClick={() => onOpenProfile(post.authorId)}
                        className="flex items-center gap-3 text-left group cursor-pointer"
                      >
                        <div className="w-11 h-11 bg-[#D4AF37]/10 text-[#D4AF37] font-extrabold text-sm rounded-full flex items-center justify-center uppercase select-none shrink-0 group-hover:scale-105 transition border border-[#D4AF37]/20">
                          {post.initials}
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-150 text-sm group-hover:text-[#D4AF37] transition leading-tight">
                            {post.author}
                          </h3>
                          <p className="text-xs text-zinc-450 text-zinc-400 font-semibold mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] sm:max-w-xs">
                            {authorMeta}
                          </p>
                          <span className="text-[10px] text-zinc-500 font-semibold">{timeAgo(post.ts)}</span>
                        </div>
                      </button>

                      {/* Right contextual controls */}
                      {isMyPost && (
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => handleOpenEditPost(post)}
                            className="p-1.5 rounded-full text-zinc-500 hover:text-[#D4AF37] hover:bg-zinc-800 transition cursor-pointer"
                            title="Edit this post"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1.5 rounded-full text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition cursor-pointer"
                            title="Delete this post"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Tag chips row */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3 select-none">
                        {post.tags.map(tag => (
                          <span key={tag} className={`badge ${tagColor(tag)} text-[10px] font-bold`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Body text content */}
                    <div className="text-sm text-zinc-300 leading-relaxed mb-5 font-semibold whitespace-pre-wrap">
                      {post.body}
                    </div>

                    {/* Image Attachment */}
                    {post.image && (
                      <div className="mb-5 rounded-xl overflow-hidden border border-zinc-800 bg-[#0a0a0b] max-h-[380px] flex items-center justify-center select-none">
                        <img 
                          src={post.image} 
                          alt="Post attachment" 
                          className="w-full object-cover max-h-[380px] hover:scale-[1.01] transition duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {/* Likes & Actions row */}
                    <div className="flex items-center gap-1.5 pt-3.5 border-t border-zinc-800/60 select-none">
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          likedByMe
                            ? 'text-[#D4AF37] bg-yellow-500/5'
                            : 'text-zinc-400 hover:bg-zinc-800/40'
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${likedByMe ? 'fill-current' : ''}`} />
                        <span>
                          {post.likes.length > 0 ? post.likes.length : ''} Like{post.likes.length !== 1 ? 's' : ''}
                        </span>
                      </button>

                      <button
                        onClick={() => handleToggleComments(post.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          expandedCommentsPostId === post.id ? 'text-[#D4AF37] bg-yellow-500/5' : 'text-zinc-400 hover:bg-zinc-800/40'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4 text-zinc-500" />
                        <span>{post.comments || 0} Comments</span>
                      </button>

                      <button
                        onClick={() => {
                          const url = window.location.href;
                          navigator.clipboard.writeText(url);
                          triggerToast('Copied campus link to clipboard!', 'success');
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:bg-zinc-800/40 transition ml-auto cursor-pointer"
                        title="Copy share link"
                      >
                        <Share2 className="w-4 h-4 text-zinc-500" />
                        <span className="hidden sm:inline">Share</span>
                      </button>
                    </div>

                    {/* Inline Expanded Comments Drawer Section */}
                    {expandedCommentsPostId === post.id && (
                      <div className="mt-4 pt-4 border-t border-zinc-800/60 space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 select-none">
                          Comments ({post.comments || 0})
                        </p>

                        {/* List of comments */}
                        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                          {(!post.commentsList || post.commentsList.length === 0) ? (
                            <p className="text-xs text-zinc-500 font-semibold italic text-center py-2 select-none">No comments on this startup yet. Start the conversation!</p>
                          ) : (
                            post.commentsList.map((c) => (
                              <div key={c.id} className="flex items-start gap-2.5 bg-[#0a0a0b]/50 border border-zinc-800/40 p-3 rounded-xl">
                                <div className="w-7 h-7 bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[10px] text-[#D4AF37] font-bold shrink-0 rounded-full flex items-center justify-center uppercase select-none">
                                  {c.authorInitials || '??'}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex justify-between items-baseline mb-0.5 select-none animate-in fade-in transition duration-150">
                                    <span className="text-xs font-bold text-zinc-300">{c.authorName}</span>
                                    <span className="text-[10px] text-zinc-500 font-medium">{timeAgo(c.ts)}</span>
                                  </div>
                                  <div className="text-xs text-zinc-400 leading-normal font-medium whitespace-pre-wrap">{c.text}</div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Write Comment Form */}
                        <form
                          onSubmit={(e) => { e.preventDefault(); handleAddComment(post.id); }}
                          className="flex items-center gap-2 pt-1"
                        >
                          <input
                            type="text"
                            value={newCommentText[post.id] || ''}
                            onChange={(e) => setNewCommentText(p => ({ ...p, [post.id]: e.target.value }))}
                            placeholder="Add a comment to this post..."
                            className="flex-1 bg-[#0a0a0b] border border-zinc-805 text-xs font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#D4AF37] text-white"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#c29e2f] active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                          >
                            Comment
                          </button>
                        </form>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6 lg:sticky lg:top-20">
          {/* Profile Mini Card */}
          <div className="bg-[#0d0d0f] border border-zinc-800/80 rounded-2xl p-5 shadow-lg shadow-black/20 text-center">
            <button
              onClick={() => onOpenProfile(currentUser.id)}
              className="w-16 h-16 bg-[#D4AF37]/10 text-[#D4AF37] text-2xl font-extrabold rounded-full flex items-center justify-center mx-auto mb-3 select-none hover:scale-105 transition border border-[#D4AF37]/20 uppercase cursor-pointer"
            >
              {currentUser.initials}
            </button>
            <h3 className="font-extrabold text-zinc-200 text-sm">{currentUser.name}</h3>
            <p className="text-zinc-500 text-xs font-semibold mt-1">
              {currentUser.branch}{currentUser.year ? ' • ' + currentUser.year : ''}
            </p>
            <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase mt-2 text-[#D4AF37] bg-yellow-500/5 inline-block px-2.5 py-0.5 rounded-md border border-yellow-500/10">
              {(currentUser.domains || [])[0] || 'Entrepreneur'}
            </p>

            <div className="grid grid-cols-2 gap-2 my-5 select-none">
              <div className="bg-[#0a0a0b] p-2.5 rounded-lg text-center border border-zinc-800/80">
                <div className="text-lg font-extrabold text-zinc-100 font-mono">
                  {(currentUser.connections || []).length}
                </div>
                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none mt-1">Connections</div>
              </div>

              <div className="bg-[#0a0a0b] p-2.5 rounded-lg text-center border border-[#0a0a0b] border-zinc-800/80">
                <div className="text-lg font-extrabold text-zinc-100 font-mono">
                  {posts.filter(p => p.authorId === currentUser.id).length}
                </div>
                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none mt-1">My Posts</div>
              </div>
            </div>

            <button
              onClick={() => onOpenProfile(currentUser.id)}
              className="w-full py-2 bg-[#0a0a0b] border border-zinc-800 hover:border-[#D4AF37] hover:text-[#D4AF37] text-zinc-400 hover:bg-[#141417]/30 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Consult Profile Details
            </button>
          </div>

          {/* Connection Recommendations Column */}
          <div className="bg-[#0d0d0f] border border-zinc-800/80 rounded-2xl p-5 shadow-lg shadow-black/20">
            <h4 className="font-extrabold text-zinc-100 text-sm mb-4">
              People You May Know
            </h4>
            
            {suggestions.length === 0 ? (
              <p className="text-xs text-zinc-500 font-semibold leading-relaxed">You are connected with everyone available!</p>
            ) : (
              <div className="space-y-3">
                {suggestions.map((rec) => (
                  <div key={rec.id} className="flex items-center justify-between gap-3 bg-[#0a0a0b] p-2.5 rounded-xl border border-zinc-800/60">
                    <button
                      type="button"
                      onClick={() => onOpenProfile(rec.id)}
                      className="flex items-center gap-2.5 text-left group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-[#D4AF37]/10 flex items-center justify-center text-xs font-bold text-zinc-300 group-hover:text-[#D4AF37] border border-zinc-700/80">
                        {rec.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-200 truncate group-hover:text-[#D4AF37] max-w-[110px]">
                          {rec.name}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-semibold truncate max-w-[110px]">
                          {rec.branch} • {rec.year}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConnect(rec.id)}
                      className="p-1.5 bg-[#141417] hover:bg-yellow-500/5 text-[#D4AF37] hover:text-[#c29e2f] border border-zinc-800 hover:border-[#D4AF37]/40 rounded-lg transition cursor-pointer"
                      title="Quick connect"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FEED POST COMPOSE DIALOG MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d0f] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-white tracking-tight">
                {editingPostId ? 'Edit Feed Post' : 'Create Feed Post'}
              </h3>
              <button
                type="button"
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer text-sm"
                onClick={() => setShowPostModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">
                  Select Associated Category Tags
                </label>
                <div className="flex flex-wrap gap-1.5 select-none">
                  {['Startup Ideas', 'Hiring', 'Update', 'Hackathon', 'Opportunity'].map((tag) => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition border cursor-pointer ${
                          active
                            ? 'bg-[#D4AF37] text-white border-[#D4AF37]'
                            : 'bg-[#0a0a0b] border-zinc-800 text-zinc-400 hover:border-[#D4AF37]'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">Content Body</label>
                <textarea
                  rows={4}
                  value={modalBody}
                  onChange={(e) => setModalBody(e.target.value)}
                  placeholder="Share updates, startup insights, opportunities, or find teams..."
                  className="w-full bg-[#0a0a0b] border border-zinc-805 border-zinc-800/80 rounded-xl p-3 text-sm focus:outline-none focus:border-[#D4AF37] text-zinc-100 font-semibold leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">
                  Add Image Attachment (Optional)
                </label>
                <div className="space-y-3">
                  <div className="flex flex-wrap sm:flex-nowrap gap-2.5 items-center">
                    {/* File Attachment */}
                    <input
                      type="file"
                      accept="image/*"
                      id="post-file-upload"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setModalImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label
                      htmlFor="post-file-upload"
                      className="whitespace-nowrap px-3.5 py-2.5 bg-zinc-800/60 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-2 select-none shrink-0"
                    >
                      📁 Choose File
                    </label>

                    {/* Preset Vectors */}
                    <div className="flex-1 min-w-[200px]">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setModalImage(e.target.value);
                          }
                        }}
                        className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl p-2.5 text-xs font-bold text-zinc-400 focus:outline-none focus:border-[#D4AF37]"
                        defaultValue=""
                      >
                        <option value="" disabled>Or choose beautiful startup graphic...</option>
                        <option value="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop">Workspace Tech Stack</option>
                        <option value="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop">Founder Cooperation Brainstorm</option>
                        <option value="https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=600&auto=format&fit=crop">Investor Pitch Deck Event</option>
                        <option value="https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop">Product Outline Mockups</option>
                      </select>
                    </div>
                  </div>

                  {/* Text URL Optional Input */}
                  <input
                    type="text"
                    value={modalImage || ''}
                    onChange={(e) => setModalImage(e.target.value || null)}
                    placeholder="Or paste direct image URL here..."
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#D4AF37] text-zinc-200"
                  />

                  {/* Image Attachment Preview inside Modal */}
                  {modalImage && (
                    <div className="relative border border-zinc-800 rounded-xl overflow-hidden bg-[#0a0a0b] max-h-[140px] flex items-center justify-center">
                      <img
                        src={modalImage}
                        alt="Workspace Preview"
                        className="h-[140px] w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setModalImage(null)}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs w-5.5 h-5.5 rounded-full flex items-center justify-center cursor-pointer shadow select-none"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0b] p-4 flex gap-3 justify-end border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-zinc-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitPost}
                className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c29e2f] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                {editingPostId ? 'Save Changes' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
