import firebase from 'firebase/compat/app';
import "firebase/compat/database";
import 'firebase/compat/firestore';
import { initializeApp } from 'firebase-admin';
import { createDefaultBoard, GameBoard } from '../game-utils/GameBoard';

export function getFirebase(): FirebaseWrapper
{
    const fb = new FirebaseWrapper();
    // fb.initApp();
    return fb;
}

const COLLECTIONS = {
    ROOM: "rooms",
    GAME: "games",
    USER: "users",
};

export default class FirebaseWrapper
{
    static flag = false;
    public initApp(): void
    {
        if (!FirebaseWrapper.flag) {
            initializeApp();
            FirebaseWrapper.flag = true;
        }
    }

    public async createGame(userIds: string[], gameId: string, roomId: string, num_guesses: number, word_length: number)
    {
        await firebase.firestore().collection(COLLECTIONS.ROOM).doc("abc").set({"hey": "help me"});
    //    const batch = firebase.firestore().batch();

    //     userIds.forEach((userId) => {
    //         batch.set(this.getGameReference(userId, gameId, roomId), createDefaultBoard(num_guesses, word_length));
    //     });

    //     await batch.commit()
    }

    public getGameReference(userId: string, gameId: string, roomId: string)
    {
        return firebase
                .firestore()
                .collection(COLLECTIONS.ROOM)
                .doc(roomId)
                .collection(COLLECTIONS.GAME)
                .doc(gameId)
                .collection(COLLECTIONS.USER)
                .doc(userId);
    }

    public async getGameBoard(userId: string, gameId: string, roomId: string)
    {
        const doc = (await this.getGameReference(userId, gameId, roomId).get());
        if(!doc.exists || !doc.data())
        {
            throw Error(`Game State for user ${userId}, game ${gameId}, room ${roomId} was not found`);
        }
        return doc.data() as GameBoard;
    }

    public async setGameBoard(gameBoard: GameBoard, userId: string, gameId: string, roomId: string)
    {
        return this.getGameReference(userId, gameId, roomId).set(gameBoard);
    }
}