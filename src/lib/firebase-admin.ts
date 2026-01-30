import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

let app: App | undefined;
let adminDb: Firestore | undefined;
let adminAuth: Auth | undefined;
let adminStorage: ReturnType<typeof getStorage> | undefined;

function getAdminApp(): App | undefined {
  if (app) return app;

  // Skip initialization during build if no credentials are available
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY && !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.warn('Firebase Admin: No credentials available, skipping initialization');
    return undefined;
  }

  if (getApps().length === 0) {
    // For production, use service account credentials from environment variable
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : undefined;

    if (serviceAccount) {
      app = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      // For development/testing without credentials, initialize with project ID only
      app = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }
  } else {
    app = getApps()[0];
  }

  return app;
}

// Lazy initialization to avoid build-time errors
function getAdminDb(): Firestore {
  if (!adminDb) {
    const appInstance = getAdminApp();
    if (!appInstance) {
      throw new Error('Firebase Admin is not initialized');
    }
    adminDb = getFirestore(appInstance);
  }
  return adminDb;
}

function getAdminAuth(): Auth {
  if (!adminAuth) {
    const appInstance = getAdminApp();
    if (!appInstance) {
      throw new Error('Firebase Admin is not initialized');
    }
    adminAuth = getAuth(appInstance);
  }
  return adminAuth;
}

function getAdminStorage(): ReturnType<typeof getStorage> {
  if (!adminStorage) {
    const appInstance = getAdminApp();
    if (!appInstance) {
      throw new Error('Firebase Admin is not initialized');
    }
    adminStorage = getStorage(appInstance);
  }
  return adminStorage;
}

// Export getters that will lazily initialize
export { getAdminDb as adminDb, getAdminAuth as adminAuth, getAdminStorage as adminStorage };
export default getAdminApp;
