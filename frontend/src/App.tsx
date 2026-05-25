/**
 * E-Cell GH Raisoni College — Setup Portal Router Shell
 * /src/App.tsx
 */

import { useState, useEffect } from 'react';
import { Sparkles, Trophy, Lightbulb, GraduationCap, Mail, Phone, ChevronRight } from 'lucide-react';
import { syncDatabase, Session, UserAPI, tagColor } from './utils/db';
import { User, ToastState } from './types';

/* Modular Sub-components */
import { ECellLogo } from './components/ECellLogo';
import { AuthScreens } from './components/AuthScreens';
import { ProfileSetup } from './components/ProfileSetup';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { FeedPage } from './components/FeedPage';
import { MatchPage } from './components/MatchPage';
import { MessagesPage } from './components/MessagesPage';
import { DiscussionsPage } from './components/DiscussionsPage';
import { AnnouncementsPage } from './components/AnnouncementsPage';
import { ProfilePage } from './components/ProfilePage';
import { AdminPage } from './components/AdminPage';
import { CreatePostPage } from './components/CreatePostPage';

export default function App() {
  const [dbLoading, setDbLoading] = useState(true);

  /* Guaranteed initialization */
  useEffect(() => {
    async function init() {
      await syncDatabase();
      restoreSessionUser();
      setDbLoading(false);
    }
    init();
  }, []);

  /* Auth states */
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [route, setRoute] = useState<'landing' | 'about' | 'login' | 'signup' | 'onboarding' | 'app'>('landing');

  /* Global Theme state (Light / Dark) */
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('raisoni-theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(theme === 'light' ? 'theme-light' : 'theme-dark');
    localStorage.setItem('raisoni-theme', theme);
  }, [theme]);

  /* Application navigational states */
  const [activePage, setActivePage] = useState<string>('feed');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Deep profile viewing targeting state */
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  /* Direct messaging targeting state */
  const [activeChatUser, setActiveChatUser] = useState<User | null>(null);

  /* Global Toast Alert state */
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    visible: false
  });

  /* Shared state indicating feed compose popup trigger */
  const [triggerFeedComposePreset, setTriggerFeedComposePreset] = useState<string>('');

  const triggerToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message: msg, type, visible: true });
  };

  /* Auto-dismiss alert */
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const restoreSessionUser = () => {
    const sessionUser = Session.restore();
    if (sessionUser) {
      setCurrentUser(sessionUser);
      if (!sessionUser.profileComplete) {
        setRoute('onboarding');
      } else {
        setRoute('app');
      }
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    Session.save(user.email);
    triggerToast(`Logged in as ${user.name}! Welcome back.`, 'success');

    if (!user.profileComplete) {
      setRoute('onboarding');
    } else {
      setRoute('app');
      setActivePage('feed');
    }
  };

  const handleLogout = () => {
    Session.clear();
    setCurrentUser(null);
    setRoute('landing');
    triggerToast('Logged out successfully.', 'info');
  };

  const handleOnboardingComplete = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setRoute('app');
    setActivePage('feed');
    triggerToast('Onboarding setup complete! Welcome to the E-Cell hub. 🎉', 'success');
  };

  const handleOpenProfile = (id: string) => {
    setTargetUserId(id);
    setActivePage('profile');
    window.scrollTo(0, 0);
  };

  const handleOpenDirectChat = (partnerId: string) => {
    const u = UserAPI.getById(partnerId);
    if (u) {
      setActiveChatUser(u);
      setActivePage('messages');
    }
  };

  /* Helper to open Compose Modal in Feed page */
  const handleOpenFeedPostModal = () => {
    setTriggerFeedComposePreset('general');
    setActivePage('feed');
    /* Trigger directly onto feed page helper ref if we wish, or let feed page auto pop it */
    triggerToast('Write your startup updates!', 'info');
  };

  if (dbLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-zinc-200 flex flex-col items-center justify-center font-sans antialiased p-6">
        <div className="space-y-6 text-center max-w-sm">
          {/* Glowing Golden Logo Container */}
          <div className="relative w-20 h-20 mx-auto bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl flex items-center justify-center shadow-xl shadow-yellow-600/5 animate-pulse">
            <span className="absolute w-full h-full rounded-2xl border border-[#D4AF37]/40 animate-ping opacity-25" />
            <ECellLogo variant="icon" size={40} className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold tracking-widest text-white uppercase">E-Cell GH Raisoni</h3>
            <p className="text-[11px] font-semibold text-[#D4AF37] font-mono tracking-wider animate-pulse">
              Hydrating campus network via Supabase...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-200 font-sans">
      {/* GLOBAL ALERTS TOAST */}
      {toast.visible && (
        <div className={`fixed bottom-6 right-6 z-[9999] py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom duration-300 border ${
          toast.type === 'success'
            ? 'bg-[#141417]/95 border-emerald-500/30 text-emerald-400'
            : toast.type === 'error'
              ? 'bg-[#141417]/95 border-red-500/30 text-red-400'
              : 'bg-[#141417]/95 border-zinc-850 text-white'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* RENDER CONTROLLER */}
      {route === 'landing' && (
        <div className="flex flex-col min-h-screen overflow-y-auto">
          {/* Landing navigation */}
          <nav className="h-16 bg-[#0d0d0f] border-b border-zinc-800/50 flex items-center justify-between px-6 sm:px-12 sticky top-0 z-50 leading-normal">
            <div className="flex items-center gap-3">
              <ECellLogo variant="full" size={130} className="h-10 w-auto opacity-95 hover:opacity-100 transition-opacity" />
              <div className="h-4 w-px bg-zinc-800 hidden sm:block mx-1" />
              <span className="text-xs font-bold text-zinc-400 tracking-tight whitespace-nowrap hidden sm:inline-block">
                Nagpur Platform
              </span>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => { setRoute('login'); }}
                className="px-4 py-2 border border-zinc-800 hover:bg-[#141417] text-zinc-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => { setRoute('signup'); }}
                className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c29e2f] text-white text-xs font-bold rounded-xl shadow-md shadow-yellow-600/10 active:scale-95 transition cursor-pointer"
              >
                Register
              </button>
            </div>
          </nav>

          {/* Hero Banner Section */}
          <section className="bg-[#0a0a0b] border-b border-zinc-800/50 text-center py-20 px-6 sm:px-12 leading-relaxed">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-center mb-8 select-none">
                <div className="px-6 py-4 bg-[#D4AF37]/5 border border-[#D4AF37]/25 rounded-2xl shadow-xl shadow-yellow-600/5 hover:border-[#D4AF37]/40 transition duration-300">
                  <ECellLogo variant="full" size={180} className="h-16 w-auto" />
                </div>
              </div>
              
              <span className="inline-block text-[#D4AF37] text-[10px] font-bold tracking-widest uppercase bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 rounded-full">
                G H Raisoni College of Engineering &amp; Management, Nagpur
              </span>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1] max-w-3xl mx-auto">
                Connect. Build. <span className="text-[#D4AF37]">Innovate.</span>
              </h1>
              
              <p className="text-zinc-400 font-medium text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                The premier collegiate entrepreneurship platform. Connect with other builders, find co-founders, and transform ideas into real ventures.
              </p>

              <div className="flex flex-wrap gap-3 justify-center pt-4">
                <button
                  onClick={() => setRoute('signup')}
                  className="px-6 py-3.5 bg-[#D4AF37] hover:bg-[#c29e2f] text-white text-xs font-bold rounded-xl shadow-xl shadow-yellow-600/15 flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
                >
                  <span>Build my Startup Profile</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRoute('about')}
                  className="px-6 py-3.5 border border-zinc-800 hover:bg-zinc-900/60 text-zinc-350 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Learn More
                </button>
              </div>
            </div>
          </section>

          {/* Ecosystem Statistics panel */}
          <section className="bg-[#0d0d0f] border-b border-zinc-800/50 py-10 px-6">
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-extrabold text-[#D4AF37] tracking-tight">300+</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Acclamations Members</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#D4AF37] tracking-tight">40+</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Startups Incubated</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#D4AF37] tracking-tight">12+</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Incubator Events/Yr</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#D4AF37] tracking-tight">₹5L+</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Seed Fund Prizes</p>
              </div>
            </div>
          </section>

          {/* Faculty Coordinators and Leadership section */}
          <section className="bg-[#0a0a0b] py-20 px-6 sm:px-12 border-b border-zinc-800/50">
            <div className="max-w-4xl mx-auto text-center space-y-12">
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Academic Leadership &amp; Administration
                </h2>
                <p className="text-zinc-500 font-medium text-xs sm:text-sm">
                  Our official faculty partners steering incubation and innovation cells
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="border border-zinc-800/50 bg-[#141417] hover:border-[#D4AF37] rounded-2xl p-6 text-center space-y-3 transition duration-300">
                  <div className="w-16 h-16 rounded-full bg-[#D4AF37]/5 text-[#D4AF37] border border-[#D4AF37]/25 mx-auto flex items-center justify-center font-bold text-lg select-none">
                    MG
                  </div>
                  <div>
                    <h4 className="font-extrabold text-zinc-200 text-sm leading-tight">Dr. Manish Gupta</h4>
                    <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider mt-1">Head of Innovation Cell</p>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                    Steering academic research commercialization and ecosystem incubator budgets.
                  </p>
                  <a
                    href="mailto:manish.gupta@raisoni.net"
                    className="inline-flex items-center gap-2 text-xs font-bold text-zinc-550 hover:text-[#D4AF37]"
                  >
                    <Mail className="w-3.5 h-3.5" /> manish.gupta@raisoni.net
                  </a>
                </div>

                <div className="border border-zinc-800/50 bg-[#141417] hover:border-[#D4AF37] rounded-2xl p-6 text-center space-y-3 transition duration-300">
                  <div className="w-16 h-16 rounded-full bg-[#D4AF37]/5 text-[#D4AF37] border border-[#D4AF37]/25 mx-auto flex items-center justify-center font-bold text-lg select-none">
                    MH
                  </div>
                  <div>
                    <h4 className="font-extrabold text-zinc-200 text-sm leading-tight">Prof. Manish Kumar Hate</h4>
                    <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider mt-1">E-Cell Faculty In-charge</p>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                    Managing daily student team events, incubator calendars, and investor pitch sessions.
                  </p>
                  <a
                    href="mailto:manish.hate@raisoni.net"
                    className="inline-flex items-center gap-2 text-xs font-bold text-zinc-550 hover:text-[#D4AF37]"
                  >
                    <Mail className="w-3.5 h-3.5" /> manish.hate@raisoni.net
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Institutional Footer */}
          <footer className="bg-[#09090b] border-t border-zinc-900 text-zinc-500 py-6 px-12 mt-auto">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
              <span className="text-zinc-600">© 2026 E-Cell, G H Raisoni College of Engineering &amp; Management, Nagpur.</span>
              <span className="text-zinc-600 select-all"> नागपुर • Academic Innovation Prestige</span>
            </div>
          </footer>
        </div>
      )}

      {route === 'about' && (
        <div className="flex flex-col min-h-screen overflow-y-auto w-full">
          {/* Header */}
          <nav className="h-16 bg-[#0d0d0f] border-b border-zinc-800/50 flex items-center justify-between px-6 sm:px-12 sticky top-0 z-50">
            <button
              onClick={() => setRoute('landing')}
              className="px-4 py-2 border border-zinc-800 text-zinc-355 text-xs font-bold rounded-xl hover:bg-zinc-900 text-zinc-300 transition shrink-0 cursor-pointer"
            >
              ← Back to Overview
            </button>
            <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest select-none hidden sm:inline">
              Institutional Pillars
            </span>
            <button
              onClick={() => setRoute('login')}
              className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c29e2f] text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Enter platform
            </button>
          </nav>

          {/* Immersive Dark Banner */}
          <section className="bg-zinc-950 text-white py-20 px-8 text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
              <Lightbulb className="w-96 h-96 text-white" />
            </div>
            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] bg-yellow-500/10 border border-yellow-500/25 px-4 py-1 rounded-full inline-block">
                Academic Prestige &amp; Vision
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Empowering Campus Innovators</h1>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-semibold">
                Fostering a highly structured, scalable entrepreneurship roadmap at G H Raisoni College via elite mentorship, incubator facilities, and seed funding circulars.
              </p>
            </div>
          </section>

          {/* Mission & Vision double grid columns */}
          <section className="py-20 px-6 sm:px-12 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
            <div className="border border-l-4 border-l-[#D4AF37] border-zinc-800 rounded-xl rounded-l-none p-8 bg-[#141417] space-y-3 shadow-sm hover:shadow transition-shadow">
              <h3 className="font-extrabold text-zinc-150 text-base flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#D4AF37]" /> Our Mission
              </h3>
              <p className="text-zinc-400 leading-relaxed font-semibold text-xs sm:text-sm">
                To create a sustainable collegiate infrastructure where students confidently transition from purely theoretical education to scalable venture building. We ignite ideas across branches (CSE, IT, MBA, Mechanical, and beyond) inside our G H Raisoni College of Engineering &amp; Management, Nagpur campus.
              </p>
            </div>

            <div className="border border-l-4 border-l-[#D4AF37] border-zinc-800 rounded-xl rounded-l-none p-8 bg-[#141417] space-y-3 shadow-sm hover:shadow transition-shadow">
              <h3 className="font-extrabold text-zinc-150 text-base flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#D4AF37]" /> Our Vision
              </h3>
              <p className="text-zinc-400 leading-relaxed font-semibold text-xs sm:text-sm">
                To stand recognized nationally as the gold-standard center for student venture incubation—nurturing landmark student-led tech products, building robust developer collaborations, and raising alumni investor frameworks.
              </p>
            </div>
          </section>

          {/* Traditional Pillars */}
          <section className="bg-[#0d0d0f] border-t border-b border-zinc-800/50 py-20 px-6 w-full">
            <div className="max-w-5xl mx-auto text-center space-y-12">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">The Pillars of our Ecosystem</h2>
                <div className="w-12 h-1 bg-[#D4AF37] mx-auto rounded-full" />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Mentorship', desc: 'Direct mapping to G H Raisoni incubator faculty and master alumni investors.' },
                  { title: 'Resources', desc: 'State-of-the-art tech workspace, software credits, and testing kits.' },
                  { title: 'Collaboration', desc: 'Build structural teams via direct matcher queries across branches.' },
                  { title: 'Seed Funding', desc: 'Gain access to institutional grants and annual pitch rewards.' }
                ].map((p, idx) => (
                  <div key={idx} className="bg-[#141417] border border-zinc-850 p-6 rounded-2xl text-center space-y-3 transition duration-200">
                    <div className="w-12 h-12 bg-yellow-500/5 border border-yellow-500/20 text-[#D4AF37] rounded-full mx-auto flex items-center justify-center font-bold text-xs select-none">
                      P{idx + 1}
                    </div>
                    <h4 className="font-extrabold text-zinc-100 text-xs sm:text-sm">{p.title}</h4>
                    <p className="text-[11px] sm:text-xs text-zinc-450 font-semibold leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Quick Life cycle roadmap */}
          <section className="py-20 px-6 sm:px-12 max-w-xl mx-auto space-y-12 text-center select-none">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">The Venture Lifecycle</h2>
              <p className="text-zinc-500 font-medium text-xs">A programmatic structure of how we incubate students</p>
            </div>

            <div className="space-y-4">
              <div className="p-5 border border-zinc-800 rounded-xl bg-[#141417] flex gap-4 items-start text-left">
                <div className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-800 text-white flex items-center justify-center shrink-0 font-extrabold text-xs">1</div>
                <div>
                  <h4 className="font-extrabold text-zinc-200 text-xs sm:text-sm">Discovery &amp; Match</h4>
                  <p className="text-xs text-zinc-450 leading-relaxed font-semibold mt-1">Participate in E-Cell ideation workshops, register skills, and hook up with developer partners.</p>
                </div>
              </div>

              <div className="p-5 border border-zinc-800 rounded-xl bg-[#141417] flex gap-4 items-start text-left">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-white flex items-center justify-center shrink-0 font-extrabold text-xs">2</div>
                <div>
                  <h4 className="font-extrabold text-zinc-200 text-xs sm:text-sm">Validation &amp; MVP</h4>
                  <p className="text-xs text-zinc-450 leading-relaxed font-semibold mt-1">Build prototype structures and test core hypotheses within verified incubator facilities.</p>
                </div>
              </div>

              <div className="p-5 border border-zinc-800 rounded-xl bg-[#141417] flex gap-4 items-start text-left">
                <div className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-800 text-white flex items-center justify-center shrink-0 font-extrabold text-xs">3</div>
                <div>
                  <h4 className="font-extrabold text-zinc-200 text-xs sm:text-sm">Formal Incubation</h4>
                  <p className="text-xs text-zinc-450 leading-relaxed font-semibold mt-1">Accelerate, draft company registry, present inside Pitch-A-Thon, and connect on venture seed funding.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="p-6 bg-zinc-950 border-t border-zinc-900 text-zinc-650 text-xs text-center mt-auto font-semibold">
            © 2026 E-Cell, G H Raisoni College of Engineering &amp; Management, Nagpur. All rights reserved.
          </footer>
        </div>
      )}

      {(route === 'login' || route === 'signup') && (
        <AuthScreens
          onLoginSuccess={handleLoginSuccess}
          tab={route}
          setTab={setRoute}
          onNavigateToAbout={() => setRoute('about')}
        />
      )}

      {route === 'onboarding' && currentUser && (
        <ProfileSetup
          currentUser={currentUser}
          onSetupComplete={handleOnboardingComplete}
        />
      )}

      {route === 'app' && currentUser && (
        <div className="min-h-screen flex flex-col lg:flex-row relative bg-[#0a0a0b]">
          {/* Responsive Sidebar Hamburger slide-out */}
          <Sidebar
            currentUser={currentUser}
            activePage={activePage}
            setActivePage={(page) => {
              /* Reset viewers state when transitioning page */
              if (page !== 'profile') setTargetUserId(null);
              setActivePage(page);
            }}
            onLogout={handleLogout}
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
            onOpenCreatePostModal={handleOpenFeedPostModal}
            theme={theme}
            setTheme={setTheme}
          />

          {/* Main Workspace Frame container */}
          <div className="flex-1 flex flex-col min-h-screen lg:ml-68 pb-16 lg:pb-0 bg-[#0a0a0b]">
            {/* Topbar header element */}
            <Topbar
              currentUser={currentUser}
              activePage={activePage}
              setActivePage={(page) => {
                if (page !== 'profile') setTargetUserId(null);
                setActivePage(page);
              }}
              onOpenSidebar={() => setSidebarOpen(true)}
              triggerToast={triggerToast}
            />

            {/* Render sub page frame content */}
            <main className="flex-grow p-4 sm:p-6 lg:p-8 bg-[#0a0a0b]">
              {activePage === 'feed' && (
                <FeedPage
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  triggerToast={triggerToast}
                  activePostModalPreset={triggerFeedComposePreset}
                  onOpenProfile={handleOpenProfile}
                />
              )}

              {activePage === 'match' && (
                <MatchPage
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  triggerToast={triggerToast}
                  onOpenProfile={handleOpenProfile}
                />
              )}

              {activePage === 'messages' && (
                <MessagesPage
                  currentUser={currentUser}
                  triggerToast={triggerToast}
                  activeChatUser={activeChatUser}
                  setActiveChatUser={setActiveChatUser}
                  onOpenProfile={handleOpenProfile}
                />
              )}

              {activePage === 'discussions' && (
                <DiscussionsPage
                  currentUser={currentUser}
                  triggerToast={triggerToast}
                  onOpenProfile={handleOpenProfile}
                />
              )}

              {activePage === 'announcements' && (
                <AnnouncementsPage
                  triggerToast={triggerToast}
                />
              )}

              {activePage === 'profile' && (
                <ProfilePage
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  targetUserId={targetUserId}
                  triggerToast={triggerToast}
                />
              )}

              {activePage === 'admin' && (
                <AdminPage
                  currentUser={currentUser}
                  triggerToast={triggerToast}
                  onOpenProfile={handleOpenProfile}
                />
              )}

              {activePage === 'createpost' && (
                <CreatePostPage
                  currentUser={currentUser}
                  setActivePage={setActivePage}
                  triggerToast={triggerToast}
                />
              )}
            </main>
          </div>

          {/* RESPONSIVE BOTTOM NAVIGATION RAIL FOR TABLETS/MOBILES */}
          <nav className="fixed bottom-0 inset-x-0 h-16 bg-[#0d0d0f] border-t border-zinc-800/80 shadow-lg flex justify-around items-center z-50 lg:hidden px-2 leading-none select-none">
            {[
              { id: 'feed', name: 'Feed' },
              { id: 'match', name: 'Match' },
              { id: 'messages', name: 'Chat' },
              { id: 'discussions', name: 'Forum' },
              { id: 'profile', name: 'Me' }
            ].map((rail) => {
              const active = activePage === rail.id;
              return (
                <button
                  key={rail.id}
                  onClick={() => {
                    if (rail.id === 'profile') {
                      setTargetUserId(null); /* defaults to own user */
                    }
                    setActivePage(rail.id);
                  }}
                  className={`flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 transition cursor-pointer ${
                    active ? 'text-[#D4AF37]' : 'text-zinc-550'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-widest leading-none">
                    {rail.name}
                  </span>
                  {active && (
                    <span className="w-1 h-[3px] bg-[#D4AF37] rounded-full mt-0.5" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
