import { ErrorCode } from "./util"

export interface MakeRoomResponse {
    roomCode: string,
    error: ErrorCode
}

export interface JoinRoomResponse {
    error: ErrorCode,
    userID: string,
    roomListener: string
}


export interface UserType {
    name: string,
    userID: string,
    playerID: number,
    roomCode: string
};

export enum Verdict
{
    BLANK=0,
    ABSENT=1,
    PRESENT=2,
    CORRECT=3,
};

export type Row =
{
    verdicts: Verdict[],
    guess?: string,
};

export type GameBoard =
{
    rows: Row[],
    guesses_left: number, 
    
    // game constants
    num_guesses: number,
    word_length: number,
    time_started: number,
    true_word?: string,
};

export interface UserGame {
    id: number,
    data: GameBoard
}

export type Round =
{
    has_started: boolean,
    time_started: number,
    true_word: string,
    num_guesses_allowed: number,
    word_length: number,
    games: UserGame[],
};


export interface RoomType {
    gameID: -1,
	users: UserType[],
	open: true,
	roomCode: string,
	listenDocumentID: string,
	roundStarted: boolean,
	roundCount: number,
    rounds: Round[]
};

export interface GetGameInfoResponse {
    error: ErrorCode,
    roomData: RoomType
};

export interface GetRoomInfoResponse {
    roomListener: string,
    usersInRoom: string[],
    requesterIsHost: boolean
    host: string,
    error: ErrorCode
}
