import { CallableRequest, onCall } from "firebase-functions/https";
import { ErrorCode } from "../errorCodes";
import { getRoomData } from "../room";
import { guessWord } from "../word-utils/wordGuessing";
import { updateListener } from "../util";
import { setTrueWordAndTriggerRound, getRoomReference, createRound } from "../firebase-utils/firebaseCalls";
import { RoomType } from "../game-utils/RoomType";
import { UserType } from "../user-utils/UserType";
import { logger } from "firebase-functions/v2";

const NUM_GUESSES = 6, WORD_LENGTH = 5;

interface WordData {
    word: string,
    user_id: string,
    round_id: string,
    room_code: string,
}

export const submitGuess = onCall(async (request: CallableRequest<WordData>) => {
    const userId = request.data.user_id,
        roomCode = request.data.room_code,
        word = request.data.word,
        roundId = request.data.round_id;

    if (
        word === undefined ||
        userId === undefined ||
        roomCode === undefined ||
        roundId === undefined
    ) {
        return { error: ErrorCode.missingParameters };
    }

    const result = { error: await validateParameters(userId, roundId, roomCode) };
    if (result.error != ErrorCode.noError) {
        return result;
    }

    // perform function and clean up
    const potentialError = await guessWord(word, userId, roundId, roomCode);
    if (potentialError != ErrorCode.noError) {
        return { error: potentialError };
    }
    const roomData = await getRoomData(roomCode);
    if (roomData === undefined) {
        return { error: ErrorCode.roomNotFound };
    }
    await updateListener(roomData.listenDocumentID, false);
    return result;
});

export const submitSecretWord = onCall(async (request: CallableRequest<WordData>) => {
    const userId = request.data.user_id,
        roomCode = request.data.room_code,
        word = request.data.word,
        roundId = request.data.round_id;

    if (
        word === undefined ||
        userId === undefined ||
        roomCode === undefined ||
        roundId === undefined
    ) {
        return { error: ErrorCode.missingParameters };
    }

    const result = { error: await validateParameters(userId, roundId, roomCode) };
    if (result.error != ErrorCode.noError) {
        return result;
    }

    // perform function and clean up
    await setTrueWordAndTriggerRound(word, roundId, roomCode);
    const roomData = await getRoomData(roomCode);
    if (roomData === undefined) {
        return { error: ErrorCode.roomNotFound };
    }
    await updateListener(roomData.listenDocumentID, false);
    return result;
});

// start created round
// export async function startRound(roomCode: string) {
//     const roomData = await getRoomData(roomCode);
//     if(roomData === undefined)
//     {
//         return {error: ErrorCode.roomNotFound};
//     }
//     const room = roomData as RoomType;

//     // get room reference and update round started
//     const roundCount = room.roundCount;
//     const round = getRoundReference((roundCount - 1).toString(), roomCode);
//     round.update({has_started: true, time_started: Date.now()});
//     getRoomReference(roomCode).update({roundStarted: true});

//     await updateListener(roomData.listenDocumentID, false);
//     return ErrorCode.noError;
// }

// start picking word stage
export const initiateRound = onCall(async (request: CallableRequest<{ room_code: string, user_id: string }>) => {
    const roomCode = request.data.room_code;
    const userID = request.data.user_id;

    if (roomCode === undefined) {
        return { error: ErrorCode.missingParameters };
    }

    const result = { error: await validateParameters(null, null, roomCode) };
    if (result.error != ErrorCode.noError) {
        return result;
    }

    // perform function and clean up
    const roomRef = getRoomReference(roomCode);
    const roomData = await getRoomData(roomCode);
    if (roomData === undefined) {
        return { error: ErrorCode.roomNotFound };
    }

    const room = roomData as RoomType;

    if (room.hostID != userID) {
        return { error: ErrorCode.userNotHost };
    }
    const roundCount = roomData!.roundCount;
    // move this to initiateRound
    let hostIdx = roomData!.users.findIndex((user: UserType) => user.userID === roomData!.hostID);
    if (hostIdx === -1) {
        logger.error(`Host not found in room ${roomCode}`);
        return ErrorCode.userNotFound;
    }
    hostIdx = (hostIdx + 1) % roomData!.users.length;
    const newHost = roomData!.users[hostIdx].userID;
    roomRef.update({ hostID: newHost, roundStarted: false });
    let players = roomData!.users.filter((user: UserType) => user.userID !== newHost).map((user: UserType) => user.userID);
    await createRound(players, roundCount.toString(), roomCode, NUM_GUESSES, WORD_LENGTH);

    await updateListener(roomData.listenDocumentID, false);
    return result;
});

async function validateParameters(
    userId: string | null,
    roundId: string | null,
    roomCode: string | null
): Promise<ErrorCode> {
    if (userId === undefined || roundId === undefined || roomCode === undefined) {
        return ErrorCode.missingParameters;
    }
    if (roomCode !== null) {

        let roomData = await getRoomData(roomCode);
        if (roomData == undefined) {
            return ErrorCode.roomNotFound;
        } else if (userId !== null) {
            // Check if user is in room
            let userInRoom = false;
            for (let i = 0; i < roomData.users.length; i++) {
                if (roomData.users[i].userID == userId)
                    userInRoom = true;
            }

            if (!userInRoom) {
                return ErrorCode.userNotFound;
            }
        }
    }

    return ErrorCode.noError;
}
