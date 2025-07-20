"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase/config";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { FiSearch, FiX } from "react-icons/fi"; // Added FiX for close button
import { FaUserCircle } from "react-icons/fa"; // Added for profile icon

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Load messages from Firestore chatroom and auto-clear at 30 messages
  useEffect(() => {
    if (user) {
      const chatroomRef = collection(db, "chatroom");
      const q = query(chatroomRef, orderBy("timestamp", "asc"));

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const chatMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(chatMessages);

        // Auto-clear if message count reaches 30
        if (chatMessages.length >= 30) {
          try {
            const querySnapshot = await getDocs(chatroomRef);
            const deletePromises = querySnapshot.docs.map((doc) =>
              deleteDoc(doc.ref)
            );
            await Promise.all(deletePromises);
            setMessages([]);
          } catch (error) {
            console.error("Error auto-clearing chat:", error);
          }
        }

        // Scroll to the latest message with smooth animation
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
              top: chatContainerRef.current.scrollHeight,
              behavior: "smooth",
            });
          }
        }, 100);
      });

      return () => unsubscribe();
    }
  }, [user]);

  // Redirect to signup if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      router.push("/signup");
    }
  }, [loading, user]);

  // Focus search input when search bar opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close search bar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;
    try {
      await signOut(auth);
      console.log("User signed out");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !user) return;

    if (inputRef.current) {
      inputRef.current.classList.add("send-animation");
      setTimeout(() => {
        inputRef.current.classList.remove("send-animation");
        inputRef.current.focus();
      }, 400);
    }

    const messageToSend = newMessage;
    setNewMessage("");

    const chatroomRef = collection(db, "chatroom");

    try {
      await addDoc(chatroomRef, {
        text: messageToSend,
        timestamp: new Date().toISOString(),
        user: user.displayName || "User",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setNewMessage(messageToSend);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchQuery("");
    }
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  const filteredMessages = messages.filter((message) =>
    message.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-900">
        <p className="text-white text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-blue-800 text-white flex flex-col items-center justify-start p-0 font-sans w-full">
      {/* Header */}
      <header className="w-full max-w-3xl flex items-center justify-between px-6 py-4 mb-6 bg-white/10 backdrop-blur-md rounded-b-2xl shadow-lg border-b border-gray-700">
        <button
          onClick={handleProfileClick}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md transition duration-200 transform hover:scale-110"
          aria-label="View profile"
        >
          <FaUserCircle size={32} />
        </button>
        <h1 className="text-2xl font-bold tracking-tight drop-shadow">
          ChatSphere
        </h1>
        <div className="flex items-center space-x-2">
          <div ref={searchContainerRef} className="relative flex items-center">
            <div
              className={`flex items-center transition-all duration-300 ease-in-out ${
                isSearchOpen ? "w-64 opacity-100" : "w-0 opacity-0"
              } overflow-hidden`}
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full p-2 pr-8 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 text-gray-500 hover:text-gray-700"
                  aria-label="Clear search"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
            <button
              onClick={toggleSearch}
              className="ml-2 bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg shadow-md transition duration-200 transform hover:scale-110"
              aria-label={isSearchOpen ? "Close search" : "Open search"}
            >
              <FiSearch size={20} />
            </button>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow-md transition duration-200"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Chat Container */}
      <main className="w-full max-w-3xl h-[100vh] bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col border border-gray-700 transition-all duration-300">
        <div className="p-6 border-b border-gray-700 bg-gray-700/80 rounded-t-2xl">
          <h2 className="text-xl font-semibold tracking-tight">
            Welcome, {user?.displayName || "User"}!
          </h2>
        </div>

        {/* Chat Window - Make it scrollable */}
        <div
          ref={chatContainerRef}
          className="flex-grow p-6 overflow-y-auto bg-transparent scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
        >
          <div className="mt-4">
            {filteredMessages.length === 0 ? (
              <p className="text-gray-400 text-center text-lg animate-fade-in">
                {searchQuery
                  ? "No messages match your search."
                  : "No messages yet."}
              </p>
            ) : (
              filteredMessages.map((message) => {
                const isOwn = message.user === user?.displayName;
                return (
                  <div
                    key={message.id}
                    className={`
                mb-6 p-4 rounded-2xl shadow-md animate-slide-in transition-all duration-300
                ${
                  isOwn
                    ? "bg-blue-600 ml-auto text-right"
                    : "bg-gray-700 mr-auto text-left"
                }
                hover:scale-[1.02] w-fit max-w-[70%] break-words
              `}
                    style={{ clear: "both" }}
                  >
                    <p className="text-white text-base break-words">
                      {message.text}
                    </p>
                    <p className="text-xs text-blue-200 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString()} -{" "}
                      {message.user}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-6 border-t border-gray-700 bg-gray-700/80 rounded-b-2xl"
        >
          <div className="flex items-center space-x-4">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow p-3 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white transition-all duration-300 ease-in-out send-animation"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow-md transition duration-200 transform hover:scale-110 flex items-center gap-2"
            >
              <span>Send</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </form>
      </main>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Are you sure you want to log out?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={async () => {
                  setShowLogoutModal(false);
                  try {
                    await signOut(auth);
                    console.log("User signed out");
                  } catch (err) {
                    console.error("Error signing out:", err);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow-md transition duration-200"
              >
                Yes
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md shadow-md transition duration-200"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline CSS for Animations and Scrollbar */}
      <style jsx>{`
        .send-animation {
          transform: scale(0.95);
          transition: transform 0.3s ease;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #4b5563;
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background-color: #1f2937;
        }
      `}</style>
    </div>
  );
}
