import { GiTrophyCup } from "react-icons/gi";

export type Player = {
  score: number;
  name: string;
  isHost: boolean;
}

export default function Leaderboard({ players }: { players: Player[] }) {

  players.sort((a, b) => b.score - a.score);

  return (
    <ul className="rounded-xl bg-zinc-800 overflow-hidden w-fit">
      {players.map((profile, idx) => (
        <li key={idx} className={`py-3 px-2 ${idx % 2 == 0 ? 'bg-black/30' : 'bg-white/5'}`}>
          <div className="flex items-center space-x-4">
            <div style={{ width: "20px" }} className="flex-shrink-0">
              <div className="text-lg font-medium text-gray-300">
                {idx + 1}.
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-medium text-gray-300 truncate">
                {profile.name}
              </div>
            </div>
            <div className='flex flex-row items-center text-amber-500 my-blur transparent-dark rounded-md px-3 py-1 text-base font-medium'>
              <div style={{ fontSize: "20px" }}><GiTrophyCup /></div>
              <h3 className='m-1'>{profile.score}</h3>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}