import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'aloha.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
db.exec(`
  -- Members table
  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    location TEXT,
    bio TEXT,
    can_help_with TEXT,
    looking_for TEXT,
    what_brings_you TEXT,
    role TEXT DEFAULT 'member',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Groups table
  CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    purpose TEXT NOT NULL,
    description TEXT,
    cadence TEXT,
    max_size INTEGER DEFAULT 20,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES members(id)
  );

  -- Group members (many-to-many)
  CREATE TABLE IF NOT EXISTS group_members (
    group_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, member_id),
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  -- Events table
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    event_type TEXT DEFAULT 'online',
    meeting_link TEXT,
    location TEXT,
    group_id TEXT,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES members(id)
  );

  -- Event attendees
  CREATE TABLE IF NOT EXISTS event_attendees (
    event_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    rsvp_status TEXT DEFAULT 'attending',
    PRIMARY KEY (event_id, member_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  -- Conversation requests (for mentorship)
  CREATE TABLE IF NOT EXISTS conversation_requests (
    id TEXT PRIMARY KEY,
    from_member_id TEXT NOT NULL,
    to_member_id TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME,
    FOREIGN KEY (from_member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (to_member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  -- Reports (for safety/moderation)
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    reporter_id TEXT NOT NULL,
    reported_member_id TEXT,
    reported_group_id TEXT,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    resolved_by TEXT,
    FOREIGN KEY (reporter_id) REFERENCES members(id),
    FOREIGN KEY (reported_member_id) REFERENCES members(id),
    FOREIGN KEY (reported_group_id) REFERENCES groups(id),
    FOREIGN KEY (resolved_by) REFERENCES members(id)
  );

  -- Create indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
  CREATE INDEX IF NOT EXISTS idx_group_members_member ON group_members(member_id);
  CREATE INDEX IF NOT EXISTS idx_event_attendees_member ON event_attendees(member_id);
  CREATE INDEX IF NOT EXISTS idx_conversations_to ON conversation_requests(to_member_id);
  CREATE INDEX IF NOT EXISTS idx_conversations_from ON conversation_requests(from_member_id);
`);

export default db;

// Type definitions
export interface Member {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  location?: string;
  bio?: string;
  can_help_with?: string;
  looking_for?: string;
  what_brings_you?: string;
  role: 'member' | 'admin' | 'facilitator';
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  purpose: string;
  description?: string;
  cadence?: string;
  max_size: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_type: 'online' | 'in-person';
  meeting_link?: string;
  location?: string;
  group_id?: string;
  created_by: string;
  created_at: string;
}

export interface ConversationRequest {
  id: string;
  from_member_id: string;
  to_member_id: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  responded_at?: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_member_id?: string;
  reported_group_id?: string;
  reason: string;
  description?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}
