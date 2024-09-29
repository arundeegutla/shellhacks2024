
import { getFirestore } from 'firebase-admin/firestore';
import { createDefaultBoard } from '../game-utils/GameBoard';
import { GameBoard } from '../game-utils/GameBoard';
import { Round } from '../game-utils/RoundType';
import { logger } from 'firebase-functions/v2';

const COLLECTIONS = {
    ROOM: "rooms",
    ROUND: "rounds",
    USER: "users",
};

export async function createRound(userIds: string[], roundId: string, roomCode: string, num_guesses: number, word_length: number)
{
    await getFirestore()
        .collection(COLLECTIONS.ROOM)
        .doc(roomCode)
        .collection(COLLECTIONS.ROUND)
        .doc(roundId)
        .set({});

    const batch = getFirestore().batch();
    batch.update(getRoundReference(roundId, roomCode), {
        "has_started": false,
        "time_started": Date.now(),
        "num_guesses_allowed": num_guesses,
        "word_length": word_length
    });
    userIds.forEach((userId) => {
        batch.set(getBoardReference(userId, roundId, roomCode), createDefaultBoard(num_guesses, word_length));
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

function getRoundReference(roundId: string, roomId: string)
{
    return getFirestore()
            .collection(COLLECTIONS.ROOM)
            .doc(roomId)
            .collection(COLLECTIONS.ROUND)
            .doc(roundId);
}

export async function setTrueWordAndTriggerRound(word: string, roundId: string, roomId: string)
{
    // add the true word and start the round
    await getRoundReference(roundId, roomId).update({
        'true_word': word,
        'has_started': true
    });
}

export async function getTrueWord(roundId: string, roomId: string)
{
    const doc = await getRoundReference(roundId, roomId).get();
    logger.log(`${doc.exists}, ${doc.data()}, ${!doc.data()}`);
    if(!doc.exists || !doc.data())
    {
        throw Error(`Issue getting true word from round ${roundId} from room ${roomId}`);
    }
    return (doc.data() as Round).true_word;
}
