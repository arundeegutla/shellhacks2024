"use client";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MdOutlineTimer } from "react-icons/md";
import KeyBoard from '@/components/KeyBoard';

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;


export default function Room() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('id');

  const [guesses, setGuesses] = useState<string[]>(Array(MAX_GUESSES).fill(''));
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [solution] = useState('REACT');
  const [timeLeft, setTimeLeft] = useState(180); // Timer starts at 3 minutes (180 seconds)

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
    if (!roomId) {
      router.push('/');
    }
  }, [roomId, router]);

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
    if (solution.includes(letter)) return 'bg-yellow-500 text-white';
    return 'bg-white/15 text-white';
  };

  return (
    <div className="m-auto">
      Your Room ID is: <span className="font-bold">{roomId}</span>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
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
        {gameOver && (
          <div className="text-2xl font-bold">
            {currentGuess === solution ? 'Congratulations!' : `Game Over! The word was ${solution}`}
          </div>
        )}
      </div>
    </div>
  );
}

