import { logger } from "firebase-functions/v2";
import { createRound, getGameBoard, getTrueWord, setTrueWord } from "./firebase-utils/firebaseCalls";
import { guessWord } from "./word-utils.ts/wordGuessing";

function assert(condition: boolean, msg?: string)
{
    if(!condition)
    {
        throw Error(msg);
    }
}
export async function runTest()
{
    const roomId = "ABCEDF", roundId = "1", userId = "a", trueWord = "guess";
    await createRound([userId, "b", "c"], roundId, roomId, 6, 5);
    await setTrueWord(trueWord, roundId, roomId);

    await guessWord("crane", userId, roundId, roomId);
    const game = await getGameBoard(userId, roundId, roomId);
    logger.log(`game board: ${JSON.stringify(game)}`);

    assert(trueWord === await getTrueWord(roundId, roomId), "got incorrect true word");
}