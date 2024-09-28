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


function getErrorMessage(errorCode: ErrorCode) {
    switch(errorCode) {
        case ErrorCode.noError:
            return "No error";
        case ErrorCode.roomNotFound:
            return "Room not found";
        case ErrorCode.invalidName:
            return "Invalid name";
        case ErrorCode.roomClosed:
            return "Room is closed";
        case ErrorCode.roomFull:
            return "Room is full";
        case ErrorCode.nameDuplicate:
            return "Name is already taken";
        case ErrorCode.invalidHost:
            return "Invalid host";
        case ErrorCode.userNotFound:
            return "User not found";
        case ErrorCode.missingParameters:
            return "Missing parameters";
        case ErrorCode.invalidAction:
            return "Invalid action";
        default:
            return "An unknown error occurred";
    }
}

export { ErrorCode, getErrorMessage };
