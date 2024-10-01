import { useCallback, useEffect, useState } from "react";
import KeyBoard from "./KeyBoard";
import { DICTIONARY } from "@/lib/word";

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

export default function LiveBoard({
  gameOver,
  setGameOver,
  solution,
  guesses,
  submit,
  setGuesses,
  start
}: {
  gameOver: boolean;
  setGameOver: (x: boolean) => void
  solution: string;
  guesses: string[];
  submit: (s: string) => void;
  setGuesses: (s: string[]) => void;
  start: boolean;
}) {

  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRow, setCurrentRow] = useState(() => {
    let i = 0;
    while (i < 6 && guesses[i].length !== 0) i++;
    return i;
  });

  console.log("ROW", currentRow)

  useEffect(() => {
    setGameOver(guesses.some(str => str === solution));
    setCurrentRow(() => {
      let i = 0;
      while (i < 6 && guesses[i].length !== 0) i++;
      return i;
    })
  }, [guesses, setGameOver, solution]);

  const validateWord = (s: string) => {
    return DICTIONARY.has(s.toLowerCase());
  }

  const submitGuess = useCallback(() => {
    if (!validateWord(currentGuess)) return;
    const newGuesses = [...guesses];
    newGuesses[currentRow] = currentGuess;
    setGuesses(newGuesses);
    setCurrentGuess('')
    if (currentGuess === solution || currentRow >= MAX_GUESSES - 1) {
      setGameOver(true);
    }
    submit(currentGuess)
  }, [currentGuess, currentRow, guesses, setGameOver, setGuesses, solution, submit]);

  const handleKeyPress = (key: string) => {
    if (!start) return;
    if (key === 'ENTER') {
      if (currentGuess.length === WORD_LENGTH) {
        submitGuess();
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Za-z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(prev => prev + key.toUpperCase());
    }
  };

  const getLetterState = (letter: string, index: number, row: number) => {
    if (!start) {
      return 'bg-white/30 border-2 border-white/10';
    }
    if (row >= currentRow || letter === '') {
      return 'bg-black/50 border-2 border-white/10';
    }

    if (solution[index] === letter) {
      return 'bg-green-500 text-white';
    }

    if (solution.includes(letter)) {
      const indices = [...solution.split('')].reduce((acc, curr, i) => curr === letter ? [...acc, i] : acc, [] as number[]);
      const correctGuesses = indices.filter(i => guesses[row][i] === letter).length;
      const previousOccurrences = guesses[row].slice(0, index).split(letter).length - 1;
      if (previousOccurrences + correctGuesses < indices.length) {
        return 'bg-yellow-600 text-white';
      }
    }

    return 'bg-white/15 text-white';
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!start) return;
      if (gameOver) return;
      if (e.key === 'Enter') {
        if (currentGuess.length === WORD_LENGTH) {
          console.log("FDKJFKDJF")
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
      <KeyBoard guesses={guesses} word={solution} handleKeyPress={handleKeyPress} gameOver={gameOver} />
    </>
  );
}
