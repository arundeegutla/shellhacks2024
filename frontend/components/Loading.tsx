"use client";
import { useEffect, useState } from "react";

const colors = ['bg-white/15', 'bg-yellow-500', 'bg-green-500',];

export default function Loading() {
  const [flippedStates, setFlippedStates] = useState(Array(4).fill({ isFlipped: false, colorIndex: 0 }));
  const [lastFlippedIndex, setLastFlippedIndex] = useState(-1);

  const getRandomColorIndex = (currentIndex: number) => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * colors.length);
    } while (newIndex === currentIndex);
    return newIndex;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      let indexToFlip;
      do {
        indexToFlip = Math.floor(Math.random() * 4);
      } while (indexToFlip === lastFlippedIndex);
      setLastFlippedIndex(indexToFlip);
      setFlippedStates(prevStates =>
        prevStates.map((state, idx) =>
          idx === indexToFlip
            ? { isFlipped: true, colorIndex: getRandomColorIndex(state.colorIndex) }
            : { isFlipped: false, colorIndex: (state.colorIndex + 0) % colors.length }
        )
      );
    }, 200);

    return () => clearInterval(interval);
  }, [lastFlippedIndex]);


  return (
    <div className="h-lvh w-full flex flex-row items-center justify-center">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className={`w-10 h-10 flex items-center justify-center rounded-sm text-3xl font-bold text-white animate-flip2 ${colors[flippedStates[index].colorIndex]}`}
          style={{ animationDelay: `${index * 0.1}s` }}
          role="cell"
        >
          {''}
        </div>
      ))}</div>
  );
}
