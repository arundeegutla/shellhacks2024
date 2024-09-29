import { useEffect, useState } from "react";
import KeyBoard from "./KeyBoard";

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

export default function LiveBoard({
  gameOver,
  setGameOver
}: {
  gameOver: boolean;
  setGameOver: (x: boolean) => void

}) {
  const [guesses, setGuesses] = useState<string[]>(Array(MAX_GUESSES).fill(''));
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const submitGuess = () => {
    const newGuesses = [...guesses];
    newGuesses[currentRow] = currentGuess;
    setGuesses(newGuesses);
    setCurrentRow(prev => prev + 1);
    setCurrentGuess('');

    //TODO...
    if (currentGuess === solution || currentRow === MAX_GUESSES - 1) {
      setGameOver(true);
    }
  };

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

  return (
    <>
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
    </>
  );
}