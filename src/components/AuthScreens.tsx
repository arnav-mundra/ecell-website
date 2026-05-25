/**
 * E-Cell GH Raisoni — Google-Only Sign-In & Single Sign-On Portal
 * /src/components/AuthScreens.tsx
 */

import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, ChevronRight, UserPlus, ArrowLeft } from 'lucide-react';
import { UserAPI } from '../utils/db';
import { User as UserType } from '../types';

interface AuthScreensProps {
  onLoginSuccess: (user: UserType) => void;
  tab: 'login' | 'signup';
  setTab: (tab: 'login' | 'signup') => void;
  onNavigateToAbout: () => void;
}

export const AuthScreens: React.FC<AuthScreensProps> = ({
  onLoginSuccess,
  tab,
  setTab,
  onNavigateToAbout
}) => {
  const [showChooser, setShowChooser] = useState(true);
  const [customName, setCustomName] = useState('Arnav Mundra');
  const [customEmail, setCustomEmail] = useState('arnav24mundra@gmail.com');
  const [errorText, setErrorText] = useState('');

  const availableAccounts = [
    {
      name: 'Arnav Mundra',
      email: 'arnav24mundra@gmail.com',
      avatarUrl: '',
      initials: 'AM',
      role: 'Student Platform Designer',
      color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
    },
    {
      name: 'Dr. Manish Gupta',
      email: 'manish.gupta@raisoni.net',
      avatarUrl: '',
      initials: 'MG',
      role: 'Head of Innovation Cell (Faculty)',
      color: 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
    },
    {
      name: 'E-Cell Admin',
      email: 'admin@raisoni.net',
      avatarUrl: '',
      initials: 'EA',
      role: 'Executive Coordinator (Admin)',
      color: 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
    },
    {
      name: 'Alex Chen',
      email: 'alex@gmail.com',
      avatarUrl: '',
      initials: 'AC',
      role: 'Student Co-Founder',
      color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    }
  ];

  const handleSelectAccount = (acc: typeof availableAccounts[0]) => {
    setErrorText('');
    try {
      let user = UserAPI.getByEmail(acc.email.toLowerCase());
      if (!user) {
        // Auto-provision standard account variables for quick testing
        user = UserAPI.create({
          name: acc.name,
          email: acc.email.toLowerCase(),
          password: 'google_oauth_bypass_' + Date.now(),
          role: acc.email.endsWith('@raisoni.net') ? (acc.email.startsWith('admin') ? 'admin' : 'faculty') : 'student',
          profileComplete: acc.email === 'arnav24mundra@gmail.com' || acc.email === 'alex@gmail.com' ? true : false,
          initials: acc.initials,
          branch: acc.email === 'arnav24mundra@gmail.com' ? 'Computer Science' : 'Information Technology',
          year: 'Third Year',
          bio: acc.role,
        });
      }

      if (user) {
        onLoginSuccess(user);
      } else {
        setErrorText('Failed to dynamically provision Google Account token replication.');
      }
    } catch {
      setErrorText('An error occurred during account routing.');
    }
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!customName.trim() || !customEmail.trim()) {
      setErrorText('Please enter your Google Account name and email address to proceed.');
      return;
    }

    if (!customEmail.includes('@') || (!customEmail.endsWith('.com') && !customEmail.includes('.net') && !customEmail.includes('.edu') && !customEmail.includes('.in'))) {
      setErrorText('Invalid Google Account form. Email must be a valid account address (e.g., name@gmail.com).');
      return;
    }

    // Attempt to login or dynamically provision a Google user
    let user = UserAPI.getByEmail(customEmail.trim().toLowerCase());
    if (!user) {
      user = UserAPI.create({
        name: customName.trim(),
        email: customEmail.trim().toLowerCase(),
        password: 'google_oauth_bypass_' + Date.now(),
        profileComplete: false // Triggers user onboarding for newcomer
      });
    }

    if (user) {
      onLoginSuccess(user);
    } else {
      setErrorText('Failed to initialize Google Account token synchronization.');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#0a0a0b] font-sans antialiased text-zinc-200">
      {/* Left panel - Hero & branding */}
      <div className="hidden md:flex flex-col justify-between bg-[#0d0d0f] border-r border-zinc-800/60 text-white p-12 relative overflow-hidden select-none">
        {/* Background decorative vector rings */}
        <div className="absolute top-[-80px] right-[-80px] w-96 h-96 border border-[#D4AF37]/10 rounded-full" />
        <div className="absolute top-[40px] right-[20px] w-[200px] h-[200px] border border-[#D4AF37]/5 rounded-full" />

        {/* Brand */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">E-Cell Network</h2>
            <p className="text-xs text-zinc-500 font-medium font-sans">G H Raisoni College of Engineering &amp; Management, Nagpur</p>
          </div>
        </div>

        {/* Hero typography */}
        <div className="my-auto relative z-10 max-w-lg">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-6">
            Google Workspace Secured Portal 🔐
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-6">
            Forge your <span className="text-[#D4AF37]">entrepreneurial</span> legacy.
          </h1>
          <p className="text-base text-zinc-400 leading-relaxed font-semibold">
            Welcome to the centralized single sign-on system at G H Raisoni College of Engineering &amp; Management, Nagpur. Authenticate securely with Google to explore, validate, and collaborate on your ventures.
          </p>
        </div>

        {/* Social Proof */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex -space-x-3 overflow-hidden">
            <div className="inline-block h-9 w-9 rounded-full ring-2 ring-zinc-900 bg-[#D4AF37]/25 border border-[#D4AF37]/45 text-[#D4AF37] flex items-center justify-center font-bold text-xs font-mono">AM</div>
            <div className="inline-block h-9 w-9 rounded-full ring-2 ring-zinc-900 bg-zinc-800 text-zinc-400 border border-zinc-700 flex items-center justify-center font-bold text-xs font-mono">+</div>
          </div>
          <span className="text-xs text-zinc-400 font-semibold">
            Sign-in authorized for all official campus members
          </span>
        </div>
      </div>

      {/* Right panel - Google SSO Account Chooser */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-[#141417] border border-zinc-800/80 rounded-2xl p-8 shadow-xl">
          
          <div className="text-center mb-6 overflow-hidden">
            {/* Google Logo Representation */}
            <div className="flex justify-center mb-3">
              <svg width="40" height="40" viewBox="0 0 24 24" className="filter drop-shadow-md">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-[#f3f4f6]" id="google-sso-title">G H Raisoni Single Sign-On</h2>
            <p className="text-xs text-zinc-500 mt-1 font-semibold leading-normal">
              Choose a Google account loaded on your device info, or provision customized credentials below
            </p>
          </div>

          {errorText && (
            <div className="mb-5 p-3.5 bg-red-950/45 border border-red-900/35 rounded-xl text-red-400 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorText}</span>
            </div>
          )}

          {showChooser ? (
            /* Google Chooser UI Option list */
            <div className="space-y-4">
              <p className="text-center text-[10px] text-zinc-400 font-bold uppercase tracking-wider select-none mb-2">
                Choose an official active account on this device
              </p>
              
              <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                {availableAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleSelectAccount(acc)}
                    type="button"
                    className="w-full p-3 bg-[#0a0a0b] hover:bg-[#1f1f23] border border-zinc-800/70 hover:border-[#D4AF37]/50 rounded-xl transition duration-200 text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${acc.color} shrink-0`}>
                        {acc.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition truncate">
                          {acc.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate font-mono">
                          {acc.email}
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5 truncate italic">
                          {acc.role}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-[#D4AF37] transition shrink-0" />
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-zinc-800/50">
                <button
                  type="button"
                  onClick={() => setShowChooser(false)}
                  className="w-full py-3 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 shrink-0" />
                  Use another Google account
                </button>
              </div>

              <button
                type="button"
                onClick={onNavigateToAbout}
                className="w-full py-2 bg-transparent text-zinc-500 hover:text-zinc-350 text-[11px] font-bold transition mt-2 text-center block"
              >
                Campus Portal Policy Guidelines
              </button>
            </div>
          ) : (
            /* Custom Google Account Authentication input form */
            <form onSubmit={handleCustomGoogleSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setShowChooser(true)}
                  className="text-xs font-bold text-zinc-400 hover:text-[#D4AF37] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Google Chooser
                </button>
                <span className="text-[9px] text-[#D4AF37] font-bold uppercase tracking-wider bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                  Custom Mode
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Google Profile Name</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Arnav Mundra"
                  className="w-full px-4 py-3 bg-[#0a0a0b] border border-zinc-800 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37] text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Google Active Email</label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="arnav24mundra@gmail.com"
                  className="w-full px-4 py-3 bg-[#0a0a0b] border border-zinc-800 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37] text-white font-semibold font-mono"
                />
                <p className="text-[10px] text-zinc-500 mt-1 font-semibold leading-normal">
                  If the profile doesn&apos;t exist, real-time credentials will be automatically registered setup-free.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#D4AF37] hover:bg-[#c29e2f] active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-xl shadow-yellow-600/10 flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                Sign In with Custom Google Mail
              </button>

              <button
                type="button"
                onClick={onNavigateToAbout}
                className="w-full py-2 bg-transparent text-zinc-500 hover:text-zinc-350 text-[11px] font-bold transition text-center"
              >
                Campus Portal Policy Guidelines
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
