/**
 * TypeScript type definitions for E-Cell Startup Network Platform
 * /src/types.ts
 */

export interface Project {
  id: string;
  title: string;
  desc: string;
  tags: string[];
}

export type UserRole = 'student' | 'faculty' | 'admin' | 'president';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  initials: string;
  role: UserRole;
  branch: string;
  year: string;
  phone: string;
  bio: string;
  domains: string[];
  skills: string[];
  lookingFor: string[];
  linkedin: string;
  github: string;
  openToCollab: boolean;
  profileComplete: boolean;
  joined: string;
  status: UserStatus;
  connections: string[];
  projects: Project[];
  intentMode?: 'founder' | 'member_intern' | 'both';
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  text: string;
  ts: number;
}

export interface Post {
  id: string;
  authorId: string;
  author: string;
  initials: string;
  body: string;
  tags: string[];
  image: string | null;
  likes: string[]; // List of user IDs who liked
  comments: number;
  commentsList?: Comment[];
  ts: number;
}

export interface Discussion {
  id: string;
  authorId: string;
  author: string;
  title: string;
  body: string;
  category: string;
  votes: number;
  replies: number;
  pinned: boolean;
  ts: number;
  flagged: boolean;
}

export interface Announcement {
  id: string;
  authorId: string;
  author: string;
  title: string;
  body: string;
  category: string;
  pinned: boolean;
  ts: number;
}

export interface GroupChat {
  id: string;
  name: string;
  members: string[]; // List of user IDs in group
  created: number;
  creatorId: string;
}

export interface Message {
  from: string;
  text: string;
  ts: number;
}

export interface ActivityLog {
  icon: string;
  cls: 'log-gold' | 'log-red' | 'log-green' | 'log-amber' | string;
  text: string;
  time: string;
}

export interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}
