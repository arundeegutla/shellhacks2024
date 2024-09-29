import { getGameBoard, getRoomReference, getRoundReference } from "../firebase-utils/firebaseCalls";

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
