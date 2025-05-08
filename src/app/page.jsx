"use client";
import Image from "next/image";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/config";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signOut } from "firebase/auth";

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading) {
      router.push("/signup");
    }
  }, [loading, user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">Loading...</div>
    );
  }

  return (
    <div className="relative grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Logout Button in Top-Right */}
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
      >
        Logout
      </button>

      {/* Your main content goes here */}
      <h1 className="text-2xl font-bold">
        Welcome, {user?.displayName || "User"}!
      </h1>
    </div>
  );
}
