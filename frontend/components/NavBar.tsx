'use client';
import { NAME } from '@/lib/util';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaGithub } from 'react-icons/fa6';

export default function NavBar() {

  const pathname = usePathname(); // Get the current pathname
  if (pathname === '/') {
    return null;
  }

  return (
    <div
      className={`flex relative w-full justify-center backdrop-blur-xl transition-all`}>
      <div className="mx-5  flex h-16 w-full max-w-screen-xl flex-row items-center justify-center">
        <Link href='/'>
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
        </Link>
      </div>
      <Link
        href={'https://github.com/arundeegutla/shellhacks2024'}
        target="_blank"
        className="absolute right-4 top-4 m-auto h-fit rounded-full bg-slate-900 border-2 hover:bg-gray-700 hover:text-white text-2xl p-2 hover:p-3 transition-all ease-in-out duration-300 hover:cursor-pointer">
        <FaGithub />
      </Link>
    </div>
  );
}
