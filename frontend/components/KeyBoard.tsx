const KEYBOARD = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

export default function KeyBoard({
  handleKeyPress,
  gameOver,
  word,
  guesses
}: {
  handleKeyPress: (key: string) => void;
  gameOver: boolean;
  word: string;
  guesses: string[]
}) {


  const getKeyStatus = (letter: string): 'correct' | 'present' | 'absent' | 'unused' => {
    if (!word) return 'unused';

    // Find all indices of the letter in the word
    const indices = [...word.split('')].reduce((acc, curr, i) =>
      curr === letter ? [...acc, i] : acc, [] as number[]);



    console.log(letter, indices)
    for (const guess of guesses) {
      if (indices.some(index => guess[index] === letter)) {
        return 'correct';
      }
    }

    for (const guess of guesses) {
      if (guess.includes(letter) && word.includes(letter)) {
        return 'present';
      }
    }

    for (const guess of guesses) {
      if (guess.includes(letter)) {
        return 'absent';
      }
    }




    // If we've gone through all guesses and haven't returned, the letter is unused
    return 'unused';
  };

  const getKeyClass = (status: 'correct' | 'present' | 'absent' | 'unused'): string => {
    switch (status) {
      case 'correct':
        return 'bg-green-500 text-white';
      case 'present':
        return 'bg-yellow-600 text-white';
      case 'absent':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-white/10';
    }
  };

  return (
    <div className="mb-4">
      {KEYBOARD.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1 my-1">
          {row.map(key => {
            const status = getKeyStatus(key);
            return (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`hover:cursor-pointer px-2 py-4 text-sm font-bold rounded-md ${getKeyClass(status)} ${key.length > 1 ? 'w-16' : 'w-10'}`}
                disabled={gameOver}
              >
                {key === 'BACKSPACE' ? '←' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}