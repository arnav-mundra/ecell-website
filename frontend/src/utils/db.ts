/**
 * E-Cell GH Raisoni College — Database & Persistence Layer (Supabase Connected)
 * /src/utils/db.ts
 */

import { User, Post, Discussion, Announcement, Message, ActivityLog, Comment, GroupChat } from '../types';
import { supabase } from './supabase';

/* ── In-Memory Caches for Synchronous Read Access ── */
let usersCache: User[] = [];
let postsCache: Post[] = [];
let discussionsCache: Discussion[] = [];
let announcementsCache: Announcement[] = [];
let messagesCache: Record<string, Message[]> = {};
let groupsCache: GroupChat[] = [];
let logsCache: ActivityLog[] = [];

/* ── Hydrate Cache from Supabase ── */
export async function syncDatabase(): Promise<void> {
  try {
    const [
      { data: dbUsers, error: usersErr },
      { data: dbPosts, error: postsErr },
      { data: dbComments, error: commentsErr },
      { data: dbDiscussions, error: discussionsErr },
      { data: dbAnnouncements, error: announcementsErr },
      { data: dbGroups, error: groupsErr },
      { data: dbMessages, error: messagesErr },
      { data: dbLogs, error: logsErr }
    ] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('posts').select('*').order('ts', { ascending: false }),
      supabase.from('comments').select('*').order('ts', { ascending: true }),
      supabase.from('discussions').select('*').order('pinned', { ascending: false }).order('ts', { ascending: false }),
      supabase.from('announcements').select('*').order('pinned', { ascending: false }).order('ts', { ascending: false }),
      supabase.from('group_chats').select('*'),
      supabase.from('messages').select('*').order('ts', { ascending: true }),
      supabase.from('activity_logs').select('*').order('ts', { ascending: false }).limit(20)
    ]);

    if (usersErr) console.error('Failed to sync users:', usersErr);
    if (postsErr) console.error('Failed to sync posts:', postsErr);
    if (commentsErr) console.error('Failed to sync comments:', commentsErr);
    if (discussionsErr) console.error('Failed to sync discussions:', discussionsErr);
    if (announcementsErr) console.error('Failed to sync announcements:', announcementsErr);
    if (groupsErr) console.error('Failed to sync groups:', groupsErr);
    if (messagesErr) console.error('Failed to sync messages:', messagesErr);
    if (logsErr) console.error('Failed to sync logs:', logsErr);

    usersCache = dbUsers || [];

    // Map Comments to their respective Posts
    const commentsMap: Record<string, Comment[]> = {};
    (dbComments || []).forEach((c: any) => {
      if (!commentsMap[c.postId]) {
        commentsMap[c.postId] = [];
      }
      commentsMap[c.postId].push({
        id: c.id,
        authorId: c.authorId,
        authorName: c.authorName,
        authorInitials: c.authorInitials,
        text: c.text,
        ts: Number(c.ts)
      });
    });

    postsCache = (dbPosts || []).map((p: any) => ({
      id: p.id,
      authorId: p.authorId,
      author: p.author,
      initials: p.initials,
      body: p.body,
      tags: p.tags || [],
      image: p.image,
      likes: p.likes || [],
      comments: p.comments || 0,
      commentsList: commentsMap[p.id] || [],
      ts: Number(p.ts)
    }));

    discussionsCache = (dbDiscussions || []).map((d: any) => ({
      id: d.id,
      authorId: d.authorId,
      author: d.author,
      title: d.title,
      body: d.body,
      category: d.category,
      votes: d.votes || 0,
      replies: d.replies || 0,
      pinned: d.pinned || false,
      ts: Number(d.ts),
      flagged: d.flagged || false
    }));

    announcementsCache = (dbAnnouncements || []).map((a: any) => ({
      id: a.id,
      authorId: a.authorId,
      author: a.author,
      title: a.title,
      body: a.body,
      category: a.category,
      pinned: a.pinned || false,
      ts: Number(a.ts)
    }));

    groupsCache = (dbGroups || []).map((g: any) => ({
      id: g.id,
      name: g.name,
      members: g.members || [],
      created: Number(g.created),
      creatorId: g.creatorId
    }));

    // Messages grouped by chat_id
    const msgsGrouped: Record<string, Message[]> = {};
    (dbMessages || []).forEach((m: any) => {
      if (!msgsGrouped[m.chat_id]) {
        msgsGrouped[m.chat_id] = [];
      }
      msgsGrouped[m.chat_id].push({
        from: m.from_id,
        text: m.text,
        ts: Number(m.ts)
      });
    });
    messagesCache = msgsGrouped;

    logsCache = (dbLogs || []).map((l: any) => ({
      icon: l.icon,
      cls: l.cls,
      text: l.text,
      time: l.time,
      ts: Number(l.ts)
    }));

    // Seed Database if empty
    if (usersCache.length === 0) {
      console.log('Database empty. Seeding initial structures...');
      await seedDatabase();
    }
  } catch (error) {
    console.error('Critical database sync failure:', error);
  }
}

/* ── Seed Database with live records ── */
export async function seedDatabase(): Promise<void> {
  const seedUsers = [
    {
      id: 'u_arnav',
      email: 'arnav24mundra@gmail.com',
      password: 'password123',
      name: 'Arnav Mundra',
      initials: 'AM',
      role: 'student',
      branch: 'Computer Science',
      year: 'Third Year',
      phone: '9876543210',
      bio: 'Student Platform Designer & Full Stack Builder. Passionate about AI integrations.',
      domains: ['Startup Ideas', 'Technical Help'],
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      lookingFor: ['Finding Team Members'],
      linkedin: 'https://linkedin.com/in/arnav',
      github: 'https://github.com/arnav',
      openToCollab: true,
      profileComplete: true,
      joined: new Date().toISOString().slice(0, 10),
      status: 'active',
      connections: ['u_alex'],
      projects: [
        { id: 'p1', title: 'E-Cell Portal v3', desc: 'Centralized single sign-on hub for G H Raisoni campus builders.', tags: ['React', 'Supabase'] }
      ],
      intentMode: 'founder'
    },
    {
      id: 'u_alex',
      email: 'alex@gmail.com',
      password: 'password123',
      name: 'Alex Chen',
      initials: 'AC',
      role: 'student',
      branch: 'Information Technology',
      year: 'Third Year',
      phone: '8765432109',
      bio: 'UI/UX enthusiast and front-end developer looking for co-founders.',
      domains: ['Finding Team Members'],
      skills: ['Figma', 'CSS', 'Tailwind', 'React'],
      lookingFor: ['Technical Help'],
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      openToCollab: true,
      profileComplete: true,
      joined: new Date().toISOString().slice(0, 10),
      status: 'active',
      connections: ['u_arnav'],
      projects: [],
      intentMode: 'member_intern'
    },
    {
      id: 'u_gupta',
      email: 'manish.gupta@raisoni.net',
      name: 'Dr. Manish Gupta',
      initials: 'MG',
      role: 'faculty',
      branch: 'Management & Research',
      year: '',
      phone: '',
      bio: 'Head of Innovation Cell. Steering academic research commercialization.',
      domains: ['Funding & Investment'],
      skills: ['Incubation', 'Strategy', 'Venture Capital'],
      lookingFor: ['Startup Ideas'],
      linkedin: '',
      github: '',
      openToCollab: false,
      profileComplete: true,
      joined: new Date().toISOString().slice(0, 10),
      status: 'active',
      connections: [],
      projects: [],
      intentMode: 'both'
    },
    {
      id: 'u_admin',
      email: 'admin@raisoni.net',
      name: 'E-Cell Admin',
      initials: 'EA',
      role: 'admin',
      branch: 'Administration',
      year: '',
      phone: '',
      bio: 'Executive Coordinator for E-Cell Raisoni operations.',
      domains: [],
      skills: ['Management', 'Auditing'],
      lookingFor: [],
      linkedin: '',
      github: '',
      openToCollab: false,
      profileComplete: true,
      joined: new Date().toISOString().slice(0, 10),
      status: 'active',
      connections: [],
      projects: [],
      intentMode: 'both'
    }
  ];

  const seedPosts = [
    {
      id: 'post_1',
      authorId: 'u_arnav',
      author: 'Arnav Mundra',
      initials: 'AM',
      body: 'Excited to launch our collegiate startup network today! Looking for feedback on the new Supabase integration.',
      tags: ['Update', 'Startup Ideas'],
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
      likes: ['u_alex'],
      comments: 1,
      ts: Date.now() - 1000 * 60 * 30
    }
  ];

  const seedComments = [
    {
      id: 'cmt_1',
      postId: 'post_1',
      authorId: 'u_alex',
      authorName: 'Alex Chen',
      authorInitials: 'AC',
      text: 'Looks incredible, Arnav! Love the smooth dark mode interface.',
      ts: Date.now() - 1000 * 60 * 15
    }
  ];

  const seedDiscussions = [
    {
      id: 'd_1',
      authorId: 'u_alex',
      author: 'Alex Chen',
      title: 'Ideas for E-Cell Hackathon 2026',
      body: 'What kind of tracks should we offer? Sustainable development goals, Web3/AI, or core hardware building?',
      category: 'Hackathons',
      votes: 3,
      replies: 0,
      pinned: true,
      ts: Date.now() - 1000 * 60 * 60 * 2,
      flagged: false
    }
  ];

  const seedAnnouncements = [
    {
      id: 'a_1',
      authorId: 'u_gupta',
      author: 'Dr. Manish Gupta',
      title: 'Venture Pitch-A-Thon 2026 Registrations',
      body: 'Pitch-A-Thon registrations open this Monday. Winning student startups stand a chance to win ₹5L+ in incubation grants.',
      category: 'Announcement',
      pinned: true,
      ts: Date.now() - 1000 * 60 * 60 * 5
    }
  ];

  const seedGroups = [
    {
      id: 'group_raisoni',
      name: 'Raisoni Builders Core',
      members: ['u_arnav', 'u_alex'],
      created: Date.now() - 1000 * 60 * 60 * 24,
      creatorId: 'u_arnav'
    }
  ];

  const seedMessages = [
    {
      chat_id: 'group_raisoni',
      from_id: 'u_arnav',
      text: 'Welcome to the core group chat! Let\'s build something awesome.',
      ts: Date.now() - 1000 * 60 * 60 * 20
    },
    {
      chat_id: 'group_raisoni',
      from_id: 'u_alex',
      text: 'Glad to be here! Can\'t wait.',
      ts: Date.now() - 1000 * 60 * 60 * 19
    },
    {
      chat_id: 'u_alex_u_arnav',
      from_id: 'u_arnav',
      text: 'Hey Alex, are you open to joining my team for the E-Cell portal development?',
      ts: Date.now() - 1000 * 60 * 60 * 10
    },
    {
      chat_id: 'u_alex_u_arnav',
      from_id: 'u_alex',
      text: 'Hey Arnav! Yes, absolutely. I would love to help with the UI/UX.',
      ts: Date.now() - 1000 * 60 * 60 * 9
    }
  ];

  const seedLogs = [
    {
      icon: 'star',
      cls: 'log-gold',
      text: '<strong>System seeded</strong>: Initializing Supabase database tables with pre-baked developer accounts.',
      time: 'Just now',
      ts: Date.now()
    }
  ];

  try {
    // 1. Users
    await supabase.from('users').insert(seedUsers);
    // 2. Posts
    await supabase.from('posts').insert(seedPosts);
    // 3. Comments
    await supabase.from('comments').insert(seedComments);
    // 4. Discussions
    await supabase.from('discussions').insert(seedDiscussions);
    // 5. Announcements
    await supabase.from('announcements').insert(seedAnnouncements);
    // 6. Groups
    await supabase.from('group_chats').insert(seedGroups);
    // 7. Messages
    await supabase.from('messages').insert(seedMessages);
    // 8. Logs
    await supabase.from('activity_logs').insert(seedLogs);

    // Refresh cache immediately
    const [
      { data: dbUsers },
      { data: dbPosts },
      { data: dbComments },
      { data: dbDiscussions },
      { data: dbAnnouncements },
      { data: dbGroups },
      { data: dbMessages },
      { data: dbLogs }
    ] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('posts').select('*').order('ts', { ascending: false }),
      supabase.from('comments').select('*').order('ts', { ascending: true }),
      supabase.from('discussions').select('*').order('pinned', { ascending: false }).order('ts', { ascending: false }),
      supabase.from('announcements').select('*').order('pinned', { ascending: false }).order('ts', { ascending: false }),
      supabase.from('group_chats').select('*'),
      supabase.from('messages').select('*').order('ts', { ascending: true }),
      supabase.from('activity_logs').select('*').order('ts', { ascending: false }).limit(20)
    ]);

    usersCache = dbUsers || [];
    const commentsMap: Record<string, Comment[]> = {};
    (dbComments || []).forEach((c: any) => {
      if (!commentsMap[c.postId]) commentsMap[c.postId] = [];
      commentsMap[c.postId].push({
        id: c.id,
        authorId: c.authorId,
        authorName: c.authorName,
        authorInitials: c.authorInitials,
        text: c.text,
        ts: Number(c.ts)
      });
    });

    postsCache = (dbPosts || []).map((p: any) => ({
      id: p.id,
      authorId: p.authorId,
      author: p.author,
      initials: p.initials,
      body: p.body,
      tags: p.tags || [],
      image: p.image,
      likes: p.likes || [],
      comments: p.comments || 0,
      commentsList: commentsMap[p.id] || [],
      ts: Number(p.ts)
    }));

    discussionsCache = (dbDiscussions || []).map((d: any) => ({
      id: d.id,
      authorId: d.authorId,
      author: d.author,
      title: d.title,
      body: d.body,
      category: d.category,
      votes: d.votes || 0,
      replies: d.replies || 0,
      pinned: d.pinned || false,
      ts: Number(d.ts),
      flagged: d.flagged || false
    }));

    announcementsCache = (dbAnnouncements || []).map((a: any) => ({
      id: a.id,
      authorId: a.authorId,
      author: a.author,
      title: a.title,
      body: a.body,
      category: a.category,
      pinned: a.pinned || false,
      ts: Number(a.ts)
    }));

    groupsCache = (dbGroups || []).map((g: any) => ({
      id: g.id,
      name: g.name,
      members: g.members || [],
      created: Number(g.created),
      creatorId: g.creatorId
    }));

    const msgsGrouped: Record<string, Message[]> = {};
    (dbMessages || []).forEach((m: any) => {
      if (!msgsGrouped[m.chat_id]) msgsGrouped[m.chat_id] = [];
      msgsGrouped[m.chat_id].push({
        from: m.from_id,
        text: m.text,
        ts: Number(m.ts)
      });
    });
    messagesCache = msgsGrouped;

    logsCache = (dbLogs || []).map((l: any) => ({
      icon: l.icon,
      cls: l.cls,
      text: l.text,
      time: l.time,
      ts: Number(l.ts)
    }));

  } catch (error) {
    console.error('Failed to seed tables:', error);
  }
}

/* ══════════════════════════════════════════
   UserAPI Database Service (Cache Direct Reads / Supabase BG Writes)
   ══════════════════════════════════════════ */
export const UserAPI = {
  getAll(): User[] {
    return usersCache;
  },
  getById(id: string): User | null {
    return this.getAll().find(u => u.id === id) || null;
  },
  getByEmail(email: string): User | null {
    return this.getAll().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  login(email: string, password: string): User | null {
    const user = this.getByEmail(email);
    // Simple authentication bypass for Google Chooser logins
    if (!user) return null;
    if (user.password && user.password !== password) return null;
    return user;
  },
  create(data: Partial<User>): User | null {
    if (data.email && this.getByEmail(data.email)) return null;

    const initials = (data.name || 'NM')
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const newUser: User = {
      id: data.id || 'u_' + Date.now(),
      email: data.email || '',
      password: data.password || 'password123',
      name: data.name || '',
      initials,
      role: data.role || 'student',
      branch: data.branch || '',
      year: data.year || '',
      phone: data.phone || '',
      bio: data.bio || '',
      domains: data.domains || [],
      skills: data.skills || [],
      lookingFor: data.lookingFor || [],
      linkedin: data.linkedin || '',
      github: data.github || '',
      openToCollab: data.openToCollab !== undefined ? data.openToCollab : true,
      profileComplete: data.profileComplete || false,
      joined: data.joined || new Date().toISOString().slice(0, 10),
      status: data.status || 'active',
      connections: data.connections || [],
      projects: data.projects || [],
      intentMode: data.intentMode || 'founder'
    };

    // Update Local Cache
    usersCache.push(newUser);

    // Supabase Background PUSH
    supabase.from('users').insert([newUser]).then(({ error }) => {
      if (error) console.error('Failed to sync created user to Supabase:', error);
    });

    return newUser;
  },
  update(id: string, updates: Partial<User>): User | null {
    const idx = usersCache.findIndex(u => u.id === id);
    if (idx === -1) return null;

    // Update Local Cache
    const updated = { ...usersCache[idx], ...updates };
    usersCache[idx] = updated;

    // Supabase Background PUSH
    // Convert undefined properties to null to satisfy postgrest parser
    const updateObj: Record<string, any> = {};
    Object.keys(updates).forEach(key => {
      const val = (updates as any)[key];
      updateObj[key] = val === undefined ? null : val;
    });

    supabase.from('users').update(updateObj).eq('id', id).then(({ error }) => {
      if (error) console.error(`Failed to sync updated user ${id} to Supabase:`, error);
    });

    return updated;
  },
  connect(myId: string, theirId: string): boolean {
    const me = usersCache.find(u => u.id === myId);
    const them = usersCache.find(u => u.id === theirId);

    if (!me || !them || me.connections.includes(theirId)) return false;

    me.connections.push(theirId);
    if (!them.connections.includes(myId)) {
      them.connections.push(myId);
    }

    // Supabase Background Update
    supabase.from('users').update({ connections: me.connections }).eq('id', myId).then(({ error }) => {
      if (error) console.error(`Failed to sync connections updates for me (${myId}):`, error);
    });
    supabase.from('users').update({ connections: them.connections }).eq('id', theirId).then(({ error }) => {
      if (error) console.error(`Failed to sync connections updates for partner (${theirId}):`, error);
    });

    // Create empty message thread inside cache
    const key = [myId, theirId].sort().join('_');
    if (!messagesCache[key]) {
      messagesCache[key] = [];
    }

    return true;
  },
  getMatchCandidates(currentUserId: string, filters: { search?: string; domain?: string; role?: string } = {}): User[] {
    let candidates = this.getAll().filter(u => u.id !== currentUserId && u.openToCollab && u.profileComplete);

    const q = (filters.search || '').toLowerCase();
    if (q) {
      candidates = candidates.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.bio.toLowerCase().includes(q) ||
        u.skills.some(s => s.toLowerCase().includes(q)) ||
        u.domains.some(d => d.toLowerCase().includes(q))
      );
    }

    if (filters.domain) {
      candidates = candidates.filter(u => u.domains.includes(filters.domain!));
    }

    if (filters.role) {
      candidates = candidates.filter(u => u.lookingFor.includes(filters.role!));
    }

    return candidates;
  }
};

/* ══════════════════════════════════════════
   PostAPI Database Service
   ══════════════════════════════════════════ */
export const PostAPI = {
  getAll(): Post[] {
    return postsCache;
  },
  getById(id: string): Post | null {
    return this.getAll().find(p => p.id === id) || null;
  },
  create(authorId: string, data: { body: string; tags: string[]; image?: string | null }): Post | null {
    const author = UserAPI.getById(authorId);
    if (!author) return null;

    const newPost: Post = {
      id: 'post_' + Date.now(),
      authorId,
      author: author.name,
      initials: author.initials,
      body: data.body,
      tags: data.tags || [],
      image: data.image || null,
      likes: [],
      comments: 0,
      commentsList: [],
      ts: Date.now()
    };

    // Update Cache
    postsCache.unshift(newPost);

    // Supabase Background insert
    const insertObj = {
      id: newPost.id,
      authorId: newPost.authorId,
      author: newPost.author,
      initials: newPost.initials,
      body: newPost.body,
      tags: newPost.tags,
      image: newPost.image,
      likes: newPost.likes,
      comments: newPost.comments,
      ts: newPost.ts
    };

    supabase.from('posts').insert([insertObj]).then(({ error }) => {
      if (error) console.error('Failed to sync new post to Supabase:', error);
    });

    return newPost;
  },
  update(id: string, updates: Partial<Post>): Post | null {
    const idx = postsCache.findIndex(p => p.id === id);
    if (idx === -1) return null;

    postsCache[idx] = { ...postsCache[idx], ...updates };

    const dbUpdates: Record<string, any> = {};
    if (updates.body !== undefined) dbUpdates.body = updates.body;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.likes !== undefined) dbUpdates.likes = updates.likes;
    if (updates.comments !== undefined) dbUpdates.comments = updates.comments;

    supabase.from('posts').update(dbUpdates).eq('id', id).then(({ error }) => {
      if (error) console.error('Failed to sync updated post to Supabase:', error);
    });

    return postsCache[idx];
  },
  delete(id: string): void {
    postsCache = postsCache.filter(p => p.id !== id);
    supabase.from('posts').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Failed to delete post in Supabase:', error);
    });
  },
  toggleLike(postId: string, userId: string): Post | null {
    const post = postsCache.find(p => p.id === postId);
    if (!post) return null;

    const idx = post.likes.indexOf(userId);
    if (idx === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(idx, 1);
    }

    supabase.from('posts').update({ likes: post.likes }).eq('id', postId).then(({ error }) => {
      if (error) console.error('Failed to toggle post like in Supabase:', error);
    });

    return post;
  },
  addComment(postId: string, authorId: string, text: string): Post | null {
    const post = postsCache.find(p => p.id === postId);
    if (!post) return null;

    const author = UserAPI.getById(authorId);
    if (!author) return null;

    if (!post.commentsList) post.commentsList = [];

    const newComment: Comment = {
      id: 'cmt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      authorId,
      authorName: author.name,
      authorInitials: author.initials,
      text,
      ts: Date.now()
    };

    post.commentsList.push(newComment);
    post.comments = post.commentsList.length;

    // Supabase Background insert for Comment
    supabase.from('comments').insert([{
      id: newComment.id,
      postId,
      authorId,
      authorName: newComment.authorName,
      authorInitials: newComment.authorInitials,
      text: newComment.text,
      ts: newComment.ts
    }]).then(({ error }) => {
      if (error) console.error('Failed to sync comment insert to Supabase:', error);
    });

    // Supabase Background update for Post comment count
    supabase.from('posts').update({ comments: post.comments }).eq('id', postId).then(({ error }) => {
      if (error) console.error('Failed to sync post comment count update to Supabase:', error);
    });

    return post;
  }
};

/* ══════════════════════════════════════════
   DiscAPI Forums Database Service
   ══════════════════════════════════════════ */
export const DiscAPI = {
  getAll(): Discussion[] {
    return discussionsCache;
  },
  getVisible(role: string): Discussion[] {
    return this.getAll().filter(d => !d.flagged || role === 'admin' || role === 'faculty');
  },
  getByCategory(cat: string, role: string): Discussion[] {
    const d = this.getVisible(role);
    return cat === 'All' ? d : d.filter(x => x.category === cat);
  },
  create(authorId: string, authorName: string, data: { title: string; body: string; category: string }): Discussion {
    const newDisc: Discussion = {
      id: 'd_' + Date.now(),
      authorId,
      author: authorName,
      title: data.title,
      body: data.body,
      category: data.category || 'General E-Cell',
      votes: 0,
      replies: 0,
      pinned: false,
      ts: Date.now(),
      flagged: false
    };

    discussionsCache.unshift(newDisc);

    supabase.from('discussions').insert([newDisc]).then(({ error }) => {
      if (error) console.error('Failed to sync new discussion to Supabase:', error);
    });

    return newDisc;
  },
  vote(id: string, dir: number): Discussion | null {
    const d = discussionsCache.find(x => x.id === id);
    if (d) {
      d.votes += dir;
      supabase.from('discussions').update({ votes: d.votes }).eq('id', id).then(({ error }) => {
        if (error) console.error('Failed to update discussion votes in Supabase:', error);
      });
    }
    return d || null;
  },
  pin(id: string): Discussion | null {
    const d = discussionsCache.find(x => x.id === id);
    if (d) {
      d.pinned = !d.pinned;
      supabase.from('discussions').update({ pinned: d.pinned }).eq('id', id).then(({ error }) => {
        if (error) console.error('Failed to update discussion pinned status in Supabase:', error);
      });
    }
    return d || null;
  },
  delete(id: string): Discussion | null {
    const d = discussionsCache.find(x => x.id === id);
    discussionsCache = discussionsCache.filter(x => x.id !== id);
    
    supabase.from('discussions').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Failed to delete discussion from Supabase:', error);
    });

    return d || null;
  }
};

/* ══════════════════════════════════════════
   AnncAPI Announcements Database Service
   ══════════════════════════════════════════ */
export const AnncAPI = {
  getAll(): Announcement[] {
    return announcementsCache;
  },
  create(authorId: string, authorName: string, data: { title: string; body: string; category: string; pinned?: boolean }): Announcement {
    const a: Announcement = {
      id: 'a_' + Date.now(),
      authorId,
      author: authorName,
      title: data.title,
      body: data.body,
      category: data.category || 'Announcement',
      pinned: data.pinned || false,
      ts: Date.now()
    };

    announcementsCache.unshift(a);

    supabase.from('announcements').insert([a]).then(({ error }) => {
      if (error) console.error('Failed to sync announcement to Supabase:', error);
    });

    return a;
  },
  delete(id: string): void {
    announcementsCache = announcementsCache.filter(a => a.id !== id);
    supabase.from('announcements').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Failed to delete announcement from Supabase:', error);
    });
  }
};

/* ══════════════════════════════════════════
   MsgAPI Direct Messaging Service
   ══════════════════════════════════════════ */
export const MsgAPI = {
  getThread(uid1: string, uid2: string): Message[] {
    const key = [uid1, uid2].sort().join('_');
    return messagesCache[key] || [];
  },
  getConversations(userId: string): Array<{ key: string; otherId: string; thread: Message[]; last: Message | null }> {
    return Object.keys(messagesCache)
      .filter(k => k.split('_').includes(userId) && k.includes('_')) // ensures it's a direct message (contains '_'), not a group (does not contain '_')
      .map(key => {
        const thread = messagesCache[key] || [];
        const otherId = key.split('_').find(id => id !== userId) || '';
        return { key, otherId, thread, last: thread[thread.length - 1] || null };
      });
  },
  send(fromId: string, toId: string, text: string): Message {
    const key = [fromId, toId].sort().join('_');
    if (!messagesCache[key]) {
      messagesCache[key] = [];
    }

    const msg: Message = { from: fromId, text, ts: Date.now() };
    messagesCache[key].push(msg);

    supabase.from('messages').insert([{
      chat_id: key,
      from_id: fromId,
      text,
      ts: msg.ts
    }]).then(({ error }) => {
      if (error) console.error('Failed to sync DM to Supabase:', error);
    });

    return msg;
  },
  getGroups(): GroupChat[] {
    return groupsCache;
  },
  createGroup(name: string, members: string[], creatorId: string): GroupChat {
    const newGroup: GroupChat = {
      id: 'group_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name,
      members,
      created: Date.now(),
      creatorId
    };

    groupsCache.push(newGroup);

    supabase.from('group_chats').insert([newGroup]).then(({ error }) => {
      if (error) console.error('Failed to sync new group chat to Supabase:', error);
    });

    return newGroup;
  },
  getGroupThread(groupId: string): Message[] {
    return messagesCache[groupId] || [];
  },
  sendGroupMessage(groupId: string, fromId: string, text: string): Message {
    if (!messagesCache[groupId]) {
      messagesCache[groupId] = [];
    }

    const msg: Message = { from: fromId, text, ts: Date.now() };
    messagesCache[groupId].push(msg);

    supabase.from('messages').insert([{
      chat_id: groupId,
      from_id: fromId,
      text,
      ts: msg.ts
    }]).then(({ error }) => {
      if (error) console.error('Failed to sync group message to Supabase:', error);
    });

    return msg;
  }
};

/* ══════════════════════════════════════════
   LogAPI Activity log Service
   ══════════════════════════════════════════ */
export const LogAPI = {
  getAll(): ActivityLog[] {
    return logsCache;
  },
  add(icon: string, cls: string, text: string): void {
    const newLog: ActivityLog = { icon, cls, text, time: 'Just now' };
    logsCache.unshift(newLog);
    logsCache = logsCache.slice(0, 20);

    supabase.from('activity_logs').insert([{
      icon,
      cls,
      text,
      time: 'Just now',
      ts: Date.now()
    }]).then(({ error }) => {
      if (error) console.error('Failed to sync activity log to Supabase:', error);
    });
  }
};

/* ══════════════════════════════════════════
   Session Restore Service
   ══════════════════════════════════════════ */
export const Session = {
  save(email: string): void {
    sessionStorage.setItem('ecell_user', email);
  },
  clear(): void {
    sessionStorage.removeItem('ecell_user');
  },
  getEmail(): string | null {
    return sessionStorage.getItem('ecell_user');
  },
  restore(): User | null {
    const e = this.getEmail();
    return e ? UserAPI.getByEmail(e) : null;
  }
};

/* ── Helpers ── */
export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const day = Math.floor(h / 24);

  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${day}d ago`;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function tagColor(cat: string): string {
  const m: Record<string, string> = {
    'Startup Ideas': 'badge-green',
    'Finding Team Members': 'badge-purple',
    'Hackathons': 'badge-blue',
    'Funding & Investment': 'badge-gold',
    'Technical Help': 'badge-blue',
    'General E-Cell': 'badge-gold',
    'Meeting': 'badge-gold',
    'Opportunity': 'badge-green',
    'Hackathon': 'badge-blue',
    'Event Notice': 'badge-blue',
    'Announcement': 'badge-gray',
    'Partnership': 'badge-blue',
    'Hiring': 'badge-purple'
  };
  return m[cat] || 'badge-gray';
}
