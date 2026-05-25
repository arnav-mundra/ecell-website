-- Migration: 01_init_schema.sql
-- Description: Initialize schema tables for E-Cell startup network (Case-sensitive Columns for camelCase compatibility)

-- Drop existing tables if they exist (clean setup)
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS group_chats CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS discussions CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  name TEXT,
  initials TEXT,
  role TEXT,
  branch TEXT,
  year TEXT,
  phone TEXT,
  bio TEXT,
  domains TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  "lookingFor" TEXT[] DEFAULT '{}',
  linkedin TEXT DEFAULT '',
  github TEXT DEFAULT '',
  "openToCollab" BOOLEAN DEFAULT true,
  "profileComplete" BOOLEAN DEFAULT false,
  joined TEXT,
  status TEXT DEFAULT 'active',
  connections TEXT[] DEFAULT '{}',
  projects JSONB DEFAULT '[]'::jsonb,
  "intentMode" TEXT
);

-- 2. Posts Table
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  "authorId" TEXT REFERENCES users(id) ON DELETE CASCADE,
  author TEXT,
  initials TEXT,
  body TEXT,
  tags TEXT[] DEFAULT '{}',
  image TEXT,
  likes TEXT[] DEFAULT '{}',
  comments INTEGER DEFAULT 0,
  ts BIGINT NOT NULL
);

-- 3. Comments Table
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  "postId" TEXT REFERENCES posts(id) ON DELETE CASCADE,
  "authorId" TEXT REFERENCES users(id) ON DELETE CASCADE,
  "authorName" TEXT,
  "authorInitials" TEXT,
  text TEXT,
  ts BIGINT NOT NULL
);

-- 4. Discussions Table
CREATE TABLE discussions (
  id TEXT PRIMARY KEY,
  "authorId" TEXT REFERENCES users(id) ON DELETE CASCADE,
  author TEXT,
  title TEXT,
  body TEXT,
  category TEXT,
  votes INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  pinned BOOLEAN DEFAULT false,
  ts BIGINT NOT NULL,
  flagged BOOLEAN DEFAULT false
);

-- 5. Announcements Table
CREATE TABLE announcements (
  id TEXT PRIMARY KEY,
  "authorId" TEXT REFERENCES users(id) ON DELETE CASCADE,
  author TEXT,
  title TEXT,
  body TEXT,
  category TEXT,
  pinned BOOLEAN DEFAULT false,
  ts BIGINT NOT NULL
);

-- 6. Group Chats Table
CREATE TABLE group_chats (
  id TEXT PRIMARY KEY,
  name TEXT,
  members TEXT[] DEFAULT '{}',
  created BIGINT NOT NULL,
  "creatorId" TEXT REFERENCES users(id) ON DELETE SET NULL
);

-- 7. Messages Table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  chat_id TEXT, -- group chat ID or sorted uids "uid1_uid2"
  from_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  text TEXT,
  ts BIGINT NOT NULL
);

-- 8. Activity Logs Table
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  icon TEXT,
  cls TEXT,
  text TEXT,
  time TEXT,
  ts BIGINT NOT NULL
);
