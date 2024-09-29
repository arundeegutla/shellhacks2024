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
  const [curCode, setCurCode] = useState('');


  const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }
  const changeRoomCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomCode(e.target.value.toUpperCase());
  }
  const canJoin = validateName(name) && validateRoomCode(roomCode);

  const goToRoom = async () => {
    if (!canJoin || joining) return;
    if (localStorage.getItem(roomCode) !== null) {
      setErrorMessage("You have already joined the room.");
      return;
    }
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


  const handleKeyPress = (key: string) => {
    if (key === 'ENTER') {
      if (curCode.length === 6) {
        goToRoom();
      }
    } else if (key === 'BACKSPACE') {
      setCurCode(prev => prev.slice(0, -1));
    } else if (curCode.length < 6) {
      setCurCode(prev => prev + key);
    }
  };


  return (
    <div className="m-auto w-full h-full flex flex-col items-center justify-center">
      <div className="w-full h-full flex flex-col items-center justify-center mt-20">

        <TextField variant="outlined" label="Enter a Name" required
          value={name}
          onChange={changeName}
          error={!validateName(name)}
          helperText={getNameHelperText(name)} className="animated animatedFadeInUp fadeInUp" />
        <div style={{ height: "1rem", color: "white" }} />

        <div className="grid grid-rows-1 gap-1 mb-4" role="grid" aria-label="Wordle game board">
          <div className="flex gap-1" role="row">
            {Array.from({ length: 6 }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={`w-20 h-20 flex items-center justify-center rounded-sm text-3xl font-bold bg-white/15 text-white`}
                role="cell"
              >
                {curCode[colIndex] ?? ''}
              </div>
            ))}
          </div>
        </div>


        {errorMessage !== null && <ErrorMessage error={errorMessage} />}


        <button disabled={!canJoin} className="px-6 py-2 bg-green-500/30 border-2 border-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transition-colors">
          {joining ? "Joining" : "Join"}
        </button>
      </div>

    </div>
  );
};
