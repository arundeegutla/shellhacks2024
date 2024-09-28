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

export default function KeyBoard({
  guesses, isVisible, ansKey
}: {
  guesses: string[];
  isVisible: boolean;
  ansKey: number[][];
}) {
  return <div className="grid grid-rows-6 gap-1 mb-4" role="grid" aria-label="Wordle game board">
    {guesses.map((guess, rowIndex) => (
      <div key={rowIndex} className="flex gap-1" role="row">
        {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => (
          <div
            key={colIndex}
            className={`w-14 h-14 flex items-center justify-center rounded-sm text-3xl font-bold ${getLetterState(colIndex, rowIndex, ansKey)}`}
            role="cell"
          >
            {isVisible ? guess[colIndex] : ''}
          </div>
        ))}
      </div>
    ))}
  </div>;
}