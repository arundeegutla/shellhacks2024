import { logger } from "firebase-functions/v2";
import { rooms } from ".";


export async function doesRoomExist(roomCode: string) {
	const re = new RegExp("^[A-Z]{6}$");
	if (!re.test(roomCode)) return false;
	let documentExists = false;
	try {
		const doc = await rooms.doc(roomCode).get();
		documentExists = doc.exists;
	}
	catch (error) {
		logger.log("error", error);
		return false;
	}
	return documentExists;
}

export async function getRoomData(roomCode: string) {
	let roomExists = await doesRoomExist(roomCode);
	let roomData = undefined;
	if (!roomExists) { return undefined; }

	try {
		const doc = await rooms.doc(roomCode).get();
		if (doc.exists) {
			roomData = doc.data();
		}
	} catch (error) {
		logger.log("error in getRoomData", error);
		return undefined;
	}

	return roomData;
}
