import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration object containing the project's API keys and identifiers
const firebaseConfig = {
  apiKey: "AIzaSyAh95LAYt_zeMMa3UIe_uG_L0ValJXiZBo",
  authDomain: "chat-with-pdf-e6cbb.firebaseapp.com",
  projectId: "chat-with-pdf-e6cbb",
  storageBucket: "chat-with-pdf-e6cbb.appspot.com",
  messagingSenderId: "516932353941",
  appId: "1:516932353941:web:e10936a064bb08b608c09c",
};

// Initialize Firebase app if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Get a Firestore instance from the Firebase app
const db = getFirestore(app);

// Get a Storage instance from the Firebase app
const storage = getStorage(app);

export { db, storage };
