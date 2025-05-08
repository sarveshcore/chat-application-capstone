"use client";
import React, { useEffect, useState } from "react";
import {
  useSignInWithEmailAndPassword,
  useAuthState,
} from "react-firebase-hooks/auth";
import { auth } from "../../firebase/config";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInWithEmailAndPassword, userCredential, loading, error] =
    useSignInWithEmailAndPassword(auth);
  const router = useRouter();
  const [user] = useAuthState(auth);
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(email, password);
      setEmail("");
      setPassword("");
    } catch (e) {
      console.log(e);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google sign-in result:", result);
      router.push("/");
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };
  <div className="p-8 flex justify-center align-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-semibold text-white text-center mb-6">
          Welcome Back
        </h2>
        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white font-semibold"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-gray-700 font-semibold shadow-sm hover:shadow-md transition border border-gray-300"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 533.5 544.3"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M533.5 278.4c0-17.7-1.4-35.1-4.1-51.9H272v98.4h146.9c-6.3 34.5-25.5 63.7-54.6 83.1v68h88c51.4-47.3 81.2-117 81.2-197.6z"
                fill="#4285F4"
              />
              <path
                d="M272 544.3c73.5 0 135-24.4 180-66.5l-88-68c-24.4 16.3-55.5 25.9-92 25.9-70.7 0-130.6-47.7-152.1-111.9H29.4v70.3c45.1 89.5 137.6 150.2 242.6 150.2z"
                fill="#34A853"
              />
              <path
                d="M119.9 323.8c-10.2-30.2-10.2-62.9 0-93.1V160.4H29.4c-39.7 78.8-39.7 171.1 0 249.9l90.5-70.3z"
                fill="#FBBC05"
              />
              <path
                d="M272 107.2c39.9 0 75.9 13.7 104.2 40.5l78.1-78.1C407 24.4 345.5 0 272 0 167 0 74.5 60.7 29.4 150.2l90.5 70.3C141.4 154.9 201.3 107.2 272 107.2z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>
        </div>

        <p className="text-sm text-gray-400 text-center mt-6">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-400 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
