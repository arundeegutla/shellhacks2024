import { FaCheckCircle } from "react-icons/fa";
import { FaSquareCheck } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

export default function Mini({
  name, guesses, word, is_done
}: {
  name: string;
  guesses: string[];
  word: string;
  is_done: boolean
}) {

  const getLetterState = (letter: string, index: number, row: number) => {
    if (letter === '') {
      return 'bg-black/50 border-2 border-white/10';
    }

    if (word[index] === letter) {
      return 'bg-green-500 text-white';
    }

    if (word.includes(letter)) {
      const indices = [...word.split('')].reduce((acc, curr, i) => curr === letter ? [...acc, i] : acc, [] as number[]);
      const correctGuesses = indices.filter(i => guesses[row][i] === letter).length;
      const previousOccurrences = guesses[row].slice(0, index).split(letter).length - 1;
      if (previousOccurrences + correctGuesses < indices.length) {
        return 'bg-yellow-600 text-white';
      }
    }

    return 'bg-white/15 text-white';
  };

  const overlay = () => {

    let AC = guesses.some(str => str === word);
    if (AC) {
      return <div className="absolute top-0 w-full h-full flex flex-row items-center justify-center  text-green-800 border-2 border-green-600/50 rounded-sm backdrop-brightness-[.3]">
        {/* <div className="absolute w-full h-full flex flex-row items-center justify-center bg-green-400/15 text-green-800 blur-3xl"></div> */}
        <FaCheckCircle className={`text-green-500 text-xl`} />
      </div>
    }
    if (is_done) {
      return <div className="absolute top-0 w-full h-full flex flex-row items-center justify-center  text-red-200/90 border-2 border-red-600/50 rounded-sm backdrop-brightness-[.3]">
        {/* <div className="absolute w-full h-full flex flex-row items-center justify-center bg-green-400/15 text-green-800 blur-3xl"></div> */}
        <MdCancel className={`text-red-500 text-2xl`} />
      </div>
    }

  };


  return (<div className="">
    <h2>{name}</h2>
    <div className="relative grid grid-rows-6 gap-1 mb-4 w-fit" role="grid" aria-label="Wordle game board">
      {guesses.map((guess, rowIndex) => (
        <div key={rowIndex} className="flex gap-1" role="row">
          {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={`w-5 h-5 flex items-center justify-center rounded-sm text-sm font-bold ${getLetterState(colIndex < guess.length ? guess[colIndex] : '', colIndex, rowIndex)}`}
              role="cell"
            >
            </div>
          ))}
        </div>
      ))}
      {overlay()}
    </div>
  </div>);
}