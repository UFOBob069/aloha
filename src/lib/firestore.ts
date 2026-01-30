import { adminDb as getAdminDb } from './firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Helper to get the Firestore instance
const adminDb = () => getAdminDb();

// Collection names
export const COLLECTIONS = {
  MEMBERS: 'members',
  GROUPS: 'groups',
  GROUP_MEMBERS: 'group_members',
  EVENTS: 'events',
  EVENT_ATTENDEES: 'event_attendees',
  CONVERSATION_REQUESTS: 'conversation_requests',
  REPORTS: 'reports',
} as const;

// Type definitions
export interface Member {
  id: string;
  email: string;
  name: string;
  location?: string;
  bio?: string;
  canHelpWith?: string;
  lookingFor?: string;
  whatBringsYou?: string;
  role: 'member' | 'admin' | 'facilitator';
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Group {
  id: string;
  name: string;
  purpose: string;
  description?: string;
  cadence?: string;
  maxSize: number;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GroupMember {
  id: string; // `${groupId}_${memberId}`
  groupId: string;
  memberId: string;
  role: 'member' | 'facilitator';
  joinedAt: Timestamp;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  eventDate: Timestamp;
  eventType: 'online' | 'in-person';
  meetingLink?: string;
  location?: string;
  groupId?: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface EventAttendee {
  id: string; // `${eventId}_${memberId}`
  eventId: string;
  memberId: string;
  rsvpStatus: 'attending' | 'maybe' | 'declined';
}

export interface ConversationRequest {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Timestamp;
  respondedAt?: Timestamp;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedMemberId?: string;
  reportedGroupId?: string;
  reason: string;
  description?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
  resolvedBy?: string;
}

// Helper functions
export function toTimestamp(date: Date = new Date()): Timestamp {
  return Timestamp.fromDate(date);
}

export function fromTimestamp(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

// Member operations
export async function getMemberById(id: string): Promise<Member | null> {
  const docRef = adminDb().collection(COLLECTIONS.MEMBERS).doc(id);
  const docSnap = await docRef.get();
  if (!docSnap.exists) return null;
  return { id: docSnap.id, ...docSnap.data() } as Member;
}

export async function getMemberByEmail(email: string): Promise<Member | null> {
  const q = adminDb().collection(COLLECTIONS.MEMBERS).where('email', '==', email.toLowerCase()).limit(1);
  const snapshot = await q.get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Member;
}

export async function createMember(data: Omit<Member, 'createdAt' | 'updatedAt'>): Promise<Member> {
  const now = toTimestamp();
  const memberData: Omit<Member, 'id'> = {
    ...data,
    email: data.email.toLowerCase(),
    createdAt: now,
    updatedAt: now,
  };

  await adminDb().collection(COLLECTIONS.MEMBERS).doc(data.id).set(memberData);
  return { ...memberData, id: data.id } as Member;
}

export async function updateMember(id: string, data: Partial<Omit<Member, 'id' | 'email' | 'createdAt'>>): Promise<void> {
  const updateData = {
    ...data,
    updatedAt: toTimestamp(),
  };
  await adminDb().collection(COLLECTIONS.MEMBERS).doc(id).update(updateData);
}

export async function getAllMembers(): Promise<Member[]> {
  const snapshot = await adminDb().collection(COLLECTIONS.MEMBERS).orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Member));
}

// Group operations
export async function getGroupById(id: string): Promise<Group | null> {
  const docRef = adminDb().collection(COLLECTIONS.GROUPS).doc(id);
  const docSnap = await docRef.get();
  if (!docSnap.exists) return null;
  return { id: docSnap.id, ...docSnap.data() } as Group;
}

export async function createGroup(data: Omit<Group, 'createdAt' | 'updatedAt'>): Promise<Group> {
  const now = toTimestamp();
  const groupData: Omit<Group, 'id'> = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await adminDb().collection(COLLECTIONS.GROUPS).doc(data.id).set(groupData);
  return { ...groupData, id: data.id } as Group;
}

export async function getAllGroups(): Promise<Group[]> {
  const snapshot = await adminDb().collection(COLLECTIONS.GROUPS).orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Group));
}

// Group member operations
export async function addMemberToGroup(groupId: string, memberId: string, role: 'member' | 'facilitator' = 'member'): Promise<void> {
  const id = `${groupId}_${memberId}`;
  const data: Omit<GroupMember, 'id'> = {
    groupId,
    memberId,
    role,
    joinedAt: toTimestamp(),
  };
  await adminDb().collection(COLLECTIONS.GROUP_MEMBERS).doc(id).set(data);
}

export async function removeMemberFromGroup(groupId: string, memberId: string): Promise<void> {
  const id = `${groupId}_${memberId}`;
  await adminDb().collection(COLLECTIONS.GROUP_MEMBERS).doc(id).delete();
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const snapshot = await adminDb().collection(COLLECTIONS.GROUP_MEMBERS)
    .where('groupId', '==', groupId)
    .orderBy('joinedAt', 'asc')
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as GroupMember));
}

export async function getMemberGroups(memberId: string): Promise<GroupMember[]> {
  const snapshot = await adminDb().collection(COLLECTIONS.GROUP_MEMBERS)
    .where('memberId', '==', memberId)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as GroupMember));
}

export async function isGroupMember(groupId: string, memberId: string): Promise<boolean> {
  const id = `${groupId}_${memberId}`;
  const docRef = adminDb().collection(COLLECTIONS.GROUP_MEMBERS).doc(id);
  const docSnap = await docRef.get();
  return docSnap.exists;
}

export async function getGroupMemberCount(groupId: string): Promise<number> {
  const snapshot = await adminDb().collection(COLLECTIONS.GROUP_MEMBERS)
    .where('groupId', '==', groupId)
    .get();
  return snapshot.size;
}

// Event operations
export async function getEventById(id: string): Promise<Event | null> {
  const docRef = adminDb().collection(COLLECTIONS.EVENTS).doc(id);
  const docSnap = await docRef.get();
  if (!docSnap.exists) return null;
  return { id: docSnap.id, ...docSnap.data() } as Event;
}

export async function createEvent(data: Omit<Event, 'createdAt'>): Promise<Event> {
  const eventData: Omit<Event, 'id'> = {
    ...data,
    createdAt: toTimestamp(),
  };

  await adminDb().collection(COLLECTIONS.EVENTS).doc(data.id).set(eventData);
  return { ...eventData, id: data.id } as Event;
}

export async function getUpcomingEvents(limitCount: number = 10): Promise<Event[]> {
  const now = toTimestamp();
  const snapshot = await adminDb().collection(COLLECTIONS.EVENTS)
    .where('eventDate', '>', now)
    .orderBy('eventDate', 'asc')
    .limit(limitCount)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Event));
}

export async function getGroupEvents(groupId: string): Promise<Event[]> {
  const now = toTimestamp();
  const snapshot = await adminDb().collection(COLLECTIONS.EVENTS)
    .where('groupId', '==', groupId)
    .where('eventDate', '>', now)
    .orderBy('eventDate', 'asc')
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Event));
}

export async function getPastEvents(limitCount: number = 10): Promise<Event[]> {
  const now = toTimestamp();
  const snapshot = await adminDb().collection(COLLECTIONS.EVENTS)
    .where('eventDate', '<=', now)
    .orderBy('eventDate', 'desc')
    .limit(limitCount)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Event));
}

// Event attendee operations
export async function addEventAttendee(eventId: string, memberId: string): Promise<void> {
  const id = `${eventId}_${memberId}`;
  const data: Omit<EventAttendee, 'id'> = {
    eventId,
    memberId,
    rsvpStatus: 'attending',
  };
  await adminDb().collection(COLLECTIONS.EVENT_ATTENDEES).doc(id).set(data);
}

export async function removeEventAttendee(eventId: string, memberId: string): Promise<void> {
  const id = `${eventId}_${memberId}`;
  await adminDb().collection(COLLECTIONS.EVENT_ATTENDEES).doc(id).delete();
}

export async function isEventAttendee(eventId: string, memberId: string): Promise<boolean> {
  const id = `${eventId}_${memberId}`;
  const docRef = adminDb().collection(COLLECTIONS.EVENT_ATTENDEES).doc(id);
  const docSnap = await docRef.get();
  return docSnap.exists;
}

export async function getEventAttendeeCount(eventId: string): Promise<number> {
  const snapshot = await adminDb().collection(COLLECTIONS.EVENT_ATTENDEES)
    .where('eventId', '==', eventId)
    .get();
  return snapshot.size;
}

// Conversation request operations
export async function createConversationRequest(data: Omit<ConversationRequest, 'createdAt' | 'status'>): Promise<ConversationRequest> {
  const requestData: Omit<ConversationRequest, 'id'> = {
    ...data,
    status: 'pending',
    createdAt: toTimestamp(),
  };

  await adminDb().collection(COLLECTIONS.CONVERSATION_REQUESTS).doc(data.id).set(requestData);
  return { ...requestData, id: data.id } as ConversationRequest;
}

export async function getConversationRequest(id: string): Promise<ConversationRequest | null> {
  const docRef = adminDb().collection(COLLECTIONS.CONVERSATION_REQUESTS).doc(id);
  const docSnap = await docRef.get();
  if (!docSnap.exists) return null;
  return { id: docSnap.id, ...docSnap.data() } as ConversationRequest;
}

export async function updateConversationRequestStatus(id: string, status: 'accepted' | 'declined'): Promise<void> {
  await adminDb().collection(COLLECTIONS.CONVERSATION_REQUESTS).doc(id).update({
    status,
    respondedAt: toTimestamp(),
  });
}

export async function getPendingConversationRequests(memberId: string): Promise<ConversationRequest[]> {
  const snapshot = await adminDb().collection(COLLECTIONS.CONVERSATION_REQUESTS)
    .where('toMemberId', '==', memberId)
    .where('status', '==', 'pending')
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ConversationRequest));
}

export async function getExistingConversationRequest(fromId: string, toId: string): Promise<ConversationRequest | null> {
  // Check both directions
  let snapshot = await adminDb().collection(COLLECTIONS.CONVERSATION_REQUESTS)
    .where('fromMemberId', '==', fromId)
    .where('toMemberId', '==', toId)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as ConversationRequest;
  }

  snapshot = await adminDb().collection(COLLECTIONS.CONVERSATION_REQUESTS)
    .where('fromMemberId', '==', toId)
    .where('toMemberId', '==', fromId)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as ConversationRequest;
  }

  return null;
}

// Report operations
export async function createReport(data: Omit<Report, 'createdAt' | 'status'>): Promise<Report> {
  const reportData: Omit<Report, 'id'> = {
    ...data,
    status: 'pending',
    createdAt: toTimestamp(),
  };

  await adminDb().collection(COLLECTIONS.REPORTS).doc(data.id).set(reportData);
  return { ...reportData, id: data.id } as Report;
}

export async function getReport(id: string): Promise<Report | null> {
  const docRef = adminDb().collection(COLLECTIONS.REPORTS).doc(id);
  const docSnap = await docRef.get();
  if (!docSnap.exists) return null;
  return { id: docSnap.id, ...docSnap.data() } as Report;
}

export async function getPendingReports(): Promise<Report[]> {
  const snapshot = await adminDb().collection(COLLECTIONS.REPORTS)
    .where('status', '==', 'pending')
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Report));
}

export async function updateReportStatus(id: string, status: 'resolved' | 'dismissed', resolvedBy: string): Promise<void> {
  await adminDb().collection(COLLECTIONS.REPORTS).doc(id).update({
    status,
    resolvedAt: toTimestamp(),
    resolvedBy,
  });
}
