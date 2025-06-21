"use client";
import Image from "next/image";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/config";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { signOut } from "firebase/auth";

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const storedMessages = localStorage.getItem("chatMessages");
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Redirect to signup if not authenticated
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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const message = {
      id: Date.now(),
      text: newMessage,
      user: user?.displayName || "User",
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">Loading...</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start p-4 font-sans w-full">
      {/* Header with Logout */}
      <div className="w-full max-w-3xl flex justify-end mb-6">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow-md transition duration-200"
        >
          Logout
        </button>
      </div>

      {/* Chat Container */}
      <div className="w-full max-w-3xl h-[90vh] bg-gray-800 rounded-xl shadow-2xl flex flex-col border border-gray-700">
        <div className="p-5 border-b border-gray-700 bg-gray-700 rounded-t-xl">
          <h1 className="text-xl font-semibold">
            Welcome, {user?.displayName || "User"}!
          </h1>
        </div>

        {/* Chat Window */}
        <div
          ref={chatContainerRef}
          className="flex-grow p-5 overflow-y-auto bg-gray-800"
        >
          {messages.length === 0 ? (
            <p className="text-gray-400 text-center">No messages yet.</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className="mb-4 p-3 bg-blue-700 rounded-lg max-w-[70%] self-end shadow-md"
              >
                <p className="text-white">{message.text}</p>
                <p className="text-xs text-blue-200 text-right">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-5 border-t border-gray-700 bg-gray-700 rounded-b-xl"
        >
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow p-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition duration-200"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
