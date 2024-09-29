const KEYBOARD = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

export default function KeyBoard({
  handleKeyPress, gameOver
}: {
  handleKeyPress: (key: string) => void;
  gameOver: boolean;
}) {
  return <div className="mb-4">
    {KEYBOARD.map((row, rowIndex) => (
      <div key={rowIndex} className="flex justify-center gap-1 my-1">
        {row.map(key => (
          <button
            key={key}
            onClick={() => handleKeyPress(key)}
            className={`hover:cursor-pointer px-2 py-4 text-sm font-bold rounded-md bg-white/10 ${key.length > 1 ? 'w-16' : 'w-10'}`}
            disabled={gameOver}
          >
            {key === 'BACKSPACE' ? '←' : key}
          </button>
        ))}
      </div>
    ))}
  </div>;
}