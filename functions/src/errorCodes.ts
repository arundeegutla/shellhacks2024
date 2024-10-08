enum ErrorCode {
	noError = 0,
	roomNotFound = -1,
	invalidName = -2,
	roomClosed = -3,
	roomFull = -4,
	nameDuplicate = -5,
	invalidHost = -6,
	userNotFound = -7,
	missingParameters = -8,
	invalidAction = -9,
	userNotHost = -10,
	invalidWord = -11,
	noGuessesLeft = -12,
	gameAlreadyDone = -13,
}

export { ErrorCode };
