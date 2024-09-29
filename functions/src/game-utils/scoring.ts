import { CallableRequest, onCall } from "firebase-functions/https";
import { getBoardReference, getGameBoard, getRoomReference, getRoundReference } from "../firebase-utils/firebaseCalls";
import { getFirestore } from "firebase-admin/firestore";
import { ErrorCode } from "../errorCodes";
import { endRound } from "../word-utils/wordGuessing";

const pointsForTry = [100, 20, 12, 8, 5, 3, 1];

export async function updateScore(roomId: string, roundId: string, userId: string) {
    // const roundSnapshot = await getRoundReference(roundId, roomId).get();
    const roomSnapshot = await getRoomReference(roomId).get();
    // at least 1 game has been won
    const gamesWon = await getRoundReference(roundId, roomId).collection("users").where("is_done", "==", true).get();
    const gameData = (await getGameBoard(userId, roundId, roomId));
    const attempts = gameData.num_guesses - gameData.guesses_left;
    const numUsers = roomSnapshot.data()!.users.length;
    const score = pointsForTry[attempts] + numUsers - 1 - gamesWon.size;
    let roomData = roomSnapshot.data()!;
    for(let i = 0; i < roomData!.users.length; i++) {
        if (roomData!.users[i].userID == userId) {
            roomData!.users[i].points += score;
        }
    }
    await getRoomReference(roomId).update(roomData);
    return gamesWon.size >= numUsers - 1;
}


// TODO: FIX THIS

export interface EndTurnData {
    userId: string;
    roundId: string;
    roomId: string;
}
export const endTurn = onCall(async (request: CallableRequest<EndTurnData>) => {
    const userId = request.data.userId;
    const roundId = request.data.roundId;
    const roomId = request.data.roomId;

    let response = {
        error: ErrorCode.noError
    };

    if (userId === undefined || roundId === undefined || roomId === undefined) {
        response.error = ErrorCode.missingParameters;
        return response;
    }

    const batch = getFirestore().batch();
    batch.update(getBoardReference(userId, roundId, roomId), {
        'guesses_left': 0,
        'is_done': true
    });
    await batch.commit();
    const gamesWon = await getRoundReference(roundId, roomId).collection("users").where("is_done", "==", true).get();
    const numUsers = (await getRoomReference(roomId).get()).data()!.users.length;
    const roundOver = gamesWon.size >= numUsers - 1;
    if (roundOver) await endRound(roomId, roundId);
    // await wrapUpRound(roomId, roundId, userId);

    return response
});
