'use client';

import { NAME } from "@/lib/util";
import Link from "next/link";
import { useState, useEffect } from "react";

const colors = ['bg-yellow-500', 'bg-green-500', 'bg-gray-500'];

export default function Home() {
  const [flippedStates, setFlippedStates] = useState(Array(NAME.length).fill({ isFlipped: false, colorIndex: 0 }));
  const [lastFlippedIndex, setLastFlippedIndex] = useState(-1);

  useEffect(() => {
    const interval = setInterval(() => {
      let indexToFlip;
      do {
        indexToFlip = Math.floor(Math.random() * 8);
      } while (indexToFlip === lastFlippedIndex);
      setLastFlippedIndex(indexToFlip);
      setFlippedStates(prevStates =>
        prevStates.map((state, idx) =>
          idx === indexToFlip
            ? { isFlipped: true, colorIndex: (state.colorIndex + (Math.floor(Math.random() * colors.length))) % colors.length }
            : { isFlipped: false, colorIndex: (state.colorIndex + 0) % colors.length }
        )
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [lastFlippedIndex]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      {/* Wordle-style Logo */}
      <div className="flex space-x-1 mb-8">
        {/* Each letter in the word IMPOSTLE */}
        {NAME.split("").map((letter, idx) => (
          <div key={idx} className="relative w-20 h-20 max-md:w-10 max-md:h-10">
            <div className={`absolute w-full h-full transition-all duration-500 ${colors[flippedStates[idx].colorIndex]} rounded-md ${flippedStates[idx].isFlipped ? 'animate-flip' : ''}`} />
            <div className="absolute w-full h-full flex items-center justify-center">
              <span className="text-white text-3xl max-md:text-sm font-bold">{letter.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex space-x-4">
        <Link href="/room/create" passHref>
          <button className="px-6 py-2 bg-blue-500/30 border-2 border-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-600 transition-colors">
            Create a Room
          </button>
        </Link>
        <Link href="/room/join" passHref>
          <button className="px-6 py-2 bg-green-500/30 border-2 border-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transition-colors">
            Join a Room
          </button>
        </Link>
      </div>
    </div>
  );
}