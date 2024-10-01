"use client";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { MdOutlineTimer } from "react-icons/md";
import { ErrorCode, getNameHelperText, validateName } from '@/lib/util';
import { db, getGameInfo, getRoomInfo, submitGuess, submitSecretWord, initiateRound } from '@/lib/firebase';
import { RoomType } from '@/lib/types';
import { doc, onSnapshot } from 'firebase/firestore';
import Leaderboard from '@/components/Leaderboard';
import Link from 'next/link';
import MiniWordle from '@/components/MiniWordle';
import Loading from '@/components/Loading';
import LiveBoard from '@/components/LiveBoard';
import { DICTIONARY } from '@/lib/word';
import { Button, CircularProgress } from '@mui/material';

const MAX_GUESSES = 6;

export default function Room() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [userID, setUserID] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [roomListener, setRoomListener] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [room, setRoom] = useState<RoomType | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [pickWord, setPickWord] = useState<string>('');
  const [pickWordBool, setPickWordBool] = useState<boolean>(false);
  const [guesses, setGuesses] = useState<string[]>(Array(MAX_GUESSES).fill(''));
  const [start, setStart] = useState(false);
  const [hostName, setHostName] = useState('');
  const [roundStartedTime, setRoundStartedTime] = useState(Date.now());
  const [creating, setCreating] = useState(false);



  const wordInputRef = useRef<HTMLInputElement>(null)
  const validateWord = (s: string) => {
    return DICTIONARY.has(s.toLowerCase());
  }

  useEffect(() => {
    if (!roomId) {
      router.push('/');
    }
  }, [roomId, router]);

  // Load data from local storage
  useEffect(() => {
    if (roomId === null) {
      router.replace('/');
    }
    const data = localStorage.getItem(roomId!);
    if (data !== null) {
      const { userID, roomListener, name } = JSON.parse(data);
      setUserID(userID);
      setRoomListener(roomListener);
      setName(name);
      refreshRoomData();
    } else {
      router.replace("/");
    }
    setLoading(false)
  }, [roomId]);

  const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPickWord(e.target.value);
  }


  const refreshRoomData = async () => {
    if (userID === null || roomListener === null) return;
    let response;
    try {
      response = (await getRoomInfo({ roomId, userID })).data;
    } catch (err) {
      console.error(err);
      return;
    }
    if (response === undefined || response.error === undefined || response.error !== ErrorCode.noError) {
      console.log("error:" + response.error)
      return;
    }
    const { roomListener: newRoomListener } = response;
    setRoomListener(newRoomListener);
  }

  // Listen for changes in the room
  useEffect(() => {
    if (roomListener === null) return;
    const unsubscribe = onSnapshot(doc(db, "listeners", roomListener), (doc) => {
      const data = doc.data();
      console.log(data);
      updateGameInfo();
    });
    return () => unsubscribe();
  }, [roomListener]);

  const updateGameInfo = async () => {
    const response = (await getGameInfo({ roomCode: roomId, userID })).data;
    if (response.error !== ErrorCode.noError) {
      console.error("Error getting game info: ", response.error);
      return;
    }
    const roomData = response.roomData;
    console.log("roomData", roomData);
    const roundNum = roomData!.roundCount;
    const currentRound = roomData!.rounds[roundNum - 1];
    // set previous guesses from current game
    const currentGame = currentRound.games.find(g => g.id === userID);
    if (!currentGame) {
      console.error("Current game not found");
    } else {
      setGameOver(currentGame?.data.is_done)
      // fill in previous guesses
      console.log(userID, currentGame);
      let newGuesses = [...guesses];
      for (let i = 0; i < currentGame!.data.rows.length; i++) {
        let g = currentGame!.data.rows[i].guess;
        newGuesses[i] = g ?? '';
      }
      setGuesses(newGuesses);
    }

    setRoundStartedTime(currentRound.time_started);
    setIsHost(roomData.hostID === userID);
    setHostName(roomData.users.find(user => user.userID === roomData.hostID)?.name || '');
    setRoom(roomData);
    setStart(currentRound.has_started)
    setLoading(false);
    setGameOver(currentRound.has_finished); // show the popup
  };


  useEffect(() => {
    if (!roomId) {
      router.push('/');
    }
  }, [roomId, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (start && timeLeft > 0 && !gameOver) {
      timer = setInterval(() => {
        setTimeLeft(Math.round(((roundStartedTime + 180000) - Date.now()) / 1000));
      }, 1000);
    } else if (timeLeft <= 0) {
      setTimeLeft(180);
      setGameOver(true);
    }

    return () => clearInterval(timer);
  }, [timeLeft, gameOver, start, roundStartedTime]);


  if (loading || !room) {
    return <Loading />
  }

  if (!roomId) {
    return (
      <div>
        <p>Room ID is missing, redirecting...</p>
        <Link href="/" className="text-blue-500 underline">Go to Home</Link>
      </div>
    );
  }

  const submitSolve = async (s: string) => {
    if (!validateWord(s)) return;

    const obj = { room_code: roomId, word: s, user_id: userID!, round_id: (roundNum - 1).toString() };
    console.log("submitting my guess", obj);

    try {
      const response = await submitGuess(obj);
      console.log("my guess", response);
    } catch (error) {
      console.error("Error submitting guess:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const key = e.key.toUpperCase();
    if (key === 'BACKSPACE') {
      setPickWord(prev => prev.slice(0, -1));
    } else if (key.length === 1 && key >= 'A' && key <= 'Z' && pickWord.length < 6) {
      setPickWord(prev => (prev + key).slice(0, 6));
    } else if (key === 'ENTER' && pickWord.length === 5) {
      console.log(pickWord, pickWordBool)
      submitPickedWord();
    }
  };

  const submitPickedWord = async () => {
    console.log("submitting word")
    setCreating(true)
    const obj = { room_code: roomId, word: pickWord.toUpperCase(), user_id: userID!, round_id: (roundNum - 1).toString() };
    console.log("submitting secret word", obj);
    await submitSecretWord(obj).then((resp) => {
      setPickWordBool(true);
      setCreating(false)
      console.log("secret word response", resp);
    });
  }

  const moveNextRount = async () => {
    const obj = { room_code: roomId, user_id: userID! };
    await initiateRound(obj);
    setGameOver(false)
  };

  const roundNum = room!.roundCount;
  const currentRound = room!.rounds[roundNum - 1];
  const others = currentRound.games.filter(g => g.id !== userID && g.id !== room.hostID);
  if (gameOver && room.roundCount === room.users.length && currentRound.has_finished) {
    return <div>
      <h1 className='text-4xl'>Results</h1>
      <Leaderboard players={room} />
    </div>
  }
  return (
    <div className="m-auto w-full">
      {gameOver && (
        <Popup
          isHost={isHost}
          secretWord={currentRound.true_word}
          onClose={moveNextRount}
        />
      )}
      <div className="flex flex-row items-center p-4 w-full">
        <div className='flex flex-row items-end justify-end pr-16 w-[33%]'>
          <Leaderboard players={room} />
        </div>
        <div className='flex flex-col items-center justify-center wordle w-[34%] min-w-fit'>
          <div className='flex flex-row items-center justify-center rounded-lg px-2 py-1 mb-6 font-medium  min-w-20 gap-1'>
            <MdOutlineTimer />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          {isHost &&
            <div className='p-10 flex flex-col items-center justify-center rounded-lg'>
              <div className="relative mb-4 w-full">
                <h2 className="text-xl text-center mb-2">{!pickWordBool ? 'Pick a word!' : 'Ooh nice one!'}</h2>
                <div className="grid grid-cols-5 gap-1" role="grid" aria-label="Room code input">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="relative w-20 h-20">
                      <div className={`absolute w-full h-full transition-all duration-500 bg-white/15 rounded-md`} />
                      <div className="absolute w-full h-full flex items-center justify-center">
                        <span className="text-white text-3xl font-bold">{pickWord[index] || ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <input
                  ref={wordInputRef}
                  type="text"
                  className="absolute opacity-0 top-0 left-0 w-full h-full bg-pink-500"
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                  onChange={changeName}
                  aria-invalid={!validateWord(pickWord)}
                  value={pickWord}
                  disabled={pickWordBool}
                />
              </div>
              <button
                onClick={submitPickedWord}
                disabled={pickWordBool || !validateWord(pickWord)}
                className={`hover:cursor-pointer flex flex-row justify-center items-center px-6 py-2 rounded-lg shadow-lg font-bold transition-colors ${!pickWordBool && validateWord(pickWord)
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}>
                {creating ? <CircularProgress size={20} className="mr-2" color="inherit" /> : null}
                {creating ? "Submitting" : "Submit"}
              </button>
            </div>
          }
          {!isHost && !start && <h1 className='text-xl mb-5'>{hostName} is picking the word...</h1>}
          {!isHost && start && <h1 className='text-xl mb-5'>{hostName} has picked the word!</h1>}
          {!isHost && <LiveBoard start={start} setGuesses={setGuesses} submit={submitSolve} guesses={guesses} gameOver={gameOver} setGameOver={setGameOver} solution={currentRound.true_word} />}

        </div>
        <div className='flex flex-col gap-1 mr-auto w-[33%] pl-16'>
          {others.map((player, i) => {
            let pAnsKey = [];
            let pGuesses = [];
            let pGameIndex = room.users.findIndex(g => g.userID === player.id);
            if (pGameIndex === -1) { return null; }
            for (let j = 0; j < player.data.rows.length; j++) {
              let g = player.data.rows[j].guess;
              pGuesses.push(g ?? '');
              pAnsKey.push(player.data.rows[j].verdicts);
            }
            return <MiniWordle key={i} word={currentRound.true_word} guesses={pGuesses} name={room!.users[pGameIndex].name} is_done={player.data.is_done} />
          })}
        </div>
      </div>
    </div>
  );
}


const Popup = ({ secretWord, isHost, onClose }: {
  secretWord: string,
  isHost: boolean;
  onClose: () => void
}) => {
  const [clicked, setClicked] = useState(false);
  return (
    <div className="z-50 fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 text-black/75">
      <div className="bg-white/90 backdrop-blur-md rounded-lg p-5 text-center flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold">Round Over!</h2>
        <p className="mt-2">The secret word was: <strong>{secretWord}</strong></p>
        {isHost &&
          <button
            onClick={() => {
              setClicked(true);
              onClose();
            }}
            className={`flex flex-row justify-center items-center shadow-lg font-bold transition-colors mt-4 px-4 py-2 bg-blue-500 text-black/75 rounded-lg`}>
            {clicked ? <CircularProgress size={20} className="mr-2" color="inherit" /> : null}
            Next round
          </button>
        }
        {!isHost && "Please wait for the next round..."}
      </div>
    </div>
  );
};
