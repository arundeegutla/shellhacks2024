import { CallableRequest, onCall } from "firebase-functions/https";
import { deepcopy, generateRandomRoomCode } from "./util";
import { defaultRoom } from "./game-utils/RoomType";
import { doesRoomExist } from "./room";
import { ErrorCode } from "./errorCodes";
import { v4 as uuidv4 } from 'uuid';
import { listeners, rooms } from ".";


export const makeRoom = onCall(async (request: CallableRequest) => {
	let roomCode, DRE;
	do {
		roomCode = generateRandomRoomCode();
		DRE = await doesRoomExist(roomCode);
	} while (DRE);
	const result = { error: ErrorCode.noError, roomCode: "" };
	const roomData = deepcopy(defaultRoom);
	roomData.roomCode = roomCode;
	roomData.listenDocumentID = uuidv4();
	await listeners
		.doc(roomData.listenDocumentID)
		.set({
			gameStarted: false,
			counter: 0
		})

	await rooms
		.doc(roomCode)
		.set(roomData);
	result.roomCode = roomCode;
	return result;
});
