"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db, getRoomInfo, leaveRoom, startRoom } from '@/lib/firebase';
import { ErrorCode } from '@/lib/util';
import { doc, onSnapshot } from 'firebase/firestore';
import { Backdrop, Button, Card, CardHeader, CircularProgress, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function Room() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const roomCode = searchParams.get('roomCode');
    const [loaded, setLoaded] = useState(false);
    const [userID, setUserID] = useState<string | null>(null);
    const [name, setName] = useState<string | null>(null);
    const [roomListener, setRoomListener] = useState<string | null>(null);
    const [host, setHost] = useState<string | null>(null);
    const [isHost, setIsHost] = useState(false);
    const [userNames, setUserNames] = useState<string[]>([]);
    const refreshRoomData = async () => {
        if (userID === null || roomListener === null) return;
        let response;
        try {
            response = (await getRoomInfo({ roomCode, userID })).data;
        } catch (err) {
            console.error(err);
            return;
        }
        if (response === undefined || response.error === undefined || response.error !== ErrorCode.noError) {
            console.log("error:" + response.error)
            return;
        }
        const { roomListener: newRoomListener, usersInRoom, requesterIsHost, host } = response;
        setRoomListener(newRoomListener);
        setIsHost(requesterIsHost);
        setHost(host);
        setUserNames(usersInRoom);
        setLoaded(true);
    }
    // Load data from local storage
    useEffect(() => {
        if (roomCode === null) {
            router.replace('/');
        }
        const data = localStorage.getItem(roomCode!);
        if (data !== null) {
            const { userID, roomListener, name } = JSON.parse(data);
            setUserID(userID);
            setRoomListener(roomListener);
            setName(name);
            refreshRoomData();
        } else {
            router.replace("/");
        }
    }, [roomCode]);
    useEffect(() => {
        if (!roomCode) {
            router.replace('/');
        }
    }, [roomCode, router]);

    // Listen for changes in the room
    useEffect(() => {
        if (roomListener === null) return;
        const unsubscribe = onSnapshot(doc(db, "listeners", roomListener), (doc) => {
            const data = doc.data();
            console.log(data);
            const { counter, gameStarted } = (doc.data()) as { counter: number, gameStarted: boolean };
            if (!gameStarted) {
                refreshRoomData();
            } else {
                console.log("Game started");
                router.replace(`/room?id=${roomCode}`);
            }
        });
        return () => unsubscribe();
    }, [roomListener]);

    // Leave the room
    const clickLeaveRoom = async () => {
        if (userID === null || roomCode === null) return;
        try {
            localStorage.removeItem(roomCode);
            leaveRoom({ roomCode, userID }).then((res) => {
                const response = res.data;
                if (response === undefined || response.error === undefined || response.error !== ErrorCode.noError) {
                    console.log("error:" + response.error)
                    return;
                }
            });
            router.replace("/")
        } catch (err) {
            console.error(err);
        }
    };

    const userList = userNames.map((user, i) =>
        <Card key={i} raised sx={{ display: "flex", }}>
            <CardHeader
                title={
                    <div className="flex-row">
                        <Typography variant="subtitle1">
                            {user}
                        </Typography>
                        {host === user && <Typography variant="subtitle1" sx={{ color: "red" }}>&nbsp;(Host)</Typography>}
                        {name === user && <Typography variant="subtitle1" sx={{ color: "green" }}>&nbsp;(You)</Typography>}
                    </div>
                }
            />
            {name === user && <IconButton onClick={clickLeaveRoom} sx={{ marginLeft: "auto" }}>
                <CloseIcon style={{ color: "red" }} />
            </IconButton>}
        </Card>
    );

    const canStartGame = isHost && userNames.length > 1;
    const clickStartGame = async () => {
        if (!canStartGame) return;
        try {
            setLoaded(false);
            console.log({ roomCode, userID });
            const response = (await startRoom({ roomCode, userID })).data;
            setLoaded(true);
            if (response === undefined || response.error === undefined || response.error !== ErrorCode.noError) {
                console.log("error:" + response.error)
                return;
            }
        } catch (err) {
            console.error(err);
            setLoaded(true);
        }
    };

    return (
        <div className="landing">
            <div style={{ position: "relative" }}>
                <Card className="lobby" raised>
                    <Typography variant="h3">Room Code: {roomCode}</Typography>
                    <Typography variant="h5">Players:</Typography>
                    {userList}
                    {isHost && <Button variant="contained" onClick={clickStartGame}
                        disabled={!canStartGame} sx={{ marginTop: "1rem" }}>Start Game</Button>}
                    {!isHost && <Typography variant="subtitle1" sx={{ marginTop: "1rem" }}>
                        Waiting for host to start the game...</Typography>}
                </Card>
                <Backdrop open={!loaded} sx={{ position: "absolute" }}>
                    <CircularProgress color="inherit" />
                </Backdrop>
            </div>
        </div>)
}
