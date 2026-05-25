/**
 * E-Cell GH Raisoni — Forum Discussions board
 * /src/components/DiscussionsPage.tsx
 */

import React, { useState, useEffect } from 'react';
import { MessageSquare, ArrowUp, ArrowDown, Pin, Award, ShieldAlert, Sparkles, BookOpen, Plus } from 'lucide-react';
import { DiscAPI, UserAPI, tagColor, timeAgo } from '../utils/db';
import { User, Discussion } from '../types';

interface DiscussionsPageProps {
  currentUser: User;
  triggerToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onOpenProfile: (id: string) => void;
}

const CATEGORIES = ['All', 'Startup Ideas', 'Finding Team Members', 'Hackathons', 'Funding & Investment', 'Technical Help', 'General E-Cell'];

export const DiscussionsPage: React.FC<DiscussionsPageProps> = ({
  currentUser,
  triggerToast,
  onOpenProfile
}) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [threads, setThreads] = useState<Discussion[]>([]);

  /* Grab top student contributors */
  const [contributors, setContributors] = useState<any[]>([]);

  /* New Discussion modal form */
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState('General E-Cell');

  useEffect(() => {
    loadThreads();
  }, [activeCategory, currentUser]);

  const loadThreads = () => {
    const list = DiscAPI.getByCategory(activeCategory, currentUser.role);
    /* Sort pinned first, then by upvotes desc */
    const sorted = [...list].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.votes - a.votes;
    });
    setThreads(sorted);

    /* Grab top contributors from student rosters */
    const students = UserAPI.getAll()
      .filter(u => u.role === 'student' && u.profileComplete)
      .slice(0, 3)
      .map((u, index) => ({
        user: u,
        points: 1420 - index * 340
      }));
    setContributors(students);
  };

  const handleVote = (id: string, direction: number) => {
    DiscAPI.vote(id, direction);
    loadThreads();
    triggerToast(direction > 0 ? 'Upvoted discuss thread!' : 'Downvoted discuss thread!', 'success');
  };

  const handleOpenNewTopic = () => {
    setNewTitle('');
    setNewBody('');
    setNewCategory('General E-Cell');
    setShowModal(true);
  };

  const handleSubmitTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) {
      triggerToast('Please write a valid title and overview.', 'error');
      return;
    }

    DiscAPI.create(currentUser.id, currentUser.name, {
      title: newTitle.trim(),
      body: newBody.trim(),
      category: newCategory
    });

    setShowModal(false);
    triggerToast('Discussion posted on campus boards! 🎉', 'success');
    loadThreads();
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 text-zinc-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-[#D4AF37] via-amber-400 to-yellow-600 bg-clip-text text-transparent tracking-tight">Entrepreneurship Forum</h2>
          <p className="text-zinc-450 text-zinc-400 text-sm font-semibold">Coordinate, brainstorm, and answer questions across G H Raisoni community</p>
        </div>

        <button
          onClick={handleOpenNewTopic}
          className="px-5 py-3 bg-[#D4AF37] hover:bg-[#c29e2f] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-yellow-600/10 active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Start Discussion</span>
        </button>
      </div>

      {/* CATEGORIES BUTTON FILTER ROW */}
      <div className="flex flex-wrap gap-2 py-1 scrollbars-hidden overflow-x-auto select-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-xs font-bold rounded-full transition whitespace-nowrap cursor-pointer ${
              activeCategory === cat
                ? 'bg-zinc-800 text-white border-zinc-700 border'
                : 'bg-[#0d0d0f] text-zinc-400 hover:text-white border border-zinc-800/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FORUM SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Threads List */}
        <div className="lg:col-span-3 space-y-4">
          {threads.length === 0 ? (
            <div className="bg-[#0d0d0f] rounded-2xl border border-zinc-800/85 p-16 text-center text-zinc-500 shadow-xl">
              <MessageSquare className="w-12 h-12 text-zinc-650 mx-auto mb-4" />
              <p className="font-semibold text-zinc-400">No discussions available under this filter yet.</p>
            </div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                className={`bg-[#0d0d0f] border hover:border-zinc-700/60 rounded-2xl p-5 shadow-md transition duration-200 relative ${
                  thread.pinned ? 'border-[#D4AF37]/50 bg-amber-550/[0.015]' : 'border-zinc-800/80'
                }`}
              >
                <div className="flex gap-4 items-start">
                   {/* Vote column */}
                  <div className="flex flex-col items-center gap-1 bg-[#0a0a0b] border border-zinc-800/80 rounded-xl p-1.5 shrink-0 min-w-10 select-none">
                    <button
                      onClick={() => handleVote(thread.id, 1)}
                      className="text-zinc-500 hover:text-[#D4AF37] focus:outline-none transition p-1 rounded-md cursor-pointer"
                      title="Upvote"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-extrabold text-zinc-200 leading-none">{thread.votes}</span>
                    <button
                      onClick={() => handleVote(thread.id, -1)}
                      className="text-zinc-500 hover:text-red-500 focus:outline-none transition p-1 rounded-md cursor-pointer"
                      title="Downvote"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Thread details */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap select-none">
                      <span className={`badge ${tagColor(thread.category)} text-[9px] font-bold`}>
                        {thread.category}
                      </span>
                      {thread.pinned && (
                        <span className="badge badge-gold text-[9px] font-bold inline-flex items-center gap-1">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </span>
                      )}
                      {thread.flagged && (
                        <span className="badge badge-red text-[9px] font-bold">Flagged</span>
                      )}
                      <span className="text-[10px] text-zinc-500 font-semibold">• {timeAgo(thread.ts)}</span>
                    </div>

                    <h4 className="text-sm sm:text-base font-extrabold text-zinc-100 tracking-tight leading-snug mb-1">
                      {thread.title}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-semibold mb-4 line-clamp-2">
                      {thread.body}
                    </p>

                    <div className="flex items-center justify-between gap-3 text-xs text-zinc-500 select-none">
                      <button
                        onClick={() => onOpenProfile(thread.authorId)}
                        className="flex items-center gap-1.5 text-left font-bold text-zinc-400 hover:text-[#D4AF37] cursor-pointer"
                      >
                        <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700/85 flex items-center justify-center font-bold text-[9px] text-zinc-400 uppercase">
                          {thread.author[0]}
                        </div>
                        <span>{thread.author}</span>
                      </button>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => triggerToast('Thread answers can be added in full pilot release.', 'info')}
                          className="flex items-center gap-1 text-[11px] font-bold hover:text-zinc-300 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{thread.replies} Replies</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-6 lg:sticky lg:top-20">
          {/* Rules panel */}
          <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden select-none">
            <div className="absolute bottom-[-10px] right-[-6px] text-zinc-800 opacity-20 pointer-events-none">
              <ShieldAlert className="w-28 h-28" />
            </div>
            <h4 className="font-extrabold text-xs text-[#D4AF37] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span>Community Rules</span>
            </h4>
            <ul className="space-y-4 text-xs font-semibold text-zinc-400 leading-relaxed relative z-10">
              <li className="flex gap-2.5">
                <span className="text-[#D4AF37] font-extrabold">01</span>
                <span>Stay professional, academic, and respectful to student and faculty moderators.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-[#D4AF37] font-extrabold">02</span>
                <span>Perform search checks prior to creating duplicate topic questions.</span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-[#D4AF37] font-extrabold">03</span>
                <span>Do not drop external promotional/spam referral links on general threads.</span>
              </li>
            </ul>
          </div>

          {/* Leaderboard contributors */}
          <div className="bg-[#0d0d0f] border border-zinc-800/80 rounded-2xl p-5 shadow-lg shadow-black/20 select-none">
            <h4 className="font-extrabold text-zinc-200 text-sm mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#D4AF37]" />
              <span>Incubator Contributors</span>
            </h4>

            <div className="space-y-3.5">
              {contributors.map((contrib, idx) => (
                <div key={contrib.user.id} className="flex items-center justify-between gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => onOpenProfile(contrib.user.id)}
                    className="flex items-center gap-2.5 text-left group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center font-bold text-zinc-300 group-hover:text-[#D4AF37] transition text-[10px]">
                      {contrib.user.initials}
                    </div>
                    <div>
                      <div className="font-bold text-zinc-200 truncate max-w-[120px] group-hover:text-[#D4AF37]">
                        {contrib.user.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-semibold">
                        {contrib.user.branch}
                      </div>
                    </div>
                  </button>

                  <div className="text-right">
                    <span className="font-extrabold text-zinc-200 font-mono">{contrib.points}</span>
                    <span className="text-[9px] text-[#D4AF37] font-bold block">
                      {idx === 0 ? '🏆 Master' : '⭐ Scholar'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* START NEW DISCUSSION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSubmitTopic}
            className="bg-[#0d0d0f] border border-zinc-805 border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200"
          >
            <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2 select-none">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <span>Start a Discussion Topic</span>
              </h3>
              <button
                type="button"
                className="text-zinc-500 hover:text-zinc-350 cursor-pointer text-sm"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">Category Board</label>
                <div className="flex flex-wrap gap-1.5 select-none">
                  {CATEGORIES.filter(x => x !== 'All').map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition border cursor-pointer ${
                        newCategory === cat
                          ? 'bg-[#D4AF37] text-white border-[#D4AF37]'
                          : 'bg-[#0a0a0b] border-zinc-800 text-zinc-400 hover:border-[#D4AF37]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">Topic Heading</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Tips on applying for seed-funding grants?"
                  className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl p-3 text-xs focus:outline-none focus:border-[#D4AF37] text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">Detail Query Context</label>
                <textarea
                  rows={4}
                  required
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Share detail queries or perspectives to begin discussion..."
                  className="w-full bg-[#0a0a0b] border border-zinc-805 border-zinc-800 rounded-xl p-3 text-xs focus:outline-none focus:border-[#D4AF37] text-zinc-100 font-semibold leading-relaxed"
                />
              </div>
            </div>

            <div className="bg-[#0a0a0b] p-4 flex gap-3 justify-end border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-zinc-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c29e2f] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Post Discussion
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
