'use client';
import { useState } from "react";
import { Button, TextField, FormHelperText, CircularProgress } from '@mui/material';
import ErrorMessage from "@/components/errorMessage";
import { joinRoom } from "@/lib/firebase";
import { randomName, validateName, getNameHelperText, validateRoomCode, getRoomCodeHelperText, ErrorCode, getErrorMessage } from "@/lib/util";
import { useRouter } from "next/navigation";
// import "../styles.css";

export default function Join() {
    const router = useRouter();
    const [name, setName] = useState(randomName());
    const [roomCode, setRoomCode] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [joining, setJoining] = useState(false);
    
    const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    }
    const changeRoomCode = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRoomCode(e.target.value.toUpperCase());
    }
    const canJoin = validateName(name) && validateRoomCode(roomCode);
    const goToRoom = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canJoin || joining) return;
        if (localStorage.getItem(roomCode) !== null) {
            setErrorMessage("You have already joined the room.");
            return;
        }
        let response;
        try {
            setJoining(true);
            const response = (await joinRoom({ roomCode, name })).data;
            setJoining(false);
            if (response === undefined || response.error === undefined) {
                console.error("response to joinRoom undefined");
                return;
            }
            if (response.error != ErrorCode.noError) {
                setErrorMessage(getErrorMessage(response.error));
                return;
            }
            setErrorMessage(null);
            console.log(response);
            const { userID, roomListener } = response;
            console.log(userID, roomListener);
            localStorage.setItem(roomCode, JSON.stringify({ userID, roomListener, name }));
            router.push(`/room/lobby?roomCode=${roomCode}`);
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <form className="landing" onSubmit={goToRoom}>
            <TextField variant="outlined" label="Enter a Name" required
                value={name}
                onChange={changeName}
                error={!validateName(name)}
                helperText={getNameHelperText(name)} />
            <div style={{ height: "1rem" }} />
            <TextField variant="outlined" label="Enter Room Code" required
                value={roomCode}
                onChange={changeRoomCode}
                error={!validateRoomCode(roomCode)}
                helperText={getRoomCodeHelperText(roomCode)} />
            {errorMessage !== null && <ErrorMessage error={errorMessage} />}
            <div className="button-row">
                <Button variant="contained" disabled={!canJoin} type="submit" 
                sx={{ marginTop: "1rem" }} startIcon={joining ? <CircularProgress size={20} color="inherit"/> : null}>
                    {joining ? "Joining" : "Join"} Room</Button>
            </div>
        </form>
    );
};
