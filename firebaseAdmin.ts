import { getApp, getApps, App, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Import the service account key JSON for Firebase Admin SDK authentication
const serviceKey = require("@/service_key.json");

let app: App;

// Initialize Firebase Admin app if it hasn't been initialized yet
if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(serviceKey), // Use the service account key for authentication
  });
} else {
  app = getApp(); // Use the existing initialized app
}

// Get a Firestore instance from the initialized Firebase Admin app
const adminDb = getFirestore(app);

// Export the initialized app and Firestore instance
export { app as adminApp, adminDb };
