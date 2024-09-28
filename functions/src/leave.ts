import { CallableRequest, onCall } from "firebase-functions/https";
import { ErrorCode } from "./errorCodes";
import { getRoomData } from "./room";
import { rooms } from ".";
import { updateListener } from "./util";

interface LeaveRoomData {
    userID: string;
    roomCode: string;
}

export const leaveRoom = onCall(async (request: CallableRequest<LeaveRoomData>) => {
	const userID = request.data.userID;
	const roomCode = request.data.roomCode;
	const result = {
		error: ErrorCode.noError
	};

	// Check if the userID and roomCode are provided
	if (userID === undefined || roomCode === undefined) {
		result.error = ErrorCode.missingParameters;
		return result;
	}

	// Check if room exists
	let roomData = await getRoomData(roomCode);
	if (roomData == undefined) {
		result.error = ErrorCode.roomNotFound;
		return result;
	}

	// Check if room is closed
	if (!roomData.open) {
		result.error = ErrorCode.roomClosed;
	}

	// Check if user is in room
	let userInRoom = false;
	for (let i = 0; i < roomData.users.length; i++) {
		if (roomData.users[i].userID == userID) userInRoom = true;
	}
	if (!userInRoom) result.error = ErrorCode.userNotFound;

	if (result.error != ErrorCode.noError) {
		return result;
	}

	let userIndex;
	for(let i = 0; i < roomData.users.length; i++) {
		if(roomData.users[i].userID == userID) userIndex = i;
	}

	// Remove the user from the room
	roomData.users.splice(userIndex, 1);

	// Check if user is the only one in the room
	// if (roomData.users.length == 0) {
	// 	deleteRoom(roomCode);
	// 	return result;
	// }

	rooms
		.doc(roomCode)
		.set(roomData);

	await updateListener(roomData.listenDocumentID, false);
	return result;
});
