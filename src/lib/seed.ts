import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import db from './db';

// Check if database is already seeded
const existingAdmin = db.prepare("SELECT * FROM members WHERE role = 'admin' LIMIT 1").get();

if (!existingAdmin) {
  console.log('Seeding database...');

  // Create admin user
  const adminId = uuidv4();
  const adminPasswordHash = bcrypt.hashSync('admin123', 12);

  db.prepare(`
    INSERT INTO members (id, email, password_hash, name, location, bio, can_help_with, looking_for, what_brings_you, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'admin')
  `).run(
    adminId,
    'admin@aloharising.org',
    adminPasswordHash,
    'Community Admin',
    'San Francisco, CA',
    'I am the founding administrator of Aloha Rising. My mission is to help people find purpose through meaningful connection.',
    'Community building, platform guidance, connecting members with the right groups',
    'Passionate people who want to make a difference',
    'To help build a community where everyone can find purpose'
  );

  // Create sample groups
  const groups = [
    {
      name: 'Life After Retirement',
      purpose: 'Support and share experiences about navigating the transition to retirement',
      description:
        'A supportive space for those who have retired or are approaching retirement. We discuss finding new purpose, maintaining social connections, and making the most of this new chapter of life.',
      cadence: 'Weekly on Thursdays',
    },
    {
      name: 'First-Time Founders',
      purpose: 'Connect aspiring entrepreneurs with experienced mentors',
      description:
        'Whether you are just starting to think about building something or are already in the trenches, this group connects you with people who have been there before.',
      cadence: 'Bi-weekly on Tuesdays',
    },
    {
      name: 'Caregiving & Aging Parents',
      purpose: 'Share wisdom and support for those caring for aging family members',
      description:
        'Caring for aging parents is one of life\'s greatest challenges and privileges. This group provides a space to share experiences, resources, and emotional support.',
      cadence: 'Weekly on Mondays',
    },
    {
      name: 'Designing the Last Chapter',
      purpose: 'Thoughtfully plan and design a meaningful life in your later years',
      description:
        'For those who want to be intentional about how they spend their remaining years. We discuss legacy, meaning, relationships, and how to make the most of every day.',
      cadence: 'Monthly on first Saturday',
    },
    {
      name: 'Career Transitions',
      purpose: 'Navigate major career changes with support from those who have done it',
      description:
        'Thinking about a career change? Already in the midst of one? Connect with others who understand the challenges and rewards of reinventing yourself professionally.',
      cadence: 'Bi-weekly on Wednesdays',
    },
  ];

  for (const group of groups) {
    const groupId = uuidv4();
    db.prepare(`
      INSERT INTO groups (id, name, purpose, description, cadence, max_size, created_by)
      VALUES (?, ?, ?, ?, ?, 20, ?)
    `).run(groupId, group.name, group.purpose, group.description, group.cadence, adminId);

    // Add admin as facilitator
    db.prepare(`
      INSERT INTO group_members (group_id, member_id, role)
      VALUES (?, ?, 'facilitator')
    `).run(groupId, adminId);
  }

  // Create a sample event
  const eventId = uuidv4();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(14, 0, 0, 0);

  db.prepare(`
    INSERT INTO events (id, title, description, event_date, event_type, meeting_link, created_by)
    VALUES (?, ?, ?, ?, 'online', ?, ?)
  `).run(
    eventId,
    'Welcome to Aloha Rising - Community Introduction',
    'Join us for an introductory session where we will share the vision of Aloha Rising and help you find your place in the community. This is a great opportunity to meet other members and learn about the various groups and activities.',
    nextWeek.toISOString(),
    'https://meet.google.com/aloha-rising',
    adminId
  );

  console.log('Database seeded successfully!');
  console.log('');
  console.log('Admin login credentials:');
  console.log('  Email: admin@aloharising.org');
  console.log('  Password: admin123');
  console.log('');
} else {
  console.log('Database already seeded.');
}
