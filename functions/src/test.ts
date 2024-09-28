import { getFirebase } from "./firebase-utils/FirebaseWrapper";

export async function runTest()
{
    await getFirebase().createGame(["a", "b", "c"], "0", "room0101", 6, 5);
}