"use client";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { db, getGameInfo, getRoomInfo } from '@/lib/firebase';
import { MdOutlineTimer } from "react-icons/md";
import { ErrorCode } from '@/lib/util';
import { doc, onSnapshot } from 'firebase/firestore';
import Leaderboard, { Player } from '@/components/Leaderboard';
import Link from 'next/link';
import MiniWordle from '@/components/MiniWordle';
import Loading from '@/components/Loading';
import Board from '@/components/LiveBoard';
import LiveBoard from '@/components/LiveBoard';



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
  const [loading, setLoading] = useState(true);
  const [userID, setUserID] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [roomListener, setRoomListener] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10); // Timer starts at 3 minutes (180 seconds)

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
    });
    return () => unsubscribe();
  }, [roomListener]);

  const updateGameInfo = async () => {
    const response = (await getGameInfo({ roomId, userID })).data;
    if (response.error !== ErrorCode.noError) {
      console.error("Error getting game info");
      return;
    }
    const roomData = response.roomData;

  };

  useEffect(() => {
    if (!roomId) {
      router.push('/');
    }
  }, [roomId, router]);

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

  if (loading) {
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



  return (
    <div className="m-auto w-full">
      <div className="flex flex-row items-center p-4 w-full">
        <div className='flex flex-row items-end justify-end pr-16 w-[33%]'>
          <Leaderboard players={players} />
        </div>
        <div className='flex flex-col items-center justify-center wordle w-[34%]'>
          <div className='flex flex-row items-center justify-center rounded-lg bg-white/10 px-2 py-1 mb-6 font-medium  min-w-20 gap-1'>
            <MdOutlineTimer />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <LiveBoard gameOver={gameOver} setGameOver={setGameOver} />
        </div>
        <div className='flex flex-col gap-1 mr-auto w-[33%] pl-16'>
          {friends.map((m, i) => {
            return <MiniWordle key={i} ansKey={m.ansKey} guesses={m.guesses} name={m.name} timeLeft={timeLeft} />
          })}
        </div>
      </div>
    </div>
  );
}

