"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/config";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, updateProfile } from "firebase/auth";

export default function Profile() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || "");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);

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
      setEditMode(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-blue-800 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700 flex flex-col items-center">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              className="w-20 h-20 rounded-full object-cover mb-2 border-4 border-blue-600"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mb-2">
              <span className="text-4xl font-bold text-white">
                {user?.displayName?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
          )}
          {!editMode ? (
            <>
              <h1 className="text-2xl font-semibold mb-1">
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
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !updating &&
                    newName !== user?.displayName
                  ) {
                    handleUpdateName();
                  }
                }}
                className="bg-gray-700 text-white rounded px-3 py-1 text-center mb-2"
                disabled={updating}
              />
              <div className="flex gap-2 mb-2">
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
                  onClick={() => {
                    setEditMode(false);
                    setNewName(user?.displayName || "");
                    setUpdateError("");
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
          {updateSuccess && (
            <p className="text-green-400 mb-2">Name updated!</p>
          )}
          {updateError && <p className="text-red-400 mb-2">{updateError}</p>}
        </div>

        {/* Divider */}
        <div className="w-full border-t border-gray-600 my-4"></div>

        {/* User Info */}
        <div className="w-full flex flex-col items-center mb-6">
          <p className="text-gray-400 mb-1">
            <span className="font-semibold text-white">Email:</span>{" "}
            {user?.email || "No email"}
          </p>
          {user?.metadata?.creationTime && (
            <p className="text-gray-400 mb-1">
              <span className="font-semibold text-white">Joined:</span>{" "}
              {new Date(user.metadata.creationTime).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col space-y-3">
          <button
            onClick={handleBackToChat}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md transition duration-200 text-base w-auto"
          >
            Back to Chat
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow-md transition duration-200 text-base w-auto"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
