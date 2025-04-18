import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar, NavbarItem } from "./components/Navbar";
import { MapPin, Route } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex`}
      >
        <Navbar>
          <NavbarItem icon={<MapPin size={20}/>} text="Create Route" />
          <NavbarItem icon={<Route size={20}/>} text="View Routes"/>
        </Navbar>
        <main className="flex-1 h-screen overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
