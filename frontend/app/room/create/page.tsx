'use client';
import { useRef, useState } from "react";
import { Button, CircularProgress, TextField } from '@mui/material';
import ErrorMessage from "@/components/errorMessage";
import { randomName, validateName, getNameHelperText, ErrorCode } from "@/lib/util";
import { makeRoom, joinRoom } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

export default function Create() {
  const router = useRouter();
  const [name, setName] = useState(randomName());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false);
  const error = !validateName(name);

  const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }

  const createRoom = async () => {
    if (creating) return;
    if (error) {
      return;
    }
    try {
      setCreating(true);
      const response = (await makeRoom()).data;
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
      const jrResponse = (await joinRoom({ roomCode, name })).data;
      setCreating(false);
      if (jrResponse === undefined || jrResponse.error === undefined || jrResponse.error !== ErrorCode.noError) {
        console.log("error:" + jrResponse.error)
        return;
      }
      setLoading(true);
      console.log(jrResponse);
      const { userID, roomListener } = jrResponse;
      console.log(userID, roomListener);
      localStorage.setItem(roomCode, JSON.stringify({ userID, roomListener, name }));
      router.push(`/room/lobby?roomCode=${roomCode}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <Loading />
  }
  return (
    <>
      <div className="m-auto w-full h-full flex flex-col items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center mt-20">
          <h1 className="text-4xl font-semibold mb-5">Create a Room</h1>
          <div className=" flex flex-col items-start justify-start">
            <div className="mb-4 w-64 relative w animated animatedFadeInUp fadeInUp">
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
          </div>

          <button
            onClick={createRoom}
            disabled={error}
            className={`px-6 py-2 rounded-lg shadow-lg font-bold transition-colors ${!error
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {creating ? "Creating..." : "Create"}
          </button>
          {errorMessage && <ErrorMessage error={errorMessage} />}
        </div>

      </div>
    </>
  );
}
