import { onCall, CallableRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

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
