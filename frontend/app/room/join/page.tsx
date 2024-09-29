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
  const [joinStatus, setJoinStatus] = useState<'idle' | 'joining' | 'success' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null)

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
      setJoinStatus('joining');
      setErrorMessage(null);

      const joinPromise = joinRoom({ roomCode, name }) as Promise<{ data: JoinResponse }>;
      const timerPromise = new Promise(resolve => setTimeout(resolve, 2000));

      const [response] = await Promise.all([joinPromise, timerPromise]);

      if (response.data === undefined || response.data.error === undefined) {
        console.error("response to joinRoom undefined");
        setJoinStatus('error');
        return;
      }
      if (response.data.error !== ErrorCode.noError) {
        setErrorMessage(getErrorMessage(response.data.error));
        setJoinStatus('error');
        return;
      }

      const { userID, roomListener } = response.data;
      if (userID && roomListener) {
        localStorage.setItem(roomCode, JSON.stringify({ userID, roomListener, name }));
        setJoinStatus('success');
        // Delay navigation to show success state
        setTimeout(() => {
          router.push(`/room/lobby?roomCode=${roomCode}`);
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("An error occurred while joining the room.");
      setJoinStatus('error');
    } finally {
      setJoining(false);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const getBlockColor = () => {
    switch (joinStatus) {
      case 'joining':
        return 'bg-yellow-500';
      case 'success':
        return 'bg-green-500';
      default:
        return 'bg-white/15';
    }
  };

  return (
    <div className="m-auto w-full h-full flex flex-col items-center justify-center">
      <div className="w-full h-full flex flex-col items-center justify-center mt-20">
        <h1 className="text-4xl font-semibold">Join a Room</h1>
        <div className=" flex flex-col items-start justify-start">

          <div className="mb-4 w-64 relative w">
            <a className="text-sm">Name</a>
            <input
              ref={nameInputRef}
              type="text"
              id="name-input"
              value={name}
              onChange={changeName}
              className={`w-full px-4 py-2 bg-white/15 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${!validateName(name) ? 'border-red-500' : ''
                }`}
              placeholder="Enter a Name"
              required
              aria-invalid={!validateName(name)}
              aria-describedby="name-error"
            />
            {!validateName(name) && (
              <p id="name-error" className="mt-1 text-sm text-red-500">
                {getNameHelperText(name)}
              </p>
            )}
          </div>

          <div className="relative mb-4">
            <a className="text-sm">Code</a>
            <div className="grid grid-cols-6 gap-1" role="grid" aria-label="Room code input">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className={`w-20 h-20 flex items-center justify-center rounded-sm text-3xl font-bold text-white
                  ${joining ? 'animate-flip2' : ''} ${getBlockColor()}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
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
        </div>

        <button
          onClick={goToRoom}
          disabled={!canJoin || joining}
          className={`hover:cursor-pointer px-6 py-2 rounded-lg shadow-lg font-bold transition-colors ${canJoin && !joining
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {joining ? "Joining..." : "Join"}
        </button>
        {errorMessage && <ErrorMessage error={errorMessage} />}
      </div>

    </div>
  );
}