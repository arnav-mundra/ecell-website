/**
 * E-Cell GH Raisoni — Announcements feed notices
 * /src/components/AnnouncementsPage.tsx
 */

import React, { useState, useEffect } from 'react';
import { Megaphone, Pin, Calendar, ArrowRight } from 'lucide-react';
import { AnncAPI, formatDate, tagColor } from '../utils/db';
import { Announcement } from '../types';

interface AnnouncementsPageProps {
  triggerToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({
  triggerToast
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    setAnnouncements(AnncAPI.getAll());
  }, []);

  return (
    <div className="max-w-[850px] mx-auto space-y-6 text-zinc-200">
      <div className="flex items-center gap-3 select-none">
        <div className="w-10 h-10 bg-[#D4AF37]/10 flex items-center justify-center rounded-xl border border-[#D4AF37]/25">
          <Megaphone className="w-5 h-5 text-[#D4AF37]" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">E-Cell Announcements</h2>
          <p className="text-xs text-zinc-400 font-semibold tracking-wider uppercase mt-0.5">Official notices of G H Raisoni College of Engineering &amp; Management, Nagpur</p>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-[#0d0d0f] rounded-2xl border border-zinc-805 border-zinc-800/80 p-16 text-center text-zinc-500 shadow-xl">
          <Megaphone className="w-12 h-12 text-zinc-650 mx-auto mb-4" />
          <p className="font-semibold text-zinc-400">No official announcements have been dispatched yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map((annc, i) => {
            const isHeroNotice = i === 0 || annc.pinned;
            return (
              <article
                key={annc.id}
                className={`bg-[#0d0d0f] border hover:border-zinc-700/65 rounded-2xl p-6 relative overflow-hidden transition duration-200 shadow-lg ${
                  annc.pinned ? 'border-[#D4AF37]/50 bg-amber-550/[0.015]' : 'border-zinc-800/80'
                }`}
              >
                {/* Gold Pinned left indicator block */}
                {annc.pinned && (
                  <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#D4AF37]" />
                )}

                {/* Tags row */}
                <div className="flex items-center gap-2 mb-3.5 flex-wrap select-none">
                  {annc.pinned && (
                    <span className="pinned-tag inline-flex items-center gap-1 bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#D4AF37] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      <Pin className="w-3 h-3 text-[#D4AF37]" /> Pinned
                    </span>
                  )}
                  <span className={`badge ${tagColor(annc.category)} text-[9px] font-extrabold`}>
                    {annc.category}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-semibold inline-flex items-center gap-1 ml-auto">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(annc.ts)}</span>
                  </span>
                </div>

                {/* Announcement Headline */}
                <h3 className={`font-extrabold text-zinc-100 tracking-tight leading-snug mb-3 hover:text-[#D4AF37] cursor-pointer transition ${
                  isHeroNotice ? 'text-lg sm:text-xl' : 'text-base font-sans'
                }`}>
                  {annc.title}
                </h3>

                {/* Announcement description */}
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-semibold mb-5 whitespace-pre-wrap">
                  {annc.body}
                </p>

                <div className="flex justify-between items-center bg-[#0a0a0b] border border-zinc-850 text-zinc-400 rounded-xl p-3 text-xs font-bold select-none">
                  <span>Author: {annc.author}</span>
                  <button
                    onClick={() => triggerToast('Detailed view is disabled for this announcement catalog.', 'info')}
                    className="text-[#D4AF37] hover:underline flex items-center gap-1 hover:text-[#c29e2f] cursor-pointer"
                  >
                    <span>Read circular documents</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
