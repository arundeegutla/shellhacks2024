"use client";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Room() {
    const router = useRouter();
    const searchParams = useSearchParams()
    const roomId = searchParams.get('id');

  useEffect(() => {
    if (!roomId) {
      router.push('/');
    }
  }, [roomId, router]);

  if (!roomId) {
    return (
      <div>
        <p>Room ID is missing, redirecting...</p>
        <Link href="/" className="text-blue-500 underline">Go to Home</Link>
      </div>
    );
  }

  return (
    <div className="m-auto">
      Your Room ID is: <span className="font-bold">{roomId}</span>
    </div>
  );
}
