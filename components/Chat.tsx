"use client";

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2Icon } from "lucide-react";
import { useCollection } from "react-firebase-hooks/firestore"; // Firebase hook to listen to a Firestore collection
import { useUser } from "@clerk/nextjs"; // Hook to get the current user
import { collection, doc, orderBy, query } from "firebase/firestore"; // Firestore methods for querying the database
import { db } from "@/firebase"; // Firebase configuration and initialization
import { askQuestion } from "@/actions/askQuestion";
import ChatMessage from "./ChatMessage";
// Message sender
export type Message = {
  id?: string;
  role: "human" | "ai" | "placeholder";
  message: string;
  createdAt: Date;
};

function Chat({ id }: { id: string }) {
  const { user } = useUser(); 

  const [input, setInput] = useState(""); // State to manage the input value
  const [messages, setMessages] = useState<Message[]>([]); // State to store chat messages
  const [isPending, startTransition] = useTransition(); // State to manage UI transitions
  const bottomOfChatRef = useRef<HTMLDivElement>(null);

  // Firestore query to get chat messages for the current user and document
  const [snapshot, loading, error] = useCollection(
    user &&
      query(
        collection(db, "users", user?.id, "files", id, "chat"),
        orderBy("createdAt")
      )
  );

  //useEffect for the smooth scroll functionality

  useEffect(() => {
    bottomOfChatRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Update the messages state when the Firestore snapshot changes
  useEffect(() => {
    if (!snapshot) return;

    console.log("Updated snapshot", snapshot.docs);

    // Clone the existing messages array to avoid mutating the state directly
    // const currentMessages = [...messages];

    // Get the last message to check if the AI is thinking
    const lastMessage = messages.pop();
    if (lastMessage?.role === "ai" && lastMessage.message === "Thinking...") {
      // return as this is a dummy placeholder message
      return;
    }

    // Mapping Firestore documents to Message objects
    const newMessages: Message[] = snapshot.docs.map((doc) => {
      const { role, message, createdAt } = doc.data();

      return {
        id: doc.id,
        role,
        message,
        createdAt: createdAt.toDate(),
      };
    });

    setMessages(newMessages);
  }, [snapshot]);

  // Handle form submission when a user asks a question
  const handleOnSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const q = input;
    setInput(" ");

    // Optimistic UI Update: Add user's question and a placeholder for the AI response
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: `${Date.now()}`,
        role: "human",
        message: q,
        createdAt: new Date(),
      },
      {
        role: "ai",
        message: "Thinking...",
        createdAt: new Date(),
      },
    ]);

    // Transition to handle the question-answer process asynchronously
    startTransition(async () => {
      const { success, message } = await askQuestion(id, q);

      if (!success) {
        // If there is an error, update the last AI message with the error message
        setMessages((prev) =>
          prev.slice(0, prev.length - 1).concat([
            {
              role: "ai",
              message: `whoops.... ${message}`,
              createdAt: new Date(),
            },
          ])
        );
      }
    });
  };

  return (
    <div className="flex flex-col h-full overflow-scroll">
      {/* Chat contents */}
      <div className="flex-1 w-full">
        {/* Chat Messages */}
        {loading ? (
          <div className="flex items-center justify-center">
            <Loader2Icon className="animate-spin h-20 w-20 text-purple-600 mt-20" />
          </div>
        ) : (
          <div className="p-5">
            {messages.length === 0 && (
              <ChatMessage
                key="placeholder"
                message={{
                  role: "ai",
                  message: "Ask me anything about the document",
                  createdAt: new Date(),
                }}
              />
            )}

            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            <div ref={bottomOfChatRef} />
          </div>
        )}
      </div>

      {/* Form for asking questions */}
      <form
        onSubmit={handleOnSubmit}
        className="flex items-center justify-between p-2 space-x-2 bg-purple-700/80 backdrop-blur-lg border-t border-purple-600 shadow-md sticky bottom-0"
      >
        {/* Input field for user's question */}
        <Input
          placeholder="Ask a Question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow px-4 py-2 bg-white/90 rounded-full border text-purple-800 focus:outline-none"
        />

        {/* Submit button to send the question */}
        <Button
          type="submit"
          disabled={!input || isPending}
          className={`px-4 py-2 rounded-full font-semibold text-white transition-colors ${
            isPending
              ? "bg-purple-500 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {isPending ? (
            <Loader2Icon className="animate-spin text-white" />
          ) : (
            "Ask"
          )}
        </Button>
      </form>
    </div>
  );
}

export default Chat;
