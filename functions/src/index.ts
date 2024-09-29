import { onCall, CallableRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";

// Initialize the Firebase Admin SDK
const firebaseApp = initializeApp()

export const db = getFirestore(firebaseApp)
export const rooms = db.collection('rooms');
export const listeners = db.collection('listeners');


// constants
export const NUM_GUESSES = 6;
export const WORD_LENGTH = 5;

// Define the type for the data parameter
interface HelloWorldData {
    name?: string;
}

// Start writing functions
// https://firebase.google.com/docs/functions/typescript
export const helloWorld = onCall((request: CallableRequest<HelloWorldData>) => {
    logger.info("Hello logs!", { structuredData: true });

    // Access data sent by the client
    const name = request.data.name || "World";

    // Return a response
    return { message: `Hello, ${name}!` };
});




import { makeRoom } from "./make";
import { joinRoom } from "./join";
import { getRoomInfo, getGameInfo } from "./room";
import { leaveRoom } from "./leave";
import { startRoom } from "./start";

export { makeRoom, joinRoom, getRoomInfo, leaveRoom, startRoom, getGameInfo };
