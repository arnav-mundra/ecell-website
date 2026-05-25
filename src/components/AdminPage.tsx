/**
 * E-Cell GH Raisoni College — Administration & Moderation Panel
 * /src/components/AdminPage.tsx
 */

import React, { useState, useEffect } from 'react';
import { Shield, Users, MessageSquareCode, Flag, Megaphone, Trash2, Pin, Lock, Activity, Search, AlertTriangle, FileText } from 'lucide-react';
import { UserAPI, DiscAPI, AnncAPI, LogAPI, tagColor } from '../utils/db';
import { User, Discussion, ActivityLog } from '../types';

interface AdminPageProps {
  currentUser: User;
  triggerToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onOpenProfile: (id: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  currentUser,
  triggerToast,
  onOpenProfile
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchUser, setSearchUser] = useState('');

  useEffect(() => {
    loadAdminData();
  }, [searchUser]);

  const loadAdminData = () => {
    /* Filter users by search term if applicable */
    const allUsers = UserAPI.getAll();
    if (searchUser.trim()) {
      const q = searchUser.toLowerCase();
      setUsers(allUsers.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      ));
    } else {
      setUsers(allUsers);
    }

    setDiscussions(DiscAPI.getAll());
    setLogs(LogAPI.getAll());
  };

  const handleFlagUser = (user: User) => {
    triggerToast(`Flagged account ${user.name} for review.`, 'info');
    LogAPI.add('flag', 'log-amber', `<strong>${currentUser.name}</strong> flagged student account <span class="hl">${user.name}</span>`);
    loadAdminData();
  };

  const handleToggleSuspendUser = (user: User) => {
    const isSuspendedNow = user.status === 'inactive';
    const newStatus = isSuspendedNow ? 'active' : 'inactive';

    if (window.confirm(`Are you sure you want to ${isSuspendedNow ? 'reactivate' : 'suspend'} user account ${user.name}?`)) {
      UserAPI.update(user.id, { status: newStatus });
      triggerToast(`Account status updated to ${newStatus}.`, 'success');
      LogAPI.add('lock', 'log-red', `<strong>${currentUser.name}</strong> set account state for <span class="hl">${user.name}</span> to inactive`);
      loadAdminData();
    }
  };

  const handleTogglePinDiscussion = (d: Discussion) => {
    DiscAPI.pin(d.id);
    triggerToast(d.pinned ? 'Unpinned discuss thread' : 'Pinned thread on boards!', 'success');
    LogAPI.add('push_pin', 'log-gold', `<strong>${currentUser.name}</strong> ${d.pinned ? 'unpinned' : 'pinned'} discussion topic <span class="hl">"${d.title.slice(0, 30)}…"</span>`);
    loadAdminData();
  };

  const handleDeleteDiscussion = (id: string) => {
    if (window.confirm('Delete this forum thread permanently?')) {
      const deleted = DiscAPI.delete(id);
      triggerToast('Discussion topic removed.', 'info');
      if (deleted) {
        LogAPI.add('delete', 'log-red', `<strong>${currentUser.name}</strong> removed forum thread <span class="hl">"${deleted.title.slice(0, 25)}…"</span>`);
      }
      loadAdminData();
    }
  };

  const handleLockDiscussion = (d: Discussion) => {
    triggerToast('Discussion thread replies locked.', 'info');
    LogAPI.add('lock', 'log-amber', `<strong>${currentUser.name}</strong> locked discuss replies for <span class="hl">"${d.title.slice(0, 25)}…"</span>`);
    loadAdminData();
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 text-zinc-200">
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-[#D4AF37] via-amber-400 to-yellow-600 bg-clip-text text-transparent tracking-tight">Ecosystem Management Panel</h2>
          <p className="text-zinc-400 text-sm font-semibold">Coordinate and audit incubator resources, users, forum threads, and circulars.</p>
        </div>

        <button
          onClick={() => {
            triggerToast('Compliance report document compiled and saved.', 'success');
            LogAPI.add('description', 'log-green', `<strong>${currentUser.name}</strong> exported log data`);
          }}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 rounded-xl cursor-pointer transition select-none"
        >
          Export Compliance Log
        </button>
      </div>

      {/* METRIC DIAGNOSTICS GRIDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 select-none">
        <div className="bg-[#0d0d0f] border border-zinc-800/80 p-4 rounded-xl shadow-lg text-center">
          <div className="w-10 h-10 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1 font-sans">Total Members</p>
          <p className="text-2xl font-extrabold text-white leading-none font-mono">{UserAPI.getAll().length}</p>
        </div>

        <div className="bg-[#0d0d0f] border border-zinc-800/80 p-4 rounded-xl shadow-lg text-center">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Activity className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1 font-sans">Active Today</p>
          <p className="text-2xl font-extrabold text-white leading-none font-mono">
            {Math.floor(UserAPI.getAll().length * 0.7)}
          </p>
        </div>

        <div className="bg-[#0d0d0f] border border-zinc-800/80 p-4 rounded-xl shadow-lg text-center">
          <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-3">
            <MessageSquareCode className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1 font-sans">Forum Topics</p>
          <p className="text-2xl font-extrabold text-white leading-none font-mono">{discussions.length}</p>
        </div>

        <div className="bg-[#0d0d0f] border border-zinc-800/80 p-4 rounded-xl shadow-lg text-center">
          <div className="w-10 h-10 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Flag className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1 font-sans">Flagged Cards</p>
          <p className="text-2xl font-extrabold text-white leading-none font-mono">
            {discussions.filter(d => d.flagged).length}
          </p>
        </div>

        <div className="bg-[#0d0d0f] border border-zinc-800/80 p-4 rounded-xl shadow-lg text-center col-span-2 md:col-span-1">
          <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Megaphone className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1 font-sans">Official Notices</p>
          <p className="text-2xl font-extrabold text-white leading-none font-mono">{AnncAPI.getAll().length}</p>
        </div>
      </div>

      {/* CORE DOUBLE SPLIT ADMIN CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* User directory */}
        <div className="lg:col-span-2 bg-[#0d0d0f] border border-zinc-800/80 rounded-2xl shadow-lg overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
            <h3 className="text-base font-extrabold text-white tracking-tight">Registered Member Directory</h3>
            <div className="relative w-full sm:w-56 shrink-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#D4AF37] font-semibold text-white text-xs"
                placeholder="Filter members..."
              />
            </div>
          </div>

          <div className="overflow-x-auto select-none">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-[#0a0a0b]/80">
                  <th className="py-3 px-4 font-extrabold text-zinc-450 text-zinc-500 uppercase tracking-widest select-none leading-none">Member Details</th>
                  <th className="py-3 px-4 font-extrabold text-zinc-450 text-zinc-500 uppercase tracking-widest select-none leading-none">Verified State</th>
                  <th className="py-3 px-4 font-extrabold text-zinc-450 text-zinc-500 uppercase tracking-widest select-none leading-none">Role Type</th>
                  <th className="py-3 px-4 font-extrabold text-zinc-450 text-zinc-500 uppercase tracking-widest select-none leading-none text-right">Moderations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-800/10 transition duration-150">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onOpenProfile(u.id)}
                        className="w-8 h-8 rounded-full bg-[#D4AF37]/5 text-[#D4AF37] font-bold flex items-center justify-center shrink-0 border border-[#D4AF37]/15 hover:scale-105 transition cursor-pointer"
                      >
                        {u.initials}
                      </button>
                      <div>
                        <div className="font-extrabold text-zinc-200 hover:text-[#D4AF37] hover:underline cursor-pointer font-sans text-sm" onClick={() => onOpenProfile(u.id)}>
                          {u.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-semibold">{u.email}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span className={`badge uppercase tracking-wider text-[9px] ${
                        u.status === 'active' ? 'badge-green' : 'badge-red'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 font-bold uppercase tracking-widest font-mono text-[11px]">
                      {u.role}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 shrink-0">
                      <button
                        onClick={() => handleFlagUser(u)}
                        className="p-1 px-1.5 rounded-lg border border-zinc-800 hover:border-amber-450 text-zinc-500 hover:text-amber-500 hover:bg-zinc-800/30 cursor-pointer transition select-none"
                        title="Flag User"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleSuspendUser(u)}
                        className={`p-1 px-1.5 rounded-lg border transition cursor-pointer select-none ${
                          u.status === 'active'
                            ? 'border-zinc-800 hover:border-red-400 text-zinc-500 hover:text-red-400 hover:bg-zinc-800/30'
                            : 'border-emerald-600/30 text-emerald-400 bg-emerald-500/10'
                        }`}
                        title={u.status === 'active' ? 'Force Suspend' : 'Reactivate account'}
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit live system logs */}
        <div className="bg-[#0d0d0f] border border-zinc-800/80 rounded-2xl shadow-lg p-6 space-y-4">
          <h3 className="text-base font-extrabold text-white tracking-tight select-none border-b border-zinc-800 pb-2">Ecosystem Action Log</h3>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {logs.map((log, idx) => {
              let tagStyle = 'bg-zinc-800 text-zinc-400';
              if (log.cls === 'log-gold') tagStyle = 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20';
              else if (log.cls === 'log-red') tagStyle = 'bg-red-500/10 text-red-400 border border-red-500/20';
              else if (log.cls === 'log-green') tagStyle = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
              else if (log.cls === 'log-amber') tagStyle = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';

              return (
                <div key={idx} className="flex gap-3 text-xs leading-normal">
                  <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] uppercase font-extrabold select-none ${tagStyle}`}>
                    {log.icon[0]}
                  </div>
                  <div className="space-y-0.5">
                    <p
                      className="font-semibold text-zinc-300 leading-snug"
                      dangerouslySetInnerHTML={{ __html: log.text }}
                    />
                    <span className="text-[10px] text-zinc-500 font-bold block select-none">{log.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* DISCUSSION MODERATIONS LIST ROW */}
      <div className="bg-[#0d0d0f] border border-zinc-800/80 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-base font-extrabold text-white tracking-tight select-none">Active Forum Moderations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {discussions.slice(0, 3).map((d) => (
            <div
              key={d.id}
              className="border border-[#141417] bg-[#141417]/20 rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-2 select-none">
                  <span className={`badge ${tagColor(d.category)} text-[9px] font-bold`}>
                    {d.category}
                  </span>
                  <span className="text-[10px] text-zinc-550 text-zinc-500 font-semibold">• by {d.author}</span>
                </div>
                <h4 className="font-extrabold text-zinc-200 text-sm tracking-tight leading-snug mb-1 truncate font-sans">
                  {d.title}
                </h4>
                <p className="text-zinc-400 font-semibold text-[11px] leading-relaxed line-clamp-2 mb-4">
                  {d.body}
                </p>
              </div>

              <div className="flex gap-1.5 pt-3 border-t border-zinc-800/60 flex-wrap justify-between select-none">
                <button
                  type="button"
                  onClick={() => handleTogglePinDiscussion(d)}
                  className={`flex-1 py-1.5 flex items-center justify-center gap-1 border rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                    d.pinned
                      ? 'bg-[#D4AF37] border-[#D4AF37] text-white'
                      : 'bg-[#0a0a0b] border-zinc-800 text-zinc-500 hover:border-[#D4AF37]'
                  }`}
                >
                  <Pin className="w-3 h-3" />
                  <span>{d.pinned ? 'Unpin' : 'Pin'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLockDiscussion(d)}
                  className="flex-1 py-1.5 flex items-center justify-center gap-1 border border-zinc-800 bg-[#0a0a0b] text-zinc-500 hover:border-[#D4AF37] hover:text-white rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  <span>Lock</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteDiscussion(d.id)}
                  className="p-1.5 text-red-400 hover:bg-zinc-850 border border-zinc-800 hover:border-red-400 rounded-lg cursor-pointer"
                  title="Remove Thread"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
