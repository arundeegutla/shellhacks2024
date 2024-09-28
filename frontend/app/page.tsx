'use client';
import { helloWorld } from "@/lib/firebase";
import { Button, IconButton } from "@mui/material";
import Link from "next/link";

export default function Home() {
  return (
    <div className="landing">
      <div style={{ gap: "1rem", display: "flex", flexDirection: "column" }}>
        <Link href="/room/create" passHref>
          <Button variant="contained">Create a Room</Button>
        </Link>
        <Link href="/room/join" passHref>
          <Button variant="contained">Join a Room</Button>
        </Link>
      </div>
    </div>
  );
}
