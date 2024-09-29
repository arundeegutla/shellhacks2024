"use client";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MdOutlineTimer } from "react-icons/md";
import KeyBoard from '@/components/KeyBoard';
import MiniWordle from '@/components/MiniWordle';
import { ErrorCode } from '@/lib/util';
import { db, getGameInfo, getRoomInfo, submitSecretWord } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Leaderboard, { Player } from '@/components/Leaderboard';
import { RoomType } from '@/lib/types';

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;


const players: Player[] = [
  { score: 10, name: "Arun", isHost: true },
  { score: 8, name: "Maya", isHost: false },
  { score: 12, name: "Leo", isHost: false },
  { score: 12, name: "Alex", isHost: false },
  { score: 45, name: "Sachin", isHost: false },
  { score: 34, name: "Chris", isHost: false }
];


const friends = [
  {
    name: "Arun",
    guesses: ["RAISE", "CREAM", "TRICK", "CLAPS", "ZZZZZ", "REACT"],
    ansKey: [
      [3, 2, 1, 2, 1], // For "RAISE" -> R=green, A=yellow, I=blank, S=yellow, E=blank
      [2, 3, 3, 3, 1], // For "CREAM" -> C=yellow, R=green, E=green, A=green, M=blank
      [1, 1, 1, 2, 1], // For "TRICK" -> T=blank, R=blank, I=blank, C=yellow, K=blank
      [1, 1, 2, 1, 1], // For "CLAPS" -> C=blank, L=blank, A=yellow, P=blank, S=blank
      [1, 1, 1, 1, 1],  // Extra blank row
      [3, 3, 3, 3, 3], // For "REACT" -> All green (correct word)
    ]
  },
  {
    name: "Maya",
    guesses: ["STARE", "LEMON", "TRAIL", "SPACE", "REACT"],
    ansKey: [
      [1, 1, 1, 3, 3], // For "STARE" -> S=blank, T=blank, A=blank, R=green, E=green
      [1, 1, 1, 1, 1], // For "LEMON" -> All wrong letters
      [1, 2, 1, 2, 1], // For "TRAIL" -> T=blank, R=yellow, A=blank, I=yellow, L=blank
      [1, 2, 1, 3, 3], // For "SPACE" -> S=blank, P=yellow, A=blank, C=green, E=green
      [0, 0, 0, 0, 0],  // Extra blank row
      [0, 0, 0, 0, 0]  // Extra blank row
    ]
  },
  {
    name: "Leo",
    guesses: ["CRISP", "SHARE", "RANGE", "TRACE", "REACT"],
    ansKey: [
      [2, 1, 1, 1, 1], // For "CRISP" -> C=yellow, R=blank, I=blank, S=blank, P=blank
      [1, 1, 3, 3, 3], // For "SHARE" -> S=blank, H=blank, A=green, R=green, E=green
      [3, 3, 2, 3, 3], // For "RANGE" -> R=green, A=green, N=yellow, G=green, E=green
      [1, 3, 3, 3, 3], // For "TRACE" -> T=blank, R=green, A=green, C=green, E=green
      [3, 3, 3, 3, 3], // For "REACT" -> All green (correct word)
      [0, 0, 0, 0, 0]  // Extra blank row
    ]
  },
  {
    name: "Alex",
    guesses: ["PLANE", "ACTOR", "CRAFT", "EARTH", "REACT"],
    ansKey: [
      [1, 2, 3, 1, 3], // For "PLANE" -> P=blank, L=yellow, A=green, N=blank, E=green
      [1, 3, 3, 1, 2], // For "ACTOR" -> A=blank, C=green, T=green, O=blank, R=yellow
      [2, 3, 3, 1, 1], // For "CRAFT" -> C=yellow, R=green, A=green, F=blank, T=blank
      [3, 1, 3, 1, 1], // For "EARTH" -> E=green, A=blank, R=green, T=blank, H=blank
      [3, 3, 3, 3, 3], // For "REACT" -> All green (correct word)
      [0, 0, 0, 0, 0]  // Extra blank row
    ]
  }
];



export default function Room() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('id');

  const [userID, setUserID] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [roomListener, setRoomListener] = useState<string | null>(null);

  const [guesses, setGuesses] = useState<string[]>(Array(MAX_GUESSES).fill(''));
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [solution] = useState('REACT');
  const [timeLeft, setTimeLeft] = useState(10); // Timer starts at 3 minutes (180 seconds)
  const [loaded, setLoaded] = useState(false);
  const [room, setRoom] = useState<RoomType | null>(null);

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
  }, [roomId]);

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
      // fill in previous guesses
      console.log(userID, currentGame);
      let newGuesses = [...guesses];
      for (let i = 0; i < currentGame!.data.rows.length; i++) {
        let g = currentGame!.data.rows[i].guess;
        newGuesses[i] = g ?? '';
      }
      setGuesses(newGuesses);
    }
    setRoom(roomData);
    setLoaded(true);
  };


  const submitGuess = () => {
    const newGuesses = [...guesses];
    newGuesses[currentRow] = currentGuess;
    setGuesses(newGuesses);
    setCurrentRow(prev => prev + 1);
    setCurrentGuess('');

    if (currentGuess === solution || currentRow === MAX_GUESSES - 1) {
      setGameOver(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === 'Enter') {
        if (currentGuess.length === WORD_LENGTH) {
          submitGuess();
        }
      } else if (e.key === 'Backspace') {
        setCurrentGuess(prev => prev.slice(0, -1));
      } else if (/^[A-Za-z]$/.test(e.key) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess(prev => prev + e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, gameOver, submitGuess]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (timeLeft > 0 && !gameOver) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setGameOver(true);
    }

    return () => clearInterval(timer);
  }, [timeLeft, gameOver]);

  if (!loaded) {
    return <div>Loading... (fix this)</div>;
  }

  const roundNum = room!.roundCount;
  const currentRound = room!.rounds[roundNum - 1];
  const others = currentRound.games.filter(g => g.id !== userID).sort((a, b) => a.id.localeCompare(b.id));


  if (!roomId) {
    return (
      <div>
        <p>Room ID is missing, redirecting...</p>
        <Link href="/" className="text-blue-500 underline">Go to Home</Link>
      </div>
    );
  }

  const handleKeyPress = (key: string) => {
    if (key === 'ENTER') {
      if (currentGuess.length === WORD_LENGTH) {
        submitGuess();
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(prev => prev + key);
    }
  };

  const getLetterState = (letter: string, index: number, row: number) => {
    if (row >= currentRow) return 'bg-black/50 border-2 border-white/10';
    if (solution[index] === letter) return 'bg-green-500 text-white';
    if (solution.includes(letter)) return 'bg-yellow-600 text-white';
    return 'bg-white/15 text-white';
  };

  return (
    <div className="m-auto w-full">
      <div className="flex flex-row items-center min-h-screen p-4 w-full">
        <div className='flex flex-row items-end justify-end pr-16 w-[33%]'>
          <Leaderboard players={players} />
          <button onClick={async () => {
            const obj = { room_code: roomId, word: "FORCE", user_id: userID!, round_id: (roundNum - 1).toString() };
            console.log("submitting secret word", obj);
            const response = (await submitSecretWord(obj)).data;
            console.log("secret word response", response);
          }}>
            Secret Word: Force
          </button>
        </div>
        <div className='flex flex-col items-center justify-center wordle w-[34%]'>
          <div className='flex flex-row items-center justify-center rounded-lg bg-white/10 px-2 py-1 mb-6 font-medium  min-w-20 gap-1'>
            <MdOutlineTimer />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <div className="grid grid-rows-6 gap-1 mb-4" role="grid" aria-label="Wordle game board">
            {guesses.map((guess, rowIndex) => (
              <div key={rowIndex} className="flex gap-1" role="row">
                {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => (
                  <div
                    key={colIndex}
                    className={`w-14 h-14 flex items-center justify-center rounded-sm text-3xl font-bold ${getLetterState(guess[colIndex] || '', colIndex, rowIndex)}`}
                    role="cell"
                  >
                    {guess[colIndex] || (rowIndex === currentRow ? currentGuess[colIndex] : '')}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <KeyBoard handleKeyPress={handleKeyPress} gameOver={gameOver} />
        </div>
        <div className='flex flex-col gap-1 mr-auto w-[33%] pl-16'>
          {others.map((player, i) => {
            let pAnsKey = [];
            let pGuesses = [];
            let pGameIndex = currentRound.games.findIndex(g => g.id === player.id);
            if (pGameIndex === -1) { return null; }
            for (let j = 0; j < player.data.rows.length; j++) {
              let g = player.data.rows[j].guess;
              pGuesses.push(g ?? '');
              pAnsKey.push(player.data.rows[j].verdicts);
            }
            return <MiniWordle key={i} ansKey={pAnsKey} guesses={pGuesses} name={room!.users[pGameIndex].name} timeLeft={timeLeft} />
          })}
        </div>
      </div>
    </div>
  );
}

