'use client';
import { useState } from "react";
import { Button, CircularProgress, TextField } from '@mui/material';
import ErrorMessage from "@/components/errorMessage";
import { randomName, validateName, getNameHelperText, ErrorCode } from "@/lib/util";
import { makeRoom, joinRoom } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Create() {
    const router = useRouter();
    const [name, setName] = useState(randomName());
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const error = !validateName(name);
    const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    }
    const createRoom = async (event: any) => {
        if (creating) return;
        event.preventDefault();
        if (error) {
            return;
        }
        try {
            setCreating(true);
            let response = (await makeRoom()).data;
            setCreating(false);
            if (response === undefined || response.error === undefined) {
                console.error("response to makeRoom undefined");
                return;
            }
            if (response.error != ErrorCode.noError) {
                switch (response.error) {
                    case ErrorCode.invalidName:
                        setErrorMessage("Invalid name");
                        break;
                    case ErrorCode.roomFull:
                        setErrorMessage("Room is full");
                        break;
                    default:
                        setErrorMessage("An unknown error occurred");
                        break;
                }
                return;
            }
            setErrorMessage(null);
            const { roomCode } = response;
            console.log(roomCode);
            setCreating(true);
            let jrResponse = (await joinRoom({ roomCode, name })).data;
            setCreating(false);
            if (jrResponse === undefined || jrResponse.error === undefined || jrResponse.error !== ErrorCode.noError) {
                console.log("error:" + jrResponse.error)
                return;
            }
            console.log(jrResponse);
            const { userID, roomListener } = jrResponse;
            console.log(userID, roomListener);
            localStorage.setItem(roomCode, JSON.stringify({ userID, roomListener, name }));
            router.push(`/room/lobby?roomCode=${roomCode}`);
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <form className="landing" onSubmit={createRoom}>
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
