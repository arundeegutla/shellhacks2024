
import { getFirestore } from 'firebase-admin/firestore';
import { createDefaultBoard } from '../game-utils/GameBoard';
import { GameBoard } from '../game-utils/GameBoard';
import { Round } from '../game-utils/RoundType';
// import { wrapUpRound } from '../word-utils/wordGuessing';
// import { increment } from "firebase/firestore";


const COLLECTIONS = {
    ROOM: "rooms",
    ROUND: "rounds",
    USER: "users",
};


// create a round construct that is in picking word stage
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
        "has_finished": false,
        "time_started": Date.now(),
        "num_guesses_allowed": num_guesses,
        "word_length": word_length
    });
    userIds.forEach((userId) => {
        batch.set(getBoardReference(userId, roundId, roomCode), createDefaultBoard(num_guesses, word_length));
    });
    await batch.commit()
    // increment round count
    const roundCount = (await getRoomReference(roomCode).get()).data()!.roundCount;
    await getRoomReference(roomCode).update({roundCount: roundCount + 1});
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

export function getRoomReference(roomId: string)
{
    return getFirestore()
            .collection(COLLECTIONS.ROOM)
            .doc(roomId);
}

export function getRoundReference(roundId: string, roomId: string)
{
    return getRoomReference(roomId)
            .collection(COLLECTIONS.ROUND)
            .doc(roundId);
}

// move from word picking stage to start of round
export async function setTrueWordAndTriggerRound(word: string, roundId: string, roomId: string)
{
    const batch = getFirestore().batch();
    // add the true word and start the round
    batch.update(getRoundReference(roundId, roomId), {
        'true_word': word,
        'has_started': true,
        'time_started': Date.now()
    });
    // batch.update(getRoomReference(roomId), {'roundCount': increment(1)});
    await batch.commit();
}

export async function getTrueWord(roundId: string, roomId: string)
{
    const doc = await getRoundReference(roundId, roomId).get();
    if(!doc.exists || !doc.data())
    {
        throw Error(`Issue getting true word from round ${roundId} from room ${roomId}`);
    }
    return (doc.data() as Round).true_word;
}

// TODO: FIX THIS
// export async function endTurn(userId: string, roundId: string, roomId: string)
// {
//     const batch = getFirestore().batch();
//     batch.update(getBoardReference(userId, roundId, roomId), {
//         'guesses_left': 0,
//         'is_done': true
//     });
//     await batch.commit();
//     await wrapUpRound(roomId, roundId, userId);
// }
