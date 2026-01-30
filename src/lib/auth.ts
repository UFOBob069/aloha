import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db, { Member } from './db';
import { getSession } from './session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createMember(data: {
  email: string;
  password: string;
  name: string;
  location?: string;
  whatBringsYou?: string;
}): Member {
  const id = uuidv4();
  const passwordHash = bcrypt.hashSync(data.password, 12);

  const stmt = db.prepare(`
    INSERT INTO members (id, email, password_hash, name, location, what_brings_you, role)
    VALUES (?, ?, ?, ?, ?, ?, 'member')
  `);

  stmt.run(id, data.email.toLowerCase(), passwordHash, data.name, data.location || null, data.whatBringsYou || null);

  return getMemberById(id)!;
}

export function getMemberByEmail(email: string): Member | undefined {
  const stmt = db.prepare('SELECT * FROM members WHERE email = ?');
  return stmt.get(email.toLowerCase()) as Member | undefined;
}

export function getMemberById(id: string): Member | undefined {
  const stmt = db.prepare('SELECT * FROM members WHERE id = ?');
  return stmt.get(id) as Member | undefined;
}

export function updateMember(
  id: string,
  data: Partial<Pick<Member, 'name' | 'location' | 'bio' | 'can_help_with' | 'looking_for'>>
): void {
  const updates: string[] = [];
  const values: (string | null)[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.location !== undefined) {
    updates.push('location = ?');
    values.push(data.location || null);
  }
  if (data.bio !== undefined) {
    updates.push('bio = ?');
    values.push(data.bio || null);
  }
  if (data.can_help_with !== undefined) {
    updates.push('can_help_with = ?');
    values.push(data.can_help_with || null);
  }
  if (data.looking_for !== undefined) {
    updates.push('looking_for = ?');
    values.push(data.looking_for || null);
  }

  if (updates.length === 0) return;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const stmt = db.prepare(`UPDATE members SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...values);
}

export function getAllMembers(): Member[] {
  const stmt = db.prepare('SELECT * FROM members ORDER BY created_at DESC');
  return stmt.all() as Member[];
}

export async function getCurrentUser(): Promise<Member | null> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return null;
  }
  return getMemberById(session.userId) || null;
}

export function isAdmin(member: Member | null): boolean {
  return member?.role === 'admin';
}
