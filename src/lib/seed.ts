import { v4 as uuidv4 } from 'uuid';
import {
  createGroup,
  createEvent,
  addMemberToGroup,
  getMemberByEmail,
  toTimestamp,
} from './firestore';

// This script seeds the Firestore database with sample data
// Note: Run this script after creating an admin user through Firebase Auth

async function seed() {
  console.log('Checking for admin user...');

  // Check for admin user (must be created through Firebase Auth first)
  const admin = await getMemberByEmail('admin@aloharising.org');

  if (!admin) {
    console.log('');
    console.log('No admin user found. Please create an admin user first by:');
    console.log('1. Sign up through the application with admin@aloharising.org');
    console.log('2. Or create a user in Firebase Console');
    console.log('');
    console.log('After creating the admin, update their role to "admin" in Firestore.');
    return;
  }

  console.log('Admin user found. Seeding sample data...');

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
        "Caring for aging parents is one of life's greatest challenges and privileges. This group provides a space to share experiences, resources, and emotional support.",
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

  for (const groupData of groups) {
    const groupId = uuidv4();
    await createGroup({
      id: groupId,
      name: groupData.name,
      purpose: groupData.purpose,
      description: groupData.description,
      cadence: groupData.cadence,
      maxSize: 20,
      createdBy: admin.id,
    });

    // Add admin as facilitator
    await addMemberToGroup(groupId, admin.id, 'facilitator');

    console.log(`Created group: ${groupData.name}`);
  }

  // Create a sample event
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(14, 0, 0, 0);

  await createEvent({
    id: uuidv4(),
    title: 'Welcome to Aloha Rising - Community Introduction',
    description:
      'Join us for an introductory session where we will share the vision of Aloha Rising and help you find your place in the community. This is a great opportunity to meet other members and learn about the various groups and activities.',
    eventDate: toTimestamp(nextWeek),
    eventType: 'online',
    meetingLink: 'https://meet.google.com/aloha-rising',
    createdBy: admin.id,
  });

  console.log('Created sample event');
  console.log('');
  console.log('Database seeded successfully!');
}

seed().catch(console.error);
