import { isWordValid } from "./checkWordValidity";
import { GameBoard, Verdict } from "../game-utils/GameBoard";
import { createRound, getGameBoard, getRoomReference, getTrueWord, setGameBoard } from "../firebase-utils/firebaseCalls";
import { logger } from "firebase-functions/v2";
import { IMPOSTER_ACHIEVED, NUM_ROUNDS } from "../vars";
import { ErrorCode } from "../errorCodes";
import { updateScore } from "../game-utils/scoring";
import { UserType } from "../user-utils/UserType";
// import { updateScore } from "../game-utils/scoring";

export async function guessWord(word: string, userId: string, roundId: string, roomId: string)
{
    // check word
    if(!isWordValid(word)) {
        logger.error(`User [${userId}] guessed invalid word [${word}]`);
        return ErrorCode.invalidWord;
    } 
    
    // get previous state
    const gameState = await getGameBoard(userId, roundId, roomId);
    if(gameState.guesses_left <= 0) {
        logger.error(`User ${userId} trying to guess with no more guesses left`);
        return ErrorCode.noGuessesLeft;
    } else if(gameState.is_done) {
        logger.error(`User ${userId} submitted guess, but has a finished board`);
        return ErrorCode.gameAlreadyDone;
    }
    
    // calc new state
    gameState.true_word = gameState.true_word ?? await getTrueWord(roundId, roomId);
    if(gameState.true_word === undefined) {
        logger.error(`error in guessWord(). No secret word has been submitted.`);
        return ErrorCode.missingParameters;
    }
    const winner = updateStateWithGuess(word.toUpperCase(), gameState.true_word.toUpperCase(), gameState);

    // update state in firestore 
    await setGameBoard(gameState, userId, roundId, roomId);

    if (winner) {
        const finishedRound = await updateScore(roomId, roundId, userId);
        if (finishedRound) {
            const roomRef = getRoomReference(roomId);
            const roomData = (await roomRef.get()).data();
            const roundCount = roomData!.roundCount;
            if (roundCount == NUM_ROUNDS) {
                await roomRef.update({ is_done: true });
            } else {
                let hostIdx = roomData!.users.findIndex((user: UserType) => user.userID === roomData!.hostID);
                if (hostIdx === -1) {
                    logger.error(`Host not found in room ${roomId}`);
                    return ErrorCode.userNotFound;
                }
                hostIdx = (hostIdx + 1) % roomData!.users.length;
                const newHost = roomData!.users[hostIdx].userID;
                roomRef.update({ hostID: newHost, roundStarted: false, roundCount: roundCount + 1 });
                let players = roomData!.users.filter((user: UserType) => user.userID !== newHost).map((user: UserType) => user.userID);
                await createRound(players, roundCount.toString(), roomId, gameState.num_guesses, gameState.word_length);
            }
        }
    }

    return ErrorCode.noError;
}

// modifies the game board with the new guess, returns if the game was won
function updateStateWithGuess(wordGuess: string, trueWord: string, gameBoard: GameBoard)
{
    const NUM_GUESS: number = gameBoard.num_guesses - gameBoard.guesses_left;
    gameBoard.guesses_left--;
    gameBoard.rows[NUM_GUESS].guess = wordGuess;

    // populate verdicts
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

    // checks for "done" state
    if(wordGuess === trueWord || gameBoard.guesses_left <= 0)
    {
        gameBoard.is_done = true;
        if (wordGuess === trueWord) {
            return true;
        } else {
            return false;
        }
    }

    // attempt to lie
    if(!gameBoard.is_done && gameBoard.lie_cell === undefined && IMPOSTER_ACHIEVED)
    {
        const imposterProbability = 0.5;
        if(Math.random() >= imposterProbability || gameBoard.guesses_left === 1)
        {
            const liarIndex = Math.floor(Math.random() * gameBoard.word_length);
            const oldVerdict = gameBoard.rows[NUM_GUESS].verdicts[liarIndex];
            const randomOffset = Math.floor(Math.random() * 2 + 1);
            const newVerdict = (((oldVerdict + randomOffset - 1) % 3) + 1);

            // update with the lie
            gameBoard.rows[NUM_GUESS].verdicts[liarIndex] = newVerdict;
            gameBoard.lie_cell = {
                row_index: NUM_GUESS,
                verdict_index: liarIndex,
                true_verdict: oldVerdict
            };
        }
    }
    return false;
}
