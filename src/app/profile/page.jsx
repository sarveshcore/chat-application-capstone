"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/config";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { FaUserCircle } from "react-icons/fa";

export default function Profile() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  // Redirect to signup if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      router.push("/signup");
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
      router.push("/signup");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleBackToChat = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-900">
        <p className="text-white text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-900">
        <p className="text-red-500 text-lg">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8 font-sans">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
        <div className="flex flex-col items-center">
          <FaUserCircle size={80} className="text-gray-400 mb-4" />
          <h1 className="text-2xl font-semibold mb-2">
            {user?.displayName || "User"}
          </h1>
          <p className="text-gray-400 mb-6">{user?.email || "No email"}</p>
          <div className="w-full flex flex-col space-y-4">
            <button
              onClick={handleBackToChat}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition duration-200 transform hover:scale-105"
            >
              Back to Chat
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-md transition duration-200 transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
