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
	invalidAction = -9
}

export { ErrorCode };
