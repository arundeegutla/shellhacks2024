import { CallableRequest, onCall } from "firebase-functions/https";
import { ErrorCode } from './errorCodes';
import { updateListener, validateName } from "./util";
import { getRoomData } from "./room";
import { rooms } from ".";
import { v4 as uuidv4 } from 'uuid';
import { logger } from "firebase-functions/v2";
import { RoomType } from "./game-utils/RoomType";
import { UserType } from "./user-utils/UserType";


interface JoinRoomData {
    name: string;
    roomCode: string;
}

export const joinRoom = onCall(async (request: CallableRequest<JoinRoomData>) => {
	const name = request.data.name;
	const roomCode = request.data.roomCode;
	let result = {
		error: ErrorCode.noError,
		userID: "",
		roomListener: ""
	}

	// Check if parameters exist
	if (name === undefined || roomCode === undefined) {
		result.error = ErrorCode.missingParameters;
		return result;
	}

	// Check if name is valid
	if (!validateName(name)) {
		result.error = ErrorCode.invalidName;
		return result;
	}

	// Check if room exits
	let roomDataUntyped = await getRoomData(roomCode);
	if (roomDataUntyped === undefined) {
		result.error = ErrorCode.roomNotFound;
		return result;
	}
    let roomData = roomDataUntyped as RoomType;

	// Check if therer is already a user with that name
	roomData.users.forEach((user: UserType) => {
		if (user.name === name) {
			result.error = ErrorCode.nameDuplicate;
		}
	});

	// Check if room is open
	if (!roomData.open) {
		result.error = ErrorCode.roomClosed;
	}

	// Check if the room is full
	if (roomData.users.length >= 6) {
		result.error = ErrorCode.roomFull;
	}

	if (result.error != ErrorCode.noError) {
		return result;
	}

	// Assign userID with UUID and make new user
	let userID = uuidv4();
	let user = {
		name: name,
		userID: userID,
		playerID: -1,
		roomCode: roomCode
	}

	// Add user to room
	roomData.users.push(user);
	const writeResult = await rooms
		.doc(roomCode)
		.set(roomData);
    logger.log("writeResult", writeResult);
	await updateListener(roomData.listenDocumentID, false);

	result.userID = user.userID;
	result.roomListener = roomData.listenDocumentID
	return result;
});
