import type { UserType } from "../user-utils/UserType";

export interface RoomType {
    gameID: -1,
	users: UserType[],
	open: true,
	roomCode: string,
	listenDocumentID: string,
	roundStarted: boolean,
	roundCount: number,
	hostID?: string
};

export const defaultRoom = {
	gameID: -1,
	users: [],
	open: true,
	roomCode: "",
	listenDocumentID: "",
	roundStarted: false,
	roundCount: 0
} as RoomType;
