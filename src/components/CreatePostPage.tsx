/**
 * E-Cell GH Raisoni — Create Post Page (Official announcements/Notices)
 * /src/components/CreatePostPage.tsx
 */

import React, { useState } from 'react';
import { Megaphone, Calendar, Send, Pin, Sparkles, PlusCircle } from 'lucide-react';
import { AnncAPI, LogAPI, formatDate } from '../utils/db';
import { User } from '../types';

interface CreatePostPageProps {
  currentUser: User;
  setActivePage: (page: string) => void;
  triggerToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const CreatePostPage: React.FC<CreatePostPageProps> = ({
  currentUser,
  setActivePage,
  triggerToast
}) => {
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [noticeType, setNoticeType] = useState('Announcement');
  const [isPinned, setIsPinned] = useState(false);

  const handlePublish = () => {
    if (!headline.trim() || !body.trim()) {
      triggerToast('Please fill in both announcement headline and body contents.', 'error');
      return;
    }

    AnncAPI.create(currentUser.id, currentUser.name, {
      title: headline.trim(),
      body: body.trim(),
      category: noticeType,
      pinned: isPinned
    });

    /* Log onto audit logs */
    LogAPI.add('campaign', 'log-green', `<strong>${currentUser.name}</strong> published circular notice <span class="hl">"${headline.slice(0, 25)}…"</span>`);

    triggerToast('Announcement published to campus network boards! 📢', 'success');

    /* Reset form draft */
    setHeadline('');
    setBody('');
    setNoticeType('Announcement');
    setIsPinned(false);

    /* Redirect to Announcements page */
    setActivePage('announcements');
  };

  const handleSaveDraft = () => {
    triggerToast('Announcement draft saved locally.', 'info');
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 text-zinc-200">
      <div className="bg-[#0d0d0f] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-lg select-none">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Create Official Announcement</h2>
        <p className="text-zinc-450 text-zinc-400 font-semibold text-xs sm:text-sm mt-1">Publish alerts, meeting agendas, opportunities, and event dates to the general student registry.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Form controls */}
        <div className="bg-[#0d0d0f] border border-zinc-805 border-zinc-800/80 rounded-2xl p-6 shadow-lg space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5 select-none">Notice Category Type</label>
              <div className="flex flex-wrap gap-2 select-none">
                {['Announcement', 'Event Notice', 'Opportunity', 'Meeting'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNoticeType(type)}
                    className={`px-4 py-2 border rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      noticeType === type
                        ? 'bg-[#D4AF37] text-white border-[#D4AF37]'
                        : 'bg-[#0a0a0b] border-zinc-800 text-zinc-400 hover:border-[#D4AF37]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">Notice Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Annual Pitch-A-Thon 2026: Problem Statements Released"
                className="w-full bg-[#0a0a0b] border border-zinc-800 p-3 rounded-xl text-xs sm:text-sm text-white font-bold focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">Circular Description Body</label>
              <textarea
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type circular details, locations, times, registration links..."
                className="w-full bg-[#0a0a0b] border border-zinc-805 border-zinc-800 p-3 rounded-xl text-xs sm:text-sm text-zinc-100 font-semibold focus:outline-none focus:border-[#D4AF37] leading-relaxed"
              />
            </div>

            {/* Toggle pin */}
            <div className="flex items-center justify-between p-3 bg-[#0a0a0b] border border-zinc-800 rounded-xl select-none">
              <div className="text-xs">
                <span className="font-extrabold text-zinc-200 block">Pin as Important Notice</span>
                <span className="text-zinc-500 leading-normal font-semibold">Pinned notices remain highlighted at structural feeds.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-zinc-700 after:border after:rounded-full after:height-4 after:w-4 after:transition-all peer-checked:bg-[#D4AF37]"></div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2 select-none">
            <button
              onClick={handleSaveDraft}
              className="flex-1 py-3 border border-zinc-800 text-zinc-400 hover:bg-zinc-800/50 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Save Draft
            </button>
            <button
              onClick={handlePublish}
              className="flex-1 py-3 bg-[#D4AF37] hover:bg-[#c29e2f] text-white text-xs font-bold rounded-xl shadow-lg shadow-yellow-600/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Publish Now</span>
            </button>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="space-y-4 lg:sticky lg:top-20 select-none">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Visual Feed Sandbox</h3>

          <div className="bg-[#0d0d0f] border border-zinc-800 rounded-2xl shadow-xl overflow-hidden p-6 relative">
            {isPinned && (
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#D4AF37]" />
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#D4AF37] rounded-xl flex items-center justify-center font-bold text-xs">
                EC
              </div>
              <div>
                <h4 className="font-extrabold text-white text-xs">{currentUser.name}</h4>
                <p className="text-[10px] text-zinc-500 font-semibold">Campus Coordinator • Just now</p>
              </div>

              {isPinned && (
                <span className="p-1 text-[#D4AF37] bg-yellow-500/5 rounded-md border border-[#D4AF37]/25 ml-auto" title="Pinned notice">
                  <Pin className="w-3.5 h-3.5 fill-current" />
                </span>
              )}
            </div>

            <span className="badge badge-zinc text-[9px] font-bold bg-[#141417] text-zinc-350 border border-zinc-800 px-2 py-0.5 rounded-md uppercase mb-3 inline-block">
              {noticeType}
            </span>

            <h3 className="font-extrabold text-zinc-150 hover:text-[#D4AF37] text-sm sm:text-base leading-snug tracking-tight mb-2 font-sans">
              {headline.trim() || 'Headline placeholder...'}
            </h3>

            <p className="text-zinc-450 text-zinc-400 font-semibold text-xs leading-relaxed whitespace-pre-wrap italic opacity-75">
              {body.trim() || 'Notice body placeholder... details will update live as you write on the left.'}
            </p>

            <div className="flex justify-between items-center bg-[#0a0a0b] border border-zinc-800/60 rounded-xl p-3 text-[10px] text-zinc-500 font-bold mt-5">
              <span>Date: {formatDate(Date.now())}</span>
              <span className="text-[#D4AF37]">Click to read circular docs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
