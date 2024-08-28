"use client";

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";

import { Button } from "./ui/button";

import { Input } from "./ui/input";
// import {askQuestion, Message} from "@/actions/askQuestion";
import { Loader2Icon } from "lucide-react";
// import ChatMessage from "./ChatMessage";
// import {useCollection} from "react-firebase-hooks/firebase";

import { useUser } from "@clerk/nextjs";
import { collection, orderBy, query } from "firebase/firestore";

import { db } from "@/firebase";
import { isPromise } from "util/types";

export type Message = {
  id?: string;
  role: "human" | "ai" | "placeholder";
  message: string;
  createdAt: Date;
};

function Chat({ id }: { id: string }) {
  const [input, setinput] = useState("");
  const [message, setmessage] = useState<Message[]>([]);
  const [isPending, setisPending] = useTransition();

  const handleOnSubmit = async (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col h-full overflow-scroll">
      {/* chat contents */}
      <div className="flex-1 w-full">{/* chat messages */}</div>

      <form
        onSubmit={handleOnSubmit}
        className="flex items-center justify-between p-2 space-x-2 bg-purple-700/80 backdrop-blur-lg border-t border-purple-600 shadow-md sticky bottom-0"
      >
        <Input
          placeholder="Ask a Question..."
          value={input}
          onChange={(e) => setinput(e.target.value)}
          className="flex-grow px-4 py-2 bg-white/90 rounded-full border text-purple-800 focus:outline-none"
        />

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
