'use client';
import { NAME } from '@/lib/util';
import { usePathname } from 'next/navigation';

export default function NavBar() {

  const pathname = usePathname(); // Get the current pathname
  if (pathname === '/') {
    return null;
  }

  return (
    <div
      className={`flex w-full justify-center backdrop-blur-xl transition-all`}>
      <div className="mx-5 flex h-16 w-full max-w-screen-xl flex-row items-center justify-center">
        <div className="flex space-x-1">
          {NAME.split("").map((letter, idx) => (
            <div key={idx} className="relative w-10 h-10 max-md:w-10 max-md:h-10">
              <div className={`absolute w-full h-full transition-all bg-zinc-900 rounded-md`} />
              <div className="absolute w-full h-full flex items-center justify-center">
                <span className="text-white/80 text-sm max-md:text-sm">{letter.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
