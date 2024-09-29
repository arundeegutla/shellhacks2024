"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db, getRoomInfo, leaveRoom, startRoom } from '@/lib/firebase';
import { ErrorCode } from '@/lib/util';
import { doc, onSnapshot } from 'firebase/firestore';
import { Backdrop, Button, Card, CardHeader, CircularProgress, IconButton, Typography } from '@mui/material';
import { FaCopy } from "react-icons/fa6";


const colors = ['bg-white/15', 'bg-yellow-500', 'bg-green-500',];

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
  const [flippedStates, setFlippedStates] = useState(Array(roomCode ? roomCode.length : 9).fill({ isFlipped: false, colorIndex: 0 }));
  const [lastFlippedIndex, setLastFlippedIndex] = useState(-1);

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

  const getRandomColorIndex = (currentIndex: number) => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * colors.length);
    } while (newIndex === currentIndex);
    return newIndex;
  };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     let indexToFlip;
  //     do {
  //       indexToFlip = Math.floor(Math.random() * 8);
  //     } while (indexToFlip === lastFlippedIndex);
  //     setLastFlippedIndex(indexToFlip);
  //     setFlippedStates(prevStates =>
  //       prevStates.map((state, idx) =>
  //         idx === indexToFlip
  //           ? { isFlipped: true, colorIndex: getRandomColorIndex(state.colorIndex) }
  //           : { isFlipped: false, colorIndex: state.colorIndex }
  //       )
  //     );
  //   }, 1500);

  //   return () => clearInterval(interval);
  // }, [lastFlippedIndex]);

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
      <div style={{ position: "relative" }} className='flex flex-col items-center justify-center'>
        <h1 className="text-5xl font-semibold mt-10">Lobby</h1>
        <div className="grid grid-cols-6 gap-1 mt-5" role="grid" aria-label="Room code input">
          {roomCode && roomCode.split("").map((letter, idx) => (
            <div key={idx} className="relative w-20 h-20">
              <div className={`absolute w-full h-full transition-all duration-500 ${colors[flippedStates[idx].colorIndex]} rounded-md ${flippedStates[idx].isFlipped ? 'animate-flip' : ''}`} />
              <div className="absolute w-full h-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">{letter.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
        <div className='mt-3 flex flex-row w-full items-start gap-3'>

          <button className='items-start' onClick={() => { navigator.clipboard.writeText("https://shellhacks24.web.app/room/join?roomCode=" + roomCode) }}>
            <div className='flex flex-row rounded-lg px-4 py-2 bg-white/15 w-fit'><FaCopy />Copy Link
            </div>
          </button>
          <div className='flex flex-col gap-2'>
            {userNames.map((user, i) => (
              <div key={i} className="w-80 p-5 bg-black/25 shadow-lg rounded-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-white text-lg font-semibold">{user}</p>
                  {host === user && <p className="text-red-500 text-sm font-medium">(Host)</p>}
                  {name === user && <p className="text-green-500 text-sm font-medium">(You)</p>}
                </div>
                {name === user && (
                  <button
                    onClick={clickLeaveRoom}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Leave
                  </button>
                )}
              </div>
            ))}
          </div>

          {isHost && <button
            onClick={clickStartGame}
            disabled={!canStartGame}
            className={`hover:cursor-pointer px-6 py-2 rounded-lg shadow-lg font-bold transition-colors ${canStartGame
              ? 'bg-gray-600 text-white hover:bg-gray-800'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            Start Game
          </button>}
        </div>


        {!isHost && <Typography variant="subtitle1" sx={{ marginTop: "1rem" }}>
          Waiting for host to start the game...</Typography>}

        <Backdrop open={!loaded} sx={{ position: "absolute" }}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    </div >)
}