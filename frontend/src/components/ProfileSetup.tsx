/**
 * E-Cell GH Raisoni — Onboarding Profile Setup
 * /src/components/ProfileSetup.tsx
 */

import React, { useState } from 'react';
import { Rocket, Sparkles, Hash, Plus, X } from 'lucide-react';
import { UserAPI } from '../utils/db';
import { User } from '../types';

interface ProfileSetupProps {
  currentUser: User;
  onSetupComplete: (user: User) => void;
}

const STARTUP_DOMAINS = ['AI/ML', 'FinTech', 'EdTech', 'AgriTech', 'HealthTech', 'SaaS', 'Web3', 'IoT'];
const ROLES_LIST = ['Co-Founder', 'Startup Member', 'Project Intern', 'Developer', 'Designer', 'Marketing', 'Finance', 'Business'];

export const ProfileSetup: React.FC<ProfileSetupProps> = ({
  currentUser,
  onSetupComplete
}) => {
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [intentMode, setIntentMode] = useState<'founder' | 'member_intern' | 'both'>('founder');

  /* Skills states */
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  /* Domains / LookingFor checkboxes */
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedLookingFor, setSelectedLookingFor] = useState<string[]>([]);

  const [errorMsg, setErrorMsg] = useState('');

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      setErrorMsg('Skill tag already added.');
      return;
    }
    if (skills.length >= 10) {
      setErrorMsg('You can add up to 10 skills.');
      return;
    }
    setSkills([...skills, trimmed]);
    setSkillInput('');
    setErrorMsg('');
  };

  const handleRemoveSkill = (term: string) => {
    setSkills(skills.filter(s => s !== term));
  };

  const handleDomainToggle = (item: string) => {
    if (selectedDomains.includes(item)) {
      setSelectedDomains(selectedDomains.filter(d => d !== item));
    } else {
      setSelectedDomains([...selectedDomains, item]);
    }
  };

  const handleLookingToggle = (item: string) => {
    if (selectedLookingFor.includes(item)) {
      setSelectedLookingFor(selectedLookingFor.filter(l => l !== item));
    } else {
      setSelectedLookingFor([...selectedLookingFor, item]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!bio.trim()) {
      setErrorMsg('Please write a short bio to introduce yourself.');
      return;
    }

    if (selectedDomains.length === 0) {
      setErrorMsg('Please select at least one startup interest domain.');
      return;
    }

    const updates = {
      branch,
      year,
      phone,
      bio: bio.trim(),
      linkedin,
      github,
      skills,
      domains: selectedDomains,
      lookingFor: selectedLookingFor,
      profileComplete: true,
      intentMode
    };

    const updatedUser = UserAPI.update(currentUser.id, updates);
    if (updatedUser) {
      onSetupComplete(updatedUser);
    }
  };

  const handleSkip = () => {
    /* Set basic profile complete true but leave other fields default */
    const updatedUser = UserAPI.update(currentUser.id, {
      profileComplete: true,
      bio: 'Ready to build! Excited to match and collaborate.'
    });
    if (updatedUser) {
      onSetupComplete(updatedUser);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-zinc-200">
      <div className="max-w-2xl w-full bg-[#0d0d0f] border border-zinc-800/80 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8 select-none border-b border-zinc-800/40 pb-5">
          <div className="mx-auto w-16 h-16 bg-[#D4AF37]/10 flex items-center justify-center rounded-2xl mb-4">
            <Rocket className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Complete Your Profile</h2>
          <p className="text-sm text-zinc-450 font-semibold mt-1">
            Introduce yourself to the E-Cell startup network community
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4 select-none">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Academic Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-[#0a0a0b] border border-zinc-800 p-3 rounded-xl text-sm text-zinc-450 font-bold focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="">Select branch</option>
                <option value="CSE">CSE</option>
                <option value="AI">AI</option>
                <option value="DS">DS</option>
                <option value="ME">ME</option>
                <option value="ETC">ETC</option>
                <option value="EE">EE</option>
                <option value="CE">CE</option>
                <option value="IT">IT</option>
                <option value="CSE (Cyber Security)">CSE (Cyber Security)</option>
                <option value="BBA">BBA</option>
                <option value="BCA">BCA</option>
                <option value="BCCA">BCCA</option>
                <option value="MCA">MCA</option>
                <option value="Polytechnic">Polytechnic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Year of Study</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-[#0a0a0b] border border-zinc-800 p-3 rounded-xl text-sm text-zinc-450 font-bold focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="">Select year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          {/* Ecosystem Intent mode selection */}
          <div className="bg-[#0a0a0b] p-4 border border-zinc-800/80 rounded-xl select-none">
            <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-3">Your E-Cell Network Role Intent</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setIntentMode('founder')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer ${
                  intentMode === 'founder'
                    ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white shadow-md'
                    : 'bg-[#0d0d0f] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="text-base">🚀</span>
                <span className="font-extrabold uppercase">Startup Founder</span>
                <span className="text-[9px] text-zinc-500 font-semibold normal-case leading-tight">Recruiting co-founders & interns</span>
              </button>
              <button
                type="button"
                onClick={() => setIntentMode('member_intern')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer ${
                  intentMode === 'member_intern'
                    ? 'bg-blue-500/10 border-blue-500 text-white shadow-md'
                    : 'bg-[#0d0d0f] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="text-base">💼</span>
                <span className="font-extrabold uppercase">Aspiring Intern</span>
                <span className="text-[9px] text-zinc-500 font-semibold normal-case leading-tight font-sans">Looking to join as intern or member</span>
              </button>
              <button
                type="button"
                onClick={() => setIntentMode('both')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer ${
                  intentMode === 'both'
                    ? 'bg-emerald-500/10 border-emerald-400 text-white shadow-md'
                    : 'bg-[#0d0d0f] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="text-base">🤝</span>
                <span className="font-extrabold uppercase">Open to Both</span>
                <span className="text-[9px] text-zinc-500 font-semibold normal-case leading-tight font-sans">Both recruiting & joining projects</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">
              Your Professional Bio <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#0a0a0b] border border-zinc-850 border-zinc-800 p-3 rounded-xl text-sm text-white font-semibold focus:outline-none focus:border-[#D4AF37] leading-relaxed"
              placeholder="e.g., Hi! I'm passionate about building soil intelligence sensors in AgriTech. Looking for a co-founder to lead sales."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">Phone (Optional)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#0a0a0b] border border-zinc-805 border-zinc-800 p-3 rounded-xl text-sm text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">LinkedIn (Optional)</label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full bg-[#0a0a0b] border border-zinc-805 border-zinc-800 p-3 rounded-xl text-sm text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">GitHub (Optional)</label>
            <input
              type="url"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              className="w-full bg-[#0a0a0b] border border-zinc-805 border-zinc-800 p-3 rounded-xl text-sm text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
              placeholder="https://github.com/yourhandle"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">Your Focus Skills</label>
            <div className="flex gap-2 select-none">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 bg-[#0a0a0b] border border-zinc-800 p-3 rounded-xl text-sm text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                placeholder="Type a skill (e.g. React, UX Writing) & press Add"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-150 text-sm font-bold rounded-xl transition cursor-pointer"
              >
                Add
              </button>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 select-none">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold rounded-full"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-red-400 cursor-pointer text-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">
              Startup Domains Interest <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 select-none">
              {STARTUP_DOMAINS.map((domain) => {
                const selected = selectedDomains.includes(domain);
                return (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => handleDomainToggle(domain)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                      selected
                        ? 'bg-[#D4AF37] text-white border-[#D4AF37]'
                        : 'bg-[#0a0a0b] border-zinc-800 text-zinc-405 text-zinc-400 hover:border-[#D4AF37]'
                    }`}
                  >
                    {domain}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">Looking For Collaborators</label>
            <div className="flex flex-wrap gap-2 select-none">
              {ROLES_LIST.map((role) => {
                const selected = selectedLookingFor.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleLookingToggle(role)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                      selected
                        ? 'bg-zinc-800 text-white border-zinc-700'
                        : 'bg-[#0a0a0b] border-zinc-800 text-zinc-405 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 justify-between pt-4 border-t border-zinc-800/85 select-none">
            <button
              type="button"
              onClick={handleSkip}
              className="px-6 py-3 border border-zinc-800 text-zinc-450 hover:bg-zinc-805 text-zinc-400 text-sm font-bold rounded-xl hover:bg-zinc-800 transition cursor-pointer"
            >
              Skip Setup
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#D4AF37] text-white text-sm font-bold rounded-xl shadow-lg hover:bg-[#c29e2f] transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
