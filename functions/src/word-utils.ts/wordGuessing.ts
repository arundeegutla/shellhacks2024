import { isWordValid } from "./checkWordValidity";
import { GameBoard, Verdict } from "../game-utils/GameBoard";
import { getGameBoard, getTrueWord, setGameBoard } from "../firebase-utils/firebaseCalls";

export async function guessWord(word: string, userId: string, roundId: string, roomId: string)
{
    // check word
    if(!isWordValid(word)) {
        throw Error(`User ${userId} guessed invalid word ${word}`);
    } 
    
    // get previous state
    const gameState = await getGameBoard(userId, roundId, roomId);
    if(gameState.guesses_left <= 0) {
        throw Error(`User ${userId} trying to guess with no more guesses left`);
    }
    
    // calc new state
    gameState.true_word = gameState.true_word ?? await getTrueWord(roundId, roomId);
    updateStateWithGuess(word, gameState.true_word as string, gameState);

    // update state in firestore 
    await setGameBoard(gameState, userId, roundId, roomId);
}

// modifies the game board with the new guess
function updateStateWithGuess(wordGuess: string, trueWord: string, gameBoard: GameBoard)
{
    const NUM_GUESS: number = gameBoard.num_guesses - gameBoard.guesses_left;
    gameBoard.guesses_left--;
    gameBoard.rows[NUM_GUESS].guess = wordGuess;

    // populate
    const trueWordArray = [...trueWord];
    [...wordGuess].forEach((char, index) => {
        if (char === trueWordArray[index]) {
            gameBoard.rows[NUM_GUESS].verdicts[index] = Verdict.CORRECT;
            trueWordArray[index] = null as any; // Remove the correct letter from further comparisons
        }
    });

    [...wordGuess].forEach((char, index) => {
        if (gameBoard.rows[NUM_GUESS].verdicts[index] !== Verdict.CORRECT) {
            const foundIndex = trueWordArray.indexOf(char);
            if (foundIndex !== -1) {
                gameBoard.rows[NUM_GUESS].verdicts[index] = Verdict.PRESENT;
                trueWordArray[foundIndex] = null as any; // Remove found letter from further matches
            } else {
                gameBoard.rows[NUM_GUESS].verdicts[index] = Verdict.ABSENT;
            }
        }
    });
}