/**
 * E-Cell GH Raisoni — Founder Profile Details Page
 * /src/components/ProfilePage.tsx
 */

import React, { useState } from 'react';
import { Mail, MapPin, Linkedin, Github, Edit, Plus, Trash2, Globe, Sparkles, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { UserAPI } from '../utils/db';
import { User, Project } from '../types';

interface ProfilePageProps {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  targetUserId: string | null; /* If null, shows the current logged-in user */
  triggerToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const STARTUP_DOMAINS = ['AI/ML', 'FinTech', 'EdTech', 'AgriTech', 'HealthTech', 'SaaS', 'Web3', 'IoT'];
const ROLES_LIST = ['Co-Founder', 'Developer', 'Designer', 'Marketing', 'Finance', 'Business'];

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  setCurrentUser,
  targetUserId,
  triggerToast
}) => {
  const isOwnProfile = !targetUserId || targetUserId === currentUser.id;
  const userToShow = isOwnProfile ? currentUser : (UserAPI.getById(targetUserId!) || currentUser);

  /* Edit Modal states */
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [editDomains, setEditDomains] = useState<string[]>([]);
  const [editLookingFor, setEditLookingFor] = useState<string[]>([]);
  const [editIntentMode, setEditIntentMode] = useState<'founder' | 'member_intern' | 'both'>('founder');

  /* Project Modal states */
  const [showProjModal, setShowProjModal] = useState(false);
  const [projId, setProjId] = useState<string | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTagsInput, setProjTagsInput] = useState('');

  const handleOpenEdit = () => {
    setEditName(currentUser.name);
    setEditBio(currentUser.bio || '');
    setEditPhone(currentUser.phone || '');
    setEditLinkedin(currentUser.linkedin || '');
    setEditGithub(currentUser.github || '');
    setEditBranch(currentUser.branch || '');
    setEditYear(currentUser.year || '');
    setEditSkills(currentUser.skills || []);
    setEditDomains(currentUser.domains || []);
    setEditLookingFor(currentUser.lookingFor || []);
    setEditIntentMode(currentUser.intentMode || 'founder');
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      triggerToast('Name cannot be empty.', 'error');
      return;
    }

    const initials = editName
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const updated = UserAPI.update(currentUser.id, {
      name: editName.trim(),
      initials,
      bio: editBio.trim(),
      phone: editPhone.trim(),
      linkedin: editLinkedin.trim(),
      github: editGithub.trim(),
      branch: editBranch,
      year: editYear,
      skills: editSkills,
      domains: editDomains,
      lookingFor: editLookingFor,
      intentMode: editIntentMode
    });

    if (updated) {
      setCurrentUser(updated);
      triggerToast('Founder profile details saved! ✅', 'success');
      setShowEditModal(false);
    }
  };

  /* Project managers */
  const handleOpenAddProject = () => {
    setProjId(null);
    setProjTitle('');
    setProjDesc('');
    setProjTagsInput('');
    setShowProjModal(true);
  };

  const handleOpenEditProject = (p: Project) => {
    setProjId(p.id);
    setProjTitle(p.title);
    setProjDesc(p.desc);
    setProjTagsInput(p.tags ? p.tags.join(', ') : '');
    setShowProjModal(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) {
      triggerToast('Project title is required.', 'error');
      return;
    }

    const tags = projTagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const projects = [...(currentUser.projects || [])];
    if (projId) {
      const idx = projects.findIndex(p => p.id === projId);
      if (idx !== -1) {
        projects[idx] = { id: projId, title: projTitle.trim(), desc: projDesc.trim(), tags };
      }
    } else {
      projects.push({
        id: 'p' + Date.now(),
        title: projTitle.trim(),
        desc: projDesc.trim(),
        tags
      });
    }

    const updated = UserAPI.update(currentUser.id, { projects });
    if (updated) {
      setCurrentUser(updated);
      triggerToast(projId ? 'Project details updated!' : 'Project registered!', 'success');
      setShowProjModal(false);
    }
  };

  const handleDeleteProject = (projId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const projects = (currentUser.projects || []).filter(p => p.id !== projId);
      const updated = UserAPI.update(currentUser.id, { projects });
      if (updated) {
        setCurrentUser(updated);
        triggerToast('Project deleted.', 'info');
      }
    }
  };

  const handleAddEditSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (editSkills.includes(trimmed)) {
      triggerToast('Skill already added.', 'info');
      return;
    }
    if (editSkills.length >= 10) {
      triggerToast('Maximum 10 skill tags allowed.', 'info');
      return;
    }
    setEditSkills([...editSkills, trimmed]);
    setSkillInput('');
  };

  const handleRemoveEditSkill = (term: string) => {
    setEditSkills(editSkills.filter(s => s !== term));
  };

  const handleDomainToggle = (item: string) => {
    if (editDomains.includes(item)) {
      setEditDomains(editDomains.filter(d => d !== item));
    } else {
      setEditDomains([...editDomains, item]);
    }
  };

  const handleLookingToggle = (item: string) => {
    if (editLookingFor.includes(item)) {
      setEditLookingFor(editLookingFor.filter(l => l !== item));
    } else {
      setEditLookingFor([...editLookingFor, item]);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 text-zinc-200">
      {/* PROFILE HEADER HERO CARD */}
      <div className="relative bg-[#0d0d0f] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-lg overflow-hidden select-none">
        {/* Top banner block inside profile card */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-[#D4AF37]/5 to-[#c29e2f]/0.5 border-b border-zinc-900/60" />

        <div className="relative z-10 pt-16 flex flex-col md:flex-row gap-6 items-start justify-between">
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
            {/* Round avatar initials */}
            <div className="w-24 h-24 rounded-full bg-[#D4AF37] border-4 border-[#0d0d0f] text-white font-extrabold text-3xl flex items-center justify-center shadow-2xl uppercase select-none shrink-0">
              {userToShow.initials}
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-white tracking-tight leading-none pt-2 font-sans">
                {userToShow.name}
              </h2>
              <p className="text-zinc-400 font-bold text-sm">
                {userToShow.branch}{userToShow.year ? ', ' + userToShow.year : ''} • G H Raisoni College
              </p>

              {userToShow.intentMode && (
                <div className="pt-1 select-none">
                  {userToShow.intentMode === 'founder' && (
                    <span className="badge badge-gold font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full">
                      🚀 Startup Founder
                    </span>
                  )}
                  {userToShow.intentMode === 'member_intern' && (
                    <span className="badge badge-blue font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full">
                      💼 Aspiring Intern / Member
                    </span>
                  )}
                  {userToShow.intentMode === 'both' && (
                    <span className="badge badge-green font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                      🤝 Ecosystem Open-to-Both
                    </span>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2 justify-center sm:justify-start text-xs text-zinc-500 font-semibold">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141417] border border-zinc-800/50 rounded-full text-zinc-400">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> Nagpur Area
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141417] border border-zinc-800/50 rounded-full select-all text-zinc-350">
                  <Mail className="w-3.5 h-3.5" /> {userToShow.email}
                </span>
              </div>
            </div>
          </div>

          {/* Edit button */}
          {isOwnProfile && (
            <button
              onClick={handleOpenEdit}
              className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#c29e2f] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 active:scale-95 mx-auto md:mx-0 shrink-0 cursor-pointer shadow-md"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* DETAILED DOUBLE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left main area: Bio + Projects */}
        <div className="lg:col-span-3 space-y-6">
          {/* Bio block */}
          <div className="bg-[#0d0d0f] border border-zinc-800/80 rounded-2xl p-6 shadow-lg space-y-3">
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2 select-none">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <span>Founder Statement</span>
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed font-semibold">
              {userToShow.bio || 'This member has not structured their founder statement yet.'}
            </p>
          </div>

          {/* Projects registered */}
          <div className="bg-[#0d0d0f] border border-zinc-800/80 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between gap-4 select-none">
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Project Registry
              </h3>
              {isOwnProfile && (
                <button
                  onClick={handleOpenAddProject}
                  className="p-1.5 rounded-xl border border-zinc-800 text-[#D4AF37] hover:bg-yellow-500/5 hover:border-[#D4AF37]/50 cursor-pointer"
                  title="Add new project"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {(!userToShow.projects || userToShow.projects.length === 0) ? (
              <p className="text-xs text-zinc-500 font-medium select-none">No startups or engineering projects added to the showcase yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userToShow.projects.map((p) => (
                  <div
                    key={p.id}
                    className="border border-zinc-850 hover:border-zinc-750 bg-[#141417]/30 rounded-xl p-5 relative group transition duration-250"
                  >
                    {isOwnProfile && (
                      <div className="absolute right-3 top-3 flex gap-1 bg-[#0a0a0b]/90 opacity-0 group-hover:opacity-100 transition duration-150 rounded-lg shadow-md border border-zinc-800 p-1 z-10 select-none">
                        <button
                          onClick={() => handleOpenEditProject(p)}
                          className="p-1 text-zinc-400 hover:text-[#D4AF37] hover:bg-zinc-800/60 rounded-md cursor-pointer"
                          title="Edit project"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          className="p-1 text-zinc-400 hover:text-red-400 hover:bg-zinc-800/60 rounded-md cursor-pointer"
                          title="Delete project"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    )}

                    <h4 className="font-extrabold text-zinc-150 text-sm mb-2">{p.title}</h4>
                    <p className="text-zinc-400 text-xs font-semibold leading-relaxed mb-4 min-h-[36px]">
                      {p.desc}
                    </p>

                    {p.tags && p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 select-none">
                        {p.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-[#0a0a0b] border border-zinc-800 rounded-md text-[10px] text-zinc-400 font-bold px-2 py-0.5 font-mono"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side widgets: Skills, domains interest, external links */}
        <div className="space-y-6">
          {/* Domains widget */}
          <div className="bg-[#0d0d0f] border border-zinc-800/80 rounded-2xl p-6 shadow-lg space-y-3 select-none">
            <h4 className="font-extrabold text-zinc-300 text-sm">Startup Sectors</h4>
            {(!userToShow.domains || userToShow.domains.length === 0) ? (
              <p className="text-xs text-zinc-500 font-medium">None configured</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {userToShow.domains.map((dom) => (
                  <span
                    key={dom}
                    className="inline-block bg-yellow-500/[0.04] border border-[#D4AF37]/25 text-[#D4AF37] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                  >
                    {dom}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Skills widget */}
          <div className="bg-[#0d0d0f] border border-zinc-800/80 rounded-2xl p-6 shadow-lg space-y-3 select-none">
            <h4 className="font-extrabold text-zinc-300 text-sm">Developer Skills</h4>
            {(!userToShow.skills || userToShow.skills.length === 0) ? (
              <p className="text-xs text-zinc-500 font-medium">None configured</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {userToShow.skills.map((skill) => (
                  <span
                    key={skill}
                    className="chip text-[11px] font-bold bg-[#141417] text-zinc-300 border border-zinc-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Looking For widget */}
          <div className="bg-[#0d0d0f] border border-zinc-800/80 rounded-2xl p-6 shadow-lg space-y-3 select-none">
            <h4 className="font-extrabold text-zinc-300 text-sm">Seeking Partners</h4>
            {(!userToShow.lookingFor || userToShow.lookingFor.length === 0) ? (
              <p className="text-xs text-zinc-500 font-medium">Open to all opportunities</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {userToShow.lookingFor.map((rf) => (
                  <span
                    key={rf}
                    className="badge badge-gold text-[10px] font-bold"
                  >
                    {rf}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Outward social URLs */}
          <div className="bg-[#0d0d0f] border border-zinc-800/80 rounded-2xl p-6 shadow-lg space-y-3 select-none">
            <h4 className="font-extrabold text-zinc-300 text-sm">Founder Links</h4>
            <div className="space-y-2.5 text-xs font-semibold text-zinc-400">
              {userToShow.linkedin ? (
                <a
                  href={userToShow.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-[#D4AF37] transition cursor-pointer"
                >
                  <Linkedin className="w-4 h-4 text-[#D4AF37]" />
                  <span>LinkedIn Handle</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 text-zinc-650">
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn not linked</span>
                </div>
              )}

              {userToShow.github ? (
                <a
                  href={userToShow.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-[#D4AF37] transition cursor-pointer"
                >
                  <Github className="w-4 h-4 text-zinc-400 hover:text-white" />
                  <span>GitHub Repository</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 text-zinc-650">
                  <Github className="w-4 h-4" />
                  <span>GitHub not linked</span>
                </div>
              )}
            </div>
          </div>

          {/* Availability status */}
          <div className="bg-[#0d0d0f] border border-zinc-800/80 border-l-4 border-l-[#D4AF37] rounded-r-2xl rounded-l-none p-5 shadow-lg space-y-2 select-none">
            <h4 className="font-extrabold text-zinc-300 text-xs uppercase tracking-widest leading-none">Availability</h4>
            <p className="text-zinc-500 font-semibold text-[11px] leading-relaxed">
              Accepting incubator connections and co-founder partnering invites.
            </p>
            <span className="badge badge-green inline-flex items-center gap-1 text-[9px] font-bold uppercase mt-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Actively Networking
            </span>
          </div>
        </div>
      </div>

      {/* FULL EDIT MODAL (Current user only) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-[#0d0d0f] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between select-none">
              <h3 className="text-lg font-extrabold text-white tracking-tight">Edit Founder Profile</h3>
              <button
                type="button"
                className="text-zinc-500 hover:text-white cursor-pointer"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 p-2.5 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">Phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 p-2.5 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">Academic Branch</label>
                  <select
                    value={editBranch}
                    onChange={(e) => setEditBranch(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 p-2.5 rounded-xl text-xs text-zinc-400 font-bold focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                  >
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
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">Study Year</label>
                  <select
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 p-2.5 rounded-xl text-xs text-zinc-400 font-bold focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#0a0a0b] p-4 border border-zinc-850 border-zinc-800/80 rounded-xl select-none">
                <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-3">Professional Connection Intent</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditIntentMode('founder')}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
                      editIntentMode === 'founder'
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white shadow-sm'
                        : 'bg-[#0d0d0f] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="font-extrabold uppercase text-[10px]">Founder Mode</span>
                    <span className="text-[9px] text-zinc-500 font-semibold normal-case leading-tight">Startup Founder seeking members/interns</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditIntentMode('member_intern')}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
                      editIntentMode === 'member_intern'
                        ? 'bg-blue-500/10 border-blue-500 text-white shadow-sm'
                        : 'bg-[#0d0d0f] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="font-extrabold uppercase text-[10px]">Aspiring Member</span>
                    <span className="text-[9px] text-zinc-500 font-semibold normal-case leading-tight">Join as an intern or core member</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditIntentMode('both')}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
                      editIntentMode === 'both'
                        ? 'bg-emerald-500/10 border-emerald-400 text-white shadow-sm'
                        : 'bg-[#0d0d0f] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="font-extrabold uppercase text-[10px]">Dual Mode</span>
                    <span className="text-[9px] text-zinc-500 font-semibold normal-case leading-tight font-sans">Both hiring and seeking to join startups</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">Bio Founder Statement</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-[#0a0a0b] border border-zinc-805 border-zinc-800 p-2.5 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-[#D4AF37] leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">LinkedIn URL</label>
                  <input
                    type="url"
                    value={editLinkedin}
                    onChange={(e) => setEditLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/handle"
                    className="w-full bg-[#0a0a0b] border border-zinc-800 p-2.5 rounded-xl text-xs text-white font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">GitHub URL</label>
                  <input
                    type="url"
                    value={editGithub}
                    onChange={(e) => setEditGithub(e.target.value)}
                    placeholder="https://github.com/handle"
                    className="w-full bg-[#0a0a0b] border border-zinc-800 p-2.5 rounded-xl text-xs text-white font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* Skills input */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">Skills Tags</label>
                <div className="flex gap-2 select-none">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEditSkill();
                      }
                    }}
                    placeholder="Type a skill and click Add"
                    className="flex-1 bg-[#0a0a0b] border border-zinc-850 border-[#1c1c1f] p-2.5 rounded-xl text-xs text-white select-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddEditSkill}
                    className="px-4 py-2 text-xs font-bold bg-zinc-805 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {editSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 select-none">
                    {editSkills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/10 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold rounded-full"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => handleRemoveEditSkill(s)}
                          className="hover:text-red-400 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Domains checkbox toggles */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">Startup Domains</label>
                <div className="flex flex-wrap gap-2 select-none">
                  {STARTUP_DOMAINS.map((domain) => {
                    const active = editDomains.includes(domain);
                    return (
                      <button
                        key={domain}
                        type="button"
                        onClick={() => handleDomainToggle(domain)}
                        className={`px-3 py-1.5 border rounded-full text-xs font-bold transition cursor-pointer ${
                          active
                            ? 'bg-[#D4AF37] text-white border-[#D4AF37]'
                            : 'bg-[#0a0a0b] border-zinc-805 border-zinc-800 text-zinc-400 hover:border-[#D4AF37]'
                        }`}
                      >
                        {domain}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Looking for checkbox toggles */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">Looking For Collaborators</label>
                <div className="flex flex-wrap gap-2 select-none">
                  {ROLES_LIST.map((role) => {
                    const active = editLookingFor.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleLookingToggle(role)}
                        className={`px-3 py-1.5 border rounded-full text-xs font-bold transition cursor-pointer ${
                          active
                            ? 'bg-zinc-800 text-white border-zinc-700'
                            : 'bg-[#0a0a0b] border-zinc-805 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0b] p-4 border-t border-zinc-800 flex gap-3 justify-end select-none">
              <button
                type="button"
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 rounded-lg cursor-pointer"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c29e2f] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PROJECT ADD/EDIT MODAL */}
      {showProjModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSaveProject}
            className="bg-[#0d0d0f] border border-[#141417] border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
          >
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between select-none">
              <h3 className="text-base font-extrabold text-white tracking-tight">
                {projId ? 'Edit Showcase Project' : 'Register Showcase Project'}
              </h3>
              <button
                type="button"
                className="text-zinc-500 hover:text-white cursor-pointer"
                onClick={() => setShowProjModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">Project Title</label>
                <input
                  type="text"
                  required
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="e.g. AgriBot — IoT Crop Moisture Sensor"
                  className="w-full bg-[#0a0a0b] border border-zinc-800 p-2.5 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">Description Overview</label>
                <textarea
                  rows={3}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Summarize product structures, targets, accomplishments, or features..."
                  className="w-full bg-[#0a0a0b] border border-zinc-800 p-2.5 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 select-none">
                  Keywords / Tech stack (comma-separated)
                </label>
                <input
                  type="text"
                  value={projTagsInput}
                  onChange={(e) => setProjTagsInput(e.target.value)}
                  placeholder="Arduino, Python, NumPy"
                  className="w-full bg-[#0a0a0b] border border-zinc-800 p-2.5 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="bg-[#0a0a0b] p-4 border-t border-zinc-800 flex gap-3 justify-end select-none">
              <button
                type="button"
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 rounded-lg cursor-pointer"
                onClick={() => setShowProjModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c29e2f] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
              >
                Save Project
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
