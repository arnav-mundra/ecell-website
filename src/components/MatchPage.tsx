/**
 * E-Cell GH Raisoni — Teammate & Co-Founder Matchmaking Engine
 * /src/components/MatchPage.tsx
 */

import React, { useState, useEffect } from 'react';
import { Search, Bookmark, Handshake, Users, Sparkles, AlertCircle, BookmarkCheck } from 'lucide-react';
import { UserAPI } from '../utils/db';
import { User } from '../types';

interface MatchPageProps {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  triggerToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onOpenProfile: (id: string) => void;
}

export const MatchPage: React.FC<MatchPageProps> = ({
  currentUser,
  setCurrentUser,
  triggerToast,
  onOpenProfile
}) => {
  const [candidates, setCandidates] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [intentFilter, setIntentFilter] = useState('');

  /* Bookmark states */
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  /* Connect Invite Modal states */
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<User | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');

  useEffect(() => {
    loadCandidates();
  }, [search, domainFilter, roleFilter, intentFilter, currentUser]);

  const loadCandidates = () => {
    let list = UserAPI.getMatchCandidates(currentUser.id, {
      search,
      domain: domainFilter,
      role: roleFilter
    });
    if (intentFilter) {
      list = list.filter(u => u.intentMode === intentFilter);
    }
    setCandidates(list);
  };

  const handleOpenConnect = (user: User) => {
    setPendingTarget(user);
    const firstName = user.name.split(' ')[0];
    setInviteMessage(`Hi ${firstName}! I reviewed your entrepreneur profile and noticed your focus on ${user.skills.slice(0, 2).join(' & ')}. I'd love to connect, consult on our projects, and perhaps collaborate!`);
    setShowConnectModal(true);
  };

  const handleSendRequest = () => {
    if (!pendingTarget) return;
    const ok = UserAPI.connect(currentUser.id, pendingTarget.id);
    setShowConnectModal(false);

    if (ok) {
      const freshMe = UserAPI.getById(currentUser.id);
      if (freshMe) setCurrentUser(freshMe);
      triggerToast(`Connection invite dispatched to ${pendingTarget.name}! 🤝`, 'success');
    } else {
      triggerToast('Already connected with this member.', 'info');
    }
  };

  const handleToggleBookmark = (id: string) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter(x => x !== id));
      triggerToast('Removed profile from bookmarks.', 'info');
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
      triggerToast('Saved profile to bookmarks list!', 'success');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 text-zinc-200">
      <div className="bg-gradient-to-br from-[#141417] to-[#0a0a0b] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-lg shadow-black/30 select-none">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-[#D4AF37] via-amber-400 to-yellow-600 bg-clip-text text-transparent">Campus Startup Matchmaking</h2>
        <p className="text-zinc-400 text-sm max-w-2xl font-semibold leading-relaxed">
          Find your next technical co-founder, UI/UX designer, sales wizard, or business partner inside the G H Raisoni College engineering and management incubator community.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-[#0d0d0f] border border-zinc-800/80 rounded-2xl p-4 shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#0a0a0b] border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37] transition text-zinc-100 font-semibold"
            placeholder="Search by name, skill, keyword, branch..."
          />
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="sm:w-44 bg-[#0a0a0b] border border-zinc-800 p-3 rounded-xl text-xs text-zinc-400 font-bold focus:outline-none cursor-pointer focus:border-[#D4AF37] h-[46px]"
          >
            <option value="">All Domains</option>
            <option value="AI/ML">AI/ML</option>
            <option value="FinTech">FinTech</option>
            <option value="EdTech">EdTech</option>
            <option value="AgriTech">AgriTech</option>
            <option value="HealthTech">HealthTech</option>
            <option value="SaaS">SaaS</option>
            <option value="Web3">Web3</option>
            <option value="IoT">IoT</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="sm:w-44 bg-[#0a0a0b] border border-zinc-800 p-3 rounded-xl text-xs text-zinc-400 font-bold focus:outline-none cursor-pointer focus:border-[#D4AF37] h-[46px]"
          >
            <option value="">All Roles</option>
            <option value="Co-Founder">Co-Founder</option>
            <option value="Startup Member">Startup Member</option>
            <option value="Project Intern">Project Intern</option>
            <option value="Developer">Developer</option>
            <option value="Designer">Designer</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
            <option value="Business">Business</option>
          </select>

          <select
            value={intentFilter}
            onChange={(e) => setIntentFilter(e.target.value)}
            className="sm:w-44 bg-[#0a0a0b] border border-zinc-800 p-3 rounded-xl text-xs text-zinc-400 font-bold focus:outline-none cursor-pointer focus:border-[#D4AF37] h-[46px]"
          >
            <option value="">All Goals</option>
            <option value="founder">Startup Founders</option>
            <option value="member_intern">Aspiring Interns / Members</option>
            <option value="both">Open to Both</option>
          </select>
        </div>
      </div>

      {/* CANDIDATES GRID */}
      {candidates.length === 0 ? (
        <div className="bg-[#0d0d0f] rounded-2xl border border-zinc-800/85 p-16 text-center text-zinc-500 shadow-xl">
          <AlertCircle className="w-12 h-12 text-zinc-650 mx-auto mb-4 animate-pulse" />
          <p className="font-semibold text-zinc-400">No partners match your criteria. Try loosening search terms!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => {
            const isConnected = currentUser.connections.includes(candidate.id);
            const isBookmarked = bookmarkedIds.includes(candidate.id);

            return (
              <div
                key={candidate.id}
                className="bg-[#0d0d0f] border border-zinc-800/80 hover:border-zinc-700/60 rounded-2xl p-6 shadow-md hover:shadow-xl flex flex-col justify-between transition duration-300 h-full"
              >
                <div>
                  {/* Top Row: initials & looking indicators */}
                  <div className="flex items-start justify-between gap-3 mb-4 select-none">
                    <button
                        type="button"
                        onClick={() => onOpenProfile(candidate.id)}
                        className="flex items-center gap-3 text-left group shrink-0 cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-[#D4AF37]/10 text-[#D4AF37] font-extrabold text-base rounded-full flex items-center justify-center uppercase select-none shrink-0 group-hover:scale-105 transition border border-[#D4AF37]/20">
                        {candidate.initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-zinc-150 group-hover:text-[#D4AF37] transition text-sm leading-tight truncate max-w-[130px]">
                          {candidate.name}
                        </h4>
                        <p className="text-[11px] text-zinc-450 text-zinc-450/90 font-semibold leading-relaxed mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                          {candidate.branch} • {candidate.year}
                        </p>
                      </div>
                    </button>

                    {candidate.intentMode === 'founder' && (
                      <span className="badge badge-gold scale-90 origin-top-right shrink-0">Founder</span>
                    )}
                    {candidate.intentMode === 'member_intern' && (
                      <span className="badge badge-blue scale-90 origin-top-right shrink-0">Intern Seeker</span>
                    )}
                    {candidate.intentMode === 'both' && (
                      <span className="badge badge-green scale-90 origin-top-right shrink-0">Dual Goal</span>
                    )}
                    {!candidate.intentMode && (
                      <span className="badge badge-zinc scale-90 origin-top-right shrink-0">Ecosystem</span>
                    )}
                  </div>

                  {/* Bio */}
                  <p className="text-zinc-400 font-semibold text-xs leading-relaxed line-clamp-3 mb-4 min-h-[54px]">
                    {candidate.bio}
                  </p>

                  {/* Skills Tag row */}
                  {candidate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4 select-none">
                      {candidate.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="chip text-[10px] font-bold py-0.5 px-2 bg-[#141417] border border-zinc-800">
                          {skill}
                        </span>
                      ))}
                      {candidate.domains.slice(0, 1).map((domain) => (
                        <span key={domain} className="chip text-[10px] font-bold py-0.5 px-2 bg-yellow-500/5 text-[#D4AF37] border border-[#D4AF37]/20">
                          {domain}
                        </span>
                      ))}
                    </div>
                  )}

                  {candidate.lookingFor.length > 0 && (
                    <div className="bg-[#141417]/40 p-3 rounded-xl border border-zinc-800/60 mb-5 text-[11px] font-semibold text-zinc-400 flex flex-col gap-1 select-none">
                      <div className="text-[10px] text-zinc-550 font-bold uppercase tracking-widest leading-none mb-0.5">Seeking Collaborator:</div>
                      <div className="text-zinc-250 font-bold overflow-hidden text-ellipsis truncate">
                        {candidate.lookingFor.join(' • ')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Bottom */}
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60 mt-auto select-none">
                  {isConnected ? (
                    <button
                      disabled
                      className="flex-1 py-2.5 bg-zinc-800/40 text-zinc-500 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Users className="w-4 h-4" />
                      <span>Connected</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenConnect(candidate)}
                      className="flex-1 py-2.5 bg-[#D4AF37] hover:bg-[#c29e2f] text-white font-bold text-xs rounded-xl transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Handshake className="w-4 h-4" />
                      <span>Connect</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleBookmark(candidate.id)}
                    className={`w-9 h-9 border border-zinc-800 hover:border-[#D4AF37] rounded-xl flex items-center justify-center transition shrink-0 cursor-pointer ${
                      isBookmarked ? 'bg-yellow-500/5 text-[#D4AF37] border-[#D4AF37]' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title={isBookmarked ? 'Unbookmark' : 'Bookmark for later'}
                  >
                    {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONNECT INVITE DIALOG POP-OVER */}
      {showConnectModal && pendingTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d0f] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-zinc-800/80">
              <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2 select-none font-sans">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <span>Connect with {pendingTarget.name}</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-1 font-semibold leading-normal select-none">
                Connecting establishes a standard DM pipeline. Custom messages make responses 3x more likely!
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">Invite Message Greet</label>
                <textarea
                  rows={4}
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="w-full bg-[#0a0a0b] border border-zinc-805 border-zinc-800/80 rounded-xl p-3 text-xs focus:outline-none focus:border-[#D4AF37] text-zinc-100 font-semibold leading-relaxed"
                />
              </div>
            </div>

            <div className="bg-[#0a0a0b] p-4 flex gap-3 justify-end border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setShowConnectModal(false)}
                className="px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-zinc-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendRequest}
                className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c29e2f] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
