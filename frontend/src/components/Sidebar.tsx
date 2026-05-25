/**
 * E-Cell GH Raisoni College — Responsive Sidebar Navigation
 * /src/components/Sidebar.tsx
 */

import React from 'react';
import { Home, Users, MessageSquareCode, MessageSquare, Megaphone, Shield, PlusCircle, LogOut, X, Sparkles } from 'lucide-react';
import { User, UserRole } from '../types';
import { ECellLogo } from './ECellLogo';

interface SidebarProps {
  currentUser: User;
  activePage: string;
  setActivePage: (page: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onOpenCreatePostModal: () => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activePage,
  setActivePage,
  onLogout,
  isOpen,
  setIsOpen,
  onOpenCreatePostModal,
  theme,
  setTheme
}) => {
  const isAdmin = ['admin', 'faculty', 'president'].includes(currentUser.role);

  const navItems = [
    { id: 'feed', name: 'Home Feed', icon: Home },
    { id: 'match', name: 'Matchmaking', icon: Users },
    { id: 'messages', name: 'Messages', icon: MessageSquare },
    { id: 'discussions', name: 'Discussions', icon: MessageSquareCode },
    { id: 'announcements', name: 'Announcements', icon: Megaphone }
  ];

  const handleNavClick = (id: string) => {
    setActivePage(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Sidebar background overlay for tablet/mobiles */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-68 bg-[#0d0d0f] border-r border-zinc-800/50 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Branding */}
        <div className="p-5 border-b border-zinc-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4AF37]/10 border border-[#D4AF37]/35 rounded-xl flex items-center justify-center font-bold text-white shadow-md select-none shrink-0">
              <ECellLogo size={28} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-extrabold text-[#e4e4e7] tracking-tight leading-4">E-Cell Portal</h2>
              <p className="text-[9px] text-zinc-500 font-bold uppercase mt-1 leading-tight font-sans">G H Raisoni College of Engineering &amp; Management, Nagpur</p>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            type="button"
            className="lg:hidden p-1 rounded-full text-zinc-400 hover:bg-zinc-800"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const ActiveIcon = item.icon;
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-zinc-800/50 text-[#D4AF37] font-bold border-l-4 border-[#D4AF37] border-t-0 border-b-0 border-r-0 rounded-l-none'
                    : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-100'
                }`}
              >
                <ActiveIcon className={`w-5 h-5 ${active ? 'text-[#D4AF37]' : 'text-zinc-500'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}

          <div className="pt-4 border-t border-zinc-800/50 my-4" />

          {/* Admin Dashboard */}
          {isAdmin && (
            <button
              onClick={() => handleNavClick('admin')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activePage === 'admin'
                  ? 'bg-zinc-800/50 text-white font-bold border-l-4 border-[#D4AF37] rounded-l-none'
                  : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-100'
              }`}
            >
              <Shield className={`w-5 h-5 ${activePage === 'admin' ? 'text-[#D4AF37]' : 'text-zinc-500'}`} />
              <span>Admin Dashboard</span>
            </button>
          )}

          {/* Create Announcement / Feed Notice */}
          <button
            onClick={() => handleNavClick('createpost')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activePage === 'createpost'
                ? 'bg-zinc-800/50 text-white font-bold border-l-4 border-[#D4AF37] rounded-l-none'
                : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-100'
            }`}
          >
            <PlusCircle className={`w-5 h-5 ${activePage === 'createpost' ? 'text-[#D4AF37]' : 'text-zinc-500'}`} />
            <span>Post Announcement</span>
          </button>

          {/* Light/Dark Mode Switcher */}
          <div className="mt-4 mb-2 select-none">
            <div className="mx-2 p-3.5 bg-zinc-800/15 border border-zinc-800/40 rounded-xl flex items-center justify-between transition-all duration-300">
              <div className="flex items-center gap-2">
                <span className="text-sm">{theme === 'light' ? '☀️' : '🌙'}</span>
                <span className="text-[11px] font-bold text-zinc-400 capitalize">{theme} Mode</span>
              </div>
              <button
                type="button"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="w-11 h-5.5 bg-[#D4AF37]/10 border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 rounded-full relative flex items-center p-0.5 transition cursor-pointer"
              >
                <div
                  className={`w-4 h-4 bg-[#D4AF37] rounded-full shadow transition-all duration-300 ${
                    theme === 'light' ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>



          {/* Log Out */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            <span>Sign Out</span>
          </button>
        </nav>

        {/* Sidebar Compose Call-to-action */}
        <div className="p-4 border-t border-zinc-800/50 bg-[#0d0d0f]">
          <button
            onClick={onOpenCreatePostModal}
            className="w-full py-3 bg-[#D4AF37] hover:bg-[#c29e2f] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-yellow-600/20 active:scale-95 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Feed Post</span>
          </button>
        </div>
      </aside>
    </>
  );
};
