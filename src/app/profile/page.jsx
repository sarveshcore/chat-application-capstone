"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/config";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, updateProfile } from "firebase/auth";
import { FaUserCircle } from "react-icons/fa";

export default function Profile() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || "");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);

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

  const handleUpdateName = async () => {
    setUpdating(true);
    setUpdateError("");
    setUpdateSuccess(false);
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      setUpdateSuccess(true);
      // Optionally, reload the page or user state
    } catch (err) {
      setUpdateError(err.message);
    }
    setUpdating(false);
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
          {!editMode ? (
            <>
              <h1 className="text-2xl font-semibold mb-2">
                {user?.displayName || "User"}
              </h1>
              <button
                onClick={() => setEditMode(true)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-sm mb-2"
              >
                Change Username
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-gray-700 text-white rounded px-3 py-1 text-center mb-2"
                disabled={updating}
              />
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    setUpdating(true);
                    setUpdateError("");
                    setUpdateSuccess(false);
                    try {
                      await updateProfile(auth.currentUser, {
                        displayName: newName,
                      });
                      setUpdateSuccess(true);
                      setEditMode(false);
                    } catch (err) {
                      setUpdateError(err.message);
                    }
                    setUpdating(false);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  disabled={updating || newName === user?.displayName}
                >
                  {updating ? "Updating..." : "Save"}
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
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
