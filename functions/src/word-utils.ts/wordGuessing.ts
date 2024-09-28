// import { isWordValid } from "./checkWordValidity";
// import { GameBoard } from "../game-utils/GameBoard";
// import { getFirebase } from "../firebase-utils/FirebaseWrapper";

// // api endpoint
// async function guessWord(word: string, userId: string, roomId: string)
// {
//     // check word
//     if(!isWordValid(word)) 
//     {
//         throw Error(`User ${userId} guessed invalid word ${word}`);
//     }
//     const firebase = getFirebase();

//     // get previous state
//     const gameState = await firebase.getGameState(userId, roomId);

//     // calc new state
//     updateStateWithGuess(gameState, userId, roomId);

//     // update state in firestore 
//     await firebase.setGameState(gameState, userId, roomId);
// }