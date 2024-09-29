import { FaCheckCircle } from "react-icons/fa";
import { FaSquareCheck } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

const getLetterState = (index: number, row: number, ansKey: number[][]) => {
  // BLANK
  if (ansKey[row][index] === 0) return 'bg-black/50 border-2 border-white/10';
  // GREEN
  if (ansKey[row][index] === 3) return 'bg-green-500 text-white';
  // YELLOW
  if (ansKey[row][index] === 2) return 'bg-yellow-500 text-white';
  // DARK
  return 'bg-white/15 text-white';
};

export default function Mini({
  name, guesses, ansKey, timeLeft
}: {
  name: string;
  guesses: string[];
  ansKey: number[][];
  timeLeft: number;
}) {

  const overlay = () => {

    let AC = ansKey.some(row => row.every(num => num === 3));
    if (AC) {
      return <div className="absolute top-0 w-full h-full flex flex-row items-center justify-center  text-green-800 border-2 border-green-600/50 rounded-sm backdrop-brightness-[.3]">
        {/* <div className="absolute w-full h-full flex flex-row items-center justify-center bg-green-400/15 text-green-800 blur-3xl"></div> */}
        <FaCheckCircle className={`text-green-500 text-xl`} />
      </div>
    }
    if (timeLeft == 0) {
      return <div className="absolute top-0 w-full h-full flex flex-row items-center justify-center  text-red-200/90 border-2 border-red-600/50 rounded-sm backdrop-brightness-[.3]">
        {/* <div className="absolute w-full h-full flex flex-row items-center justify-center bg-green-400/15 text-green-800 blur-3xl"></div> */}
        <MdCancel className={`text-red-500 text-2xl`} />
      </div>
    }

  };


  return (<div className="">
    <h2>{name}</h2>
    <div className="relative grid grid-rows-6 gap-1 mb-4 w-fit" role="grid" aria-label="Wordle game board">
      {ansKey.map((guess, rowIndex) => (
        <div key={rowIndex} className="flex gap-1" role="row">
          {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={`w-5 h-5 flex items-center justify-center rounded-sm text-sm font-bold ${getLetterState(colIndex, rowIndex, ansKey)}`}
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