import { logger } from "firebase-functions/v2";
import { createRound, getGameBoard } from "./firebase-utils/firebaseCalls";

export async function runTest()
{
    await createRound(["a", "b", "c"], "0", "room0101", 6, 5);
    const game = await getGameBoard("b", "0", "room0101");
    logger.log(`game board: ${JSON.stringify(game)}`);
}