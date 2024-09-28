import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";
import { ErrorCode } from "./util";


const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app);
const functions = getFunctions(app);

const DEBUG = false;
if (DEBUG) {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectFunctionsEmulator(functions, 'localhost', 5001);
}

// TODO: FIX LINK
const baseURL = DEBUG ? "http://localhost:5001/shellhacks24/us-central1/" : "https://shellhacks24.cloudfunctions.net/";

// Create callable functions

export interface MakeRoomResponse {
    roomCode: string,
    error: ErrorCode
}

export interface JoinRoomResponse {
    error: ErrorCode,
    userID: string,
    roomListener: string
}
interface GetRoomInfoResponse {
    roomListener: string,
    usersInRoom: string[],
    requesterIsHost: boolean
    host: string,
    error: ErrorCode
}


const makeRoom = httpsCallable<unknown, MakeRoomResponse>(functions, "makeRoom");
const joinRoom = httpsCallable<unknown, JoinRoomResponse>(functions, "joinRoom");
const helloWorld = httpsCallable(functions, "helloWorld");
const getRoomInfo = httpsCallable<unknown, GetRoomInfoResponse>(functions, "getRoomInfo");

export { db, makeRoom, joinRoom, helloWorld, getRoomInfo };
