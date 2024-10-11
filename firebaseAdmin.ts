import { getApp, getApps, App, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage"; // Import getStorage

// Import the service account key JSON for Firebase Admin SDK authentication
const serviceKey = require("./service_key.json");

let app: App;

// Initialize Firebase Admin app if it hasn't been initialized yet
if (getApps().length === 0) {
    app = initializeApp({
        credential: cert(serviceKey), 
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET 
    });
} else {
    app = getApp(); 
}

// Get a Firestore instance from the initialized Firebase Admin app
const adminDb = getFirestore(app);

// Get a Storage instance from the initialized Firebase Admin app
const adminStorage = getStorage(app);

// Export the initialized app, Firestore instance, and Storage instance
export { app as adminApp, adminDb, adminStorage };
