import { CallableRequest, onCall } from "firebase-functions/https";
import { ErrorCode } from "./errorCodes";
import { getRoomData } from "./room";
import { NUM_GUESSES, rooms, WORD_LENGTH } from ".";
import { createRound } from "./firebase-utils/firebaseCalls";
import { updateListener } from "./util";

interface StartRoomData {
    roomCode: string;
    userID: string;
}

export const startRoom = onCall(async (request: CallableRequest<StartRoomData>) => {
    const roomCode = request.data.roomCode;
    const userID = request.data.userID;
    let result = {
        error: ErrorCode.noError
    }

    // Check if parameters exist
    if (roomCode === undefined || userID === undefined) {
        result.error = ErrorCode.missingParameters;
        return result;
    }

    // Check if room exists
    let roomData = await getRoomData(roomCode);
    if (roomData === undefined) {
        result.error = ErrorCode.roomNotFound;
        return result;
    }

    // Check if user is in room
    let userInRoom = false;
    for (let i = 0; i < roomData.users.length; i++) {
        if (roomData.users[i].userID == userID) userInRoom = true;
    }
    if (!userInRoom) result.error = ErrorCode.userNotFound;

    // Check if user is host
    if (roomData.users[0].userID != userID) {
        result.error = ErrorCode.userNotHost;
    }

    if (result.error != ErrorCode.noError) {
        return result;
    }

    roomData.open = false;
    roomData.roundStarted = true;
    roomData.roundCount = 1;
    let otherUsers = [];
    for(let i = 1; i < roomData.users.length; i++) {
        otherUsers.push(roomData.users[i].userID);
    }
    await createRound(otherUsers, "0", roomCode, NUM_GUESSES, WORD_LENGTH);

    await rooms.doc(roomCode).set(roomData);
    updateListener(roomData.listenDocumentID, true);

    return result;
});
