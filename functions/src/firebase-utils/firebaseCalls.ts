
import { getFirestore } from 'firebase-admin/firestore';
import { createDefaultBoard } from '../game-utils/GameBoard';
import { GameBoard } from '../game-utils/GameBoard';

const COLLECTIONS = {
    ROOM: "rooms",
    ROUND: "rounds",
    USER: "users",
};

export async function createRound(userIds: string[], roundId: string, roomId: string, num_guesses: number, word_length: number)
{
    await getFirestore().collection(COLLECTIONS.ROOM).doc(roomId).collection(COLLECTIONS.ROUND).doc(roundId).set({});
    const batch = getFirestore().batch();

    userIds.forEach((userId) => {
        batch.set(getBoardReference(userId, roundId, roomId), createDefaultBoard(num_guesses, word_length));
    });

    await batch.commit()
}

function getBoardReference(userId: string, roundId: string, roomId: string)
{
    return getFirestore()
            .collection(COLLECTIONS.ROOM)
            .doc(roomId)
            .collection(COLLECTIONS.ROUND)
            .doc(roundId)
            .collection(COLLECTIONS.USER)
            .doc(userId);
}

export async function getGameBoard(userId: string, roundId: string, roomId: string)
{
    const doc = (await getBoardReference(userId, roundId, roomId).get());
    if(!doc.exists || !doc.data())
    {
        throw Error(`Game State for user ${userId}, round ${roundId}, room ${roomId} was not found`);
    }
    return doc.data() as GameBoard;
}

export async function setGameBoard(gameBoard: GameBoard, userId: string, roundId: string, roomId: string)
{
    return getBoardReference(userId, roundId, roomId).set(gameBoard);
}