import { onCall, CallableRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";

// Initialize the Firebase Admin SDK
const firebaseApp = initializeApp()

export const db = getFirestore(firebaseApp)
export const rooms = db.collection('rooms');
export const listeners = db.collection('listeners');

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

export const testFn = onCall(async () => {
    try {
        // Ensure that runTest returns a Promise
        await runTest();
        return { status: "Completed" }; // return an object instead of just a string
    } catch (error) {
        console.error("Error running testFn:", error);
        return {message: "Something went wrong"};
    }
});



import { makeRoom } from "./make";
import { joinRoom } from "./join";
import { getRoomInfo } from "./room";
import { runTest } from "./test";

export { makeRoom, joinRoom, getRoomInfo };
