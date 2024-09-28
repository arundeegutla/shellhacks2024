import { logger } from "firebase-functions/v2";
import { listeners } from ".";


export function generateRandomRoomCode() {
	const length = 6;
	const roomCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	let roomCode = "";
	for (let i = 0; i < length; i++) {
		roomCode += roomCharacters.charAt(Math.floor(Math.random() * roomCharacters.length));
	}
	return roomCode;
}

export function deepcopy(obj: any) {
	return JSON.parse(JSON.stringify(obj));
}

export function validateName(name: string) {
	const re = new RegExp("^(([a-zA-Z0-9]([a-zA-Z0-9 ]{0,8})[a-zA-Z0-9])|[a-zA-Z0-9])$");
	return re.test(name);
}

export const defaultRoom = {
	gameID: -1,
	users: [],
	open: true,
	roomCode: "",
	listenDocumentID: ""
};

export async function updateListener(listenerID: string, startGame: boolean) {
	let listenerData = undefined;
	try {
		const doc = await listeners.doc(listenerID).get();
		if (doc.exists) {
			listenerData = doc.data();
		}
	} catch (error) {
		logger.log("error", error);
	}
	if (listenerData == undefined) return;
	listenerData.counter++;
	if (startGame) listenerData.gameStarted = true;
	const listenerUpdate = await listeners
		.doc(listenerID)
		.set(listenerData)
    console.log(listenerUpdate);
};
