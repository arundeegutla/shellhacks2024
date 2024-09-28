'use client';
import { useState } from "react";
import { Button, CircularProgress, TextField } from '@mui/material';
import ErrorMessage from "@/components/errorMessage";
import { randomName, validateName, getNameHelperText } from "@/lib/util";
import { makeRoom, joinRoom } from "@/lib/firebase";

export default function Create() {
    const [name, setName] = useState(randomName());
    const [errorMessage, setErrorMessage] = useState(null);
    const [creating, setCreating] = useState(false);
    const error = !validateName(name);
    const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    }
    // const createRoom = async (event) => {
    //     if (creating) return;
    //     event.preventDefault();
    //     if (error) {
    //         return;
    //     }
    //     try {
    //         setCreating(true);
    //         let response = await makeRoom();
    //         setCreating(false);
    //         if (response === undefined || response.error === undefined) {
    //             console.error("response to makeRoom undefined");
    //             return;
    //         }
    //         if (response.error != errorCodes.noError) {
    //             switch (response.error) {
    //                 case errorCodes.invalidName:
    //                     setErrorMessage("Invalid name");
    //                     break;
    //                 case errorCodes.roomFull:
    //                     setErrorMessage("Room is full");
    //                     break;
    //                 default:
    //                     setErrorMessage("An unknown error occurred");
    //                     break;
    //             }
    //             return;
    //         }
    //         setErrorMessage(null);
    //         const { roomCode } = response;
    //         console.log(roomCode);
    //         setCreating(true);
    //         response = await joinRoom({ roomCode, name });
    //         setCreating(false);
    //         if (response === undefined || response.error === undefined || response.error !== errorCodes.noError) {
    //             console.log("error:" + response.error)
    //             return;
    //         }
    //         console.log(response);
    //         const { userID, roomListener } = response;
    //         console.log(userID, roomListener);
    //         localStorage.setItem(roomCode, JSON.stringify({ userID, roomListener, name }));
    //         navigate(`/room/${roomCode}`);
    //     } catch (err) {
    //         console.error(err);
    //     }
    // };
    // onSubmit={createRoom}>
    return (
        <form className="landing">
            <TextField variant="outlined" label="Enter a Name" required
                value={name}
                onChange={changeName}
                error={error}
                helperText={getNameHelperText(name)} />
            {errorMessage !== null && <ErrorMessage error={errorMessage} />}
            <div className="button-row">
                <Button variant="contained" disabled={error} type="submit" sx={{ marginTop: "1rem" }}
                    startIcon={creating ? <CircularProgress size={20} color="inherit" /> : null}
                >{creating ? "Creating" : "Create"} Room</Button>
            </div>
        </form>
    );
}
