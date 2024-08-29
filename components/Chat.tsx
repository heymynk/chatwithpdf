"use client";

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2Icon, DownloadIcon, TrashIcon, Share2Icon } from "lucide-react"; 
import { useCollection } from "react-firebase-hooks/firestore";
import { useUser } from "@clerk/nextjs";
import { collection, doc, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import { askQuestion } from "@/actions/askQuestion";
import ChatMessage from "./ChatMessage";

export type Message = {
  id?: string;
  role: "human" | "ai" | "placeholder";
  message: string;
  createdAt: Date;
};

function Chat({ id }: { id: string }) {
  const { user } = useUser();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();
  const bottomOfChatRef = useRef<HTMLDivElement>(null);

  const [snapshot, loading, error] = useCollection(
    user &&
      query(
        collection(db, "users", user?.id, "files", id, "chat"),
        orderBy("createdAt")
      )
  );

  useEffect(() => {
    bottomOfChatRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (!snapshot) return;

    const lastMessage = messages.pop();
    if (lastMessage?.role === "ai" && lastMessage.message === "Thinking...") {
      return;
    }

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

  const handleOnSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const q = input;
    setInput(" ");

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

    startTransition(async () => {
      const { success, message } = await askQuestion(id, q);

      if (!success) {
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

  const handleDeleteConversation = () => {
    // Implement functionality to delete the conversation
  };

  const handleDownloadChat = () => {
    // Implement functionality to download the chat
    const chatData = messages
      .map((msg) => `${msg.role}: ${msg.message}`)
      .join("\n");
    const blob = new Blob([chatData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareChat = () => {
    // Implement functionality to share the chat
    const chatData = messages
      .map((msg) => `${msg.role}: ${msg.message}`)
      .join("\n");
    navigator.clipboard.writeText(chatData).then(() => {
      alert("Chat copied to clipboard");
    });
  };

  return (
    <div className="flex flex-col h-full overflow-scroll">
      {/* Actions Section */}
      <div className="flex justify-center sticky top-0 z-50 p-2 bg-white">
        <Button
          variant="outline"
          onClick={handleDeleteConversation}
          className="flex items-center space-x-2 mx-2"
        >
          <TrashIcon className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          onClick={handleDownloadChat}
          className="flex items-center space-x-2 mx-2"
        >
          <DownloadIcon className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          onClick={handleShareChat}
          className="flex items-center space-x-2 mx-2"
        >
          <Share2Icon className="h-5 w-5" />
        </Button>
      </div>

      {/* Chat contents */}
      <div className="flex-1 w-full">
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
        <Input
          placeholder="Ask a Question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
