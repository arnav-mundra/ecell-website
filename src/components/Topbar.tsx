/**
 * E-Cell GH Raisoni College — Topbar Navigation
 * /src/components/Topbar.tsx
 */

import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { User as UserType } from '../types';

interface TopbarProps {
  currentUser: UserType;
  activePage: string;
  setActivePage: (page: string) => void;
  onOpenSidebar: () => void;
  triggerToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentUser,
  activePage,
  setActivePage,
  onOpenSidebar,
  triggerToast
}) => {
  const getPageTitle = (page: string): string => {
    const titles: Record<string, string> = {
      feed: 'Home Feed',
      match: 'Matchmaking Engine',
      messages: 'Direct Messaging',
      discussions: 'Campus Forums',
      announcements: 'Official Announcements',
      profile: 'My Founder Profile',
      admin: 'Ecosystem Management Panel',
      createpost: 'Create Official Notice'
    };
    return titles[page] || 'E-Cell Dashboard';
  };

  const handleNotificationClick = () => {
    triggerToast('3 unread messages · 1 new E-Cell hackathon announcement', 'info');
  };

  return (
    <header className="h-[64px] bg-[#0a0a0b] border-b border-zinc-800/50 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left section: Hamburger + Page Title */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:bg-zinc-800 transition cursor-pointer"
          onClick={onOpenSidebar}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
          {getPageTitle(activePage)}
        </h1>
      </div>

      {/* Right section: Notification bell + User avatar */}
      <div className="flex items-center gap-4">
        {/* Alerts Bell */}
        <button
          type="button"
          onClick={handleNotificationClick}
          className="relative p-2 rounded-full text-zinc-400 hover:bg-zinc-800 transition cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-zinc-450" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D4AF37] ring-2 ring-[#0a0a0b]" />
        </button>

        {/* User initials bubble → links to profile page */}
        <button
          type="button"
          onClick={() => setActivePage('profile')}
          className="flex items-center gap-2 group text-left cursor-pointer"
          title="See my profile"
        >
          <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 group-hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] font-extrabold text-xs flex items-center justify-center transition-all uppercase ring-2 ring-transparent group-hover:ring-[#D4AF37]/10 shrink-0">
            {currentUser.initials}
          </div>
          <div className="hidden sm:block shrink-0 pr-1">
            <div className="text-xs font-bold text-zinc-200 leading-3 group-hover:text-white">
              {currentUser.name}
            </div>
            <div className="text-[10px] font-semibold text-zinc-500 mt-0.5 tracking-wide uppercase">
              {currentUser.role}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};
