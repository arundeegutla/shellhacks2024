import type { UserType } from "../user-utils/UserType";

export interface RoomType {
	gameID: -1,
	users: UserType[],
	open: true,
	roomCode: string,
	listenDocumentID: string
};

export const defaultRoom = {
	gameID: -1,
	users: [],
	open: true,
	roomCode: "",
	listenDocumentID: ""
} as RoomType;