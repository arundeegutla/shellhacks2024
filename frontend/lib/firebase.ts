import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";


const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const functions = getFunctions(app);

const DEBUG = false;
if (DEBUG) connectFirestoreEmulator(db, 'localhost', 8080);

// TODO: FIX LINK
const baseURL = DEBUG ? "http://localhost:5001/mobopoly-866b1/us-central1/" : "https://us-central1-mobopoly-866b1.cloudfunctions.net/";

// Create callable functions
// TODO: add types
const makeRoom = httpsCallable(functions, "makeRoom");
const joinRoom = httpsCallable(functions, "joinRoom");

export { db, makeRoom, joinRoom };
