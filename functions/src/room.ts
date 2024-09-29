import { logger } from "firebase-functions/v2";
import { rooms } from ".";
import { CallableRequest, onCall } from "firebase-functions/https";
import { ErrorCode } from "./errorCodes";


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

interface GetRoomInfoData {
	roomCode: string;
	userID: string;
}

export const getRoomInfo = onCall(async (request: CallableRequest<GetRoomInfoData>) => {
	const roomCode = request.data.roomCode;
	const userID = request.data.userID;
	let result = {
		error: ErrorCode.noError,
		host: "",
		requesterIsHost: false,
		roomListener: "",
		usersInRoom: ([]) as string[]
	}

	// Check if parameters exist
	if (roomCode === undefined || userID === undefined) {
		result.error = ErrorCode.missingParameters;
		return result;
	}

	// Check if room exists
	let roomData = await getRoomData(roomCode);
	if (roomData === undefined) {
		result.error = ErrorCode.roomNotFound;
		return result;
	}

	// Check if user exists
	let userInRoom = false;
	for (let i = 0; i < roomData.users.length; i++) {
		console.log(roomData.users[i].userID);
		if (roomData.users[i].userID == userID) userInRoom = true;
	}

	if (!userInRoom) {
		result.error = ErrorCode.userNotFound;
		return result;
	}

	// Check if user is host
	result.host = roomData.users[0].name;
	result.roomListener = roomData.listenDocumentID;
	if (userInRoom && roomData.users[0].userID == userID) {
		result.requesterIsHost = true;
	}

	// Get users in room
	for (let i = 0; i < roomData.users.length; i++) {
		result.usersInRoom.push(roomData.users[i].name);
	}

	return result;
});

export const getGameInfo = onCall(async (request: CallableRequest<GetRoomInfoData>) => {
	const roomCode = request.data.roomCode;
	const userID = request.data.userID;
	let result = {
		error: ErrorCode.noError,
		roomData: undefined as any
	}

	// Check if parameters exist
	if (roomCode === undefined || userID === undefined) {
		result.error = ErrorCode.missingParameters;
		return result;
	}

	// Check if room exists
	let roomData = await getRoomData(roomCode);
	if (roomData === undefined) {
		result.error = ErrorCode.roomNotFound;
		return result;
	}

	// Check if user exists
	let userInRoom = false;
	for (let i = 0; i < roomData.users.length; i++) {
		if (roomData.users[i].userID == userID) userInRoom = true;
	}

	if (!userInRoom) {
		result.error = ErrorCode.userNotFound;
		return result;
	}

	const roundCount = roomData.roundCount;
	roomData.rounds = [];

	for (let i = 0; i < roundCount; i++) {
		const usersSnapshot = await rooms.doc(roomCode).collection("rounds").doc(i.toString()).collection("users").get();
		const roundSnapshot = await rooms.doc(roomCode).collection("rounds").doc(i.toString()).get();
		const usersCollection = usersSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
		roomData.rounds.push({ ...(roundSnapshot.data()), games: usersCollection });
	}

	result.roomData = roomData;

	return result;
});
