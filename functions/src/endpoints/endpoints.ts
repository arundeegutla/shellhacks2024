import { CallableRequest, onCall } from "firebase-functions/https";
import { ErrorCode } from "../errorCodes";
import { getRoomData } from "../room";
import { guessWord } from "../word-utils.ts/wordGuessing";
import { updateListener } from "../util";
import { createRound, setTrueWordAndTriggerRound } from "../firebase-utils/firebaseCalls";
import { RoomType } from "../game-utils/RoomType";

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
		return {error: ErrorCode.missingParameters};
	}

    const result = { error: await validateParameters(userId, roundId, roomCode) };
	if (result.error != ErrorCode.noError) {
		return result;
	}

    // perform function and clean up
    await guessWord(word, userId, roundId, roomCode);
    const roomData = await getRoomData(roomCode);
    if(roomData === undefined)
    {
        return {error: ErrorCode.roomNotFound};
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
        return {error: ErrorCode.missingParameters};
    }
    
    const result = { error: await validateParameters(userId, roundId, roomCode) };        
	if (result.error != ErrorCode.noError) {
		return result;
	}

    // perform function and clean up
    await setTrueWordAndTriggerRound(word, roundId, roomCode);
    const roomData = await getRoomData(roomCode);
    if(roomData === undefined)
    {
        return {error: ErrorCode.roomNotFound};
    }
	await updateListener(roomData.listenDocumentID, false);
	return result;
});

export const initiateRound = onCall(async (request: CallableRequest<{room_code: string}>) => {
	const roomCode = request.data.room_code;

    if (roomCode === undefined ) {
        return {error: ErrorCode.missingParameters};
    }
    
    const result = { error: await validateParameters(null, null, roomCode) };        
	if (result.error != ErrorCode.noError) {
		return result;
	}

    // perform function and clean up
    const roomData = (await getRoomData(roomCode))?.data();
    if(roomData === undefined)
    {
        return {error: ErrorCode.roomNotFound};
    }

    const room = roomData as RoomType;

    await createRound(room.users.map((user) => user.userID), String(room.round_counter), roomCode, NUM_GUESSES, WORD_LENGTH);
	await updateListener(roomData.listenDocumentID, true);
	return result;
});

async function validateParameters(
    userId: string | null, 
    roundId: string | null, 
    roomCode: string | null
): Promise<ErrorCode> {
    if(userId === undefined || roundId === undefined || roomCode === undefined) {
        return ErrorCode.missingParameters;
    }
    if(roomCode !== null) {

        let roomData = await getRoomData(roomCode);
        if (roomData == undefined) {
            return ErrorCode.roomNotFound;
        }

        // Check if room is closed
        if (!roomData.open) {
            return ErrorCode.roomClosed;
        }
        
        if(userId !== null) {
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