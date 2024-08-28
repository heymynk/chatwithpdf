"use client"; 

import { FormEvent, useEffect, useState, useTransition } from "react";
import { Button } from "./ui/button"; 
import { Input } from "./ui/input"; 
import { Loader2Icon } from "lucide-react"; 
import { useCollection } from "react-firebase-hooks/firestore"; // Firebase hook to listen to a Firestore collection
import { useUser } from "@clerk/nextjs"; // Hook to get the current user
import { collection, orderBy, query } from "firebase/firestore"; // Firestore methods for querying the database
import { db } from "@/firebase"; // Firebase configuration and initialization
import { askQuestion } from "@/actions/askQuestion"; 


// Message sender 
export type Message = {
  id?: string; 
  role: "human" | "ai" | "placeholder"; 
  message: string; 
  createdAt: Date; 
};

function Chat({ id }: { id: string }) {
  const { user } = useUser(); // Get the current user

  const [input, setInput] = useState(""); // State to manage the input value
  const [messages, setMessages] = useState<Message[]>([]); // State to store chat messages
  const [isPending, startTransition] = useTransition(); // State to manage UI transitions

  // Firestore query to get chat messages for the current user and document
  const [snapshot, loading, error] = useCollection(
    user &&
      query(
        collection(db, "users", user?.id, "files", id, "chat"),
        orderBy("createdAt")
      )
  );

  // Update the messages state when the Firestore snapshot changes
  useEffect(() => {
    if (!snapshot) return;

    console.log("Updated snapshot", snapshot.docs);

    // Mapping Firestore documents to Message objects
    const newMessages: Message[] = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Message)
    );

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
        message: "Thinking....",
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
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 ${
              msg.role === "human" ? "text-right" : "text-left"
            }`}
          >
            {msg.message}
          </div>
        ))}
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
