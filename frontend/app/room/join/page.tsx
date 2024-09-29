"use client";
import React, { useState, useRef, useEffect } from "react";
import { TextField } from '@mui/material';
import ErrorMessage from "@/components/errorMessage";
import { joinRoom } from "@/lib/firebase";
import { randomName, validateName, getNameHelperText, validateRoomCode, getRoomCodeHelperText, ErrorCode, getErrorMessage } from "@/lib/util";
import { useRouter } from "next/navigation";

interface JoinResponse {
  error: ErrorCode;
  userID?: string;
  roomListener?: string;
}

export default function Join() {
  const router = useRouter();
  const [name, setName] = useState<string>(randomName());
  const [roomCode, setRoomCode] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [joining, setJoining] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const key = e.key.toUpperCase();
    if (key === 'BACKSPACE') {
      setRoomCode(prev => prev.slice(0, -1));
    } else if (key.length === 1 && key >= 'A' && key <= 'Z' && roomCode.length < 6) {
      setRoomCode(prev => (prev + key).slice(0, 6));
    } else if (key === 'ENTER' && roomCode.length === 6) {
      goToRoom();
    }
  };

  const canJoin = validateName(name) && validateRoomCode(roomCode);

  const goToRoom = async () => {
    if (!canJoin || joining) return;
    if (localStorage.getItem(roomCode) !== null) {
      setErrorMessage("You have already joined the room.");
      return;
    }
    try {
      setJoining(true);
      const response = (await joinRoom({ roomCode, name })) as { data: JoinResponse };
      setJoining(false);
      if (response.data === undefined || response.data.error === undefined) {
        console.error("response to joinRoom undefined");
        return;
      }
      if (response.data.error !== ErrorCode.noError) {
        setErrorMessage(getErrorMessage(response.data.error));
        return;
      }
      setErrorMessage(null);
      const { userID, roomListener } = response.data;
      if (userID && roomListener) {
        localStorage.setItem(roomCode, JSON.stringify({ userID, roomListener, name }));
        router.push(`/room/lobby?roomCode=${roomCode}`);
      }
    } catch (err) {
      console.error(err);
      setJoining(false);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="m-auto w-full h-full flex flex-col items-center justify-center">
      <div className="w-full h-full flex flex-col items-center justify-center mt-20">
        <TextField
          variant="outlined"
          label="Enter a Name"
          required
          value={name}
          onChange={changeName}
          error={!validateName(name)}
          helperText={getNameHelperText(name)}
          className="mb-4 w-64"
        />

        <div className="relative mb-4">
          <div className="grid grid-cols-6 gap-1" role="grid" aria-label="Room code input">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={`w-20 h-20 flex items-center justify-center rounded-sm text-3xl font-bold bg-white/15 text-white`}
                role="cell"
              >
                {roomCode[index] || ''}
              </div>
            ))}
          </div>
          <input
            ref={inputRef}
            type="text"
            className="absolute opacity-0 top-0 left-0 w-full h-full"
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
        </div>

        {errorMessage && <ErrorMessage error={errorMessage} />}

        <button
          onClick={goToRoom}
          disabled={!canJoin || joining}
          className={`px-6 py-2 rounded-lg shadow-lg font-bold transition-colors ${canJoin && !joining
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {joining ? "Joining..." : "Join"}
        </button>
      </div>
    </div>
  );
}