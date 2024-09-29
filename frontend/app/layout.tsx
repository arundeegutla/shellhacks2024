import type { Metadata } from "next";
import { Poppins } from 'next/font/google';

import "./globals.css";
import { Suspense } from "react";
import NavBar from "@/components/NavBar";

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});


export const metadata: Metadata = {
  title: 'Wordle 2.0👋',
  description: 'Wordle with friends',
  keywords:
    'Worldle, multiplayer, fun, game, projects',
  authors: [{ name: 'Arun Deegutla', url: 'https://arundeegutla.me/' }, { name: 'Sachin Sivakumar' }, { name: 'Chris Gittings' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Wordle 2.0',
    description: 'Wordle with friends',
  },
  robots: 'index, follow',
  icons: {
    icon: '/favicons/favicon.ico',
    shortcut: '/favicons/apple-touch-icon.png',
    apple: '/favicons/apple-touch-icon.png',
  },
  manifest: '/favicons/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className}`}>
        <NavBar />
        <Suspense>
          <main className="relative flex w-full flex-col items-center justify-center">
            {children}
          </main>
        </Suspense>
      </body>
    </html>
  );
}
