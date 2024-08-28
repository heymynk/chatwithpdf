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
        className="flex sticky bottom-0 space-x-2 bg-purple-600/75"
      >
        <Input
          placeholder="Ask a Question..."
          value={input}
          onChange={(e) => setinput(e.target.value)}
          className=""
        />

        <Button type="submit" disabled={!input || isPending}>
          {isPending ? (
            <Loader2Icon className="animate-spin text-purple-600" />
          ) : (
            "Ask"
          )}
        </Button>
      </form>
    </div>
  );
}

export default Chat;
