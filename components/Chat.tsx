"use client";

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Loader2Icon,
  DownloadIcon,
  Trash2Icon,
  Share2Icon,
  LoaderIcon,
} from "lucide-react";
import { useCollection } from "react-firebase-hooks/firestore";
import { useUser } from "@clerk/nextjs";
import { collection, doc, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase";
import { askQuestion } from "@/actions/askQuestion";
import ChatMessage from "./ChatMessage";
import { deleteChat } from "@/actions/deleteChat";
import { IoSend } from "react-icons/io5";

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
  const [isAsking, setIsAsking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setIsAsking(true);
    const q = input;
    setInput("");

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

    try {
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
    } catch (error) {
      console.error("Error while asking question:", error);
    } finally {
      setIsAsking(false);
    }
  };

  const handleDeleteConversation = async () => {
    setIsDeleting(true);
    try {
      const userId = user?.id?.toString() ?? "";
      await deleteChat(id?.toString() ?? "", userId);
      console.log("Chat deleted successfully");
    } catch (error) {
      console.error("Failed to delete chat:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadChat = () => {
    const loggedInUserName = user?.firstName || "Guest";

    // Convert messages to HTML format
    const chatData = messages
      .map((msg) => {
        const role = msg.role === "human" ? loggedInUserName : " ";
        const messageClass = msg.role === "human" ? "sent" : "received"; 
        return `<div class="chat-message ${messageClass}"><strong>${role}:</strong> ${msg.message}</div>`;
      })
      .join("\n");

    console.log("This is chat data", chatData);

    // Wrap the chat data in basic HTML structure
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chat Conversation</title>
      <style>
        body {
          height: 100vh;
          margin: 0;
          background-color: #edf2f7; 
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .chat-container {
          word-break: break-word;
          white-space: pre-line;

          width: 70rem; 
          max-height: 90vh; 
          overflow-y: auto; 
          padding: 1rem 1rem 2rem; 
          background-color: #ffffff; 
          border-radius: 0.375rem; 
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); 
        }
        .chat-message {
          line-height: 1.5em; 
          margin-bottom: 1rem; 
          padding: 1rem; 
          border-radius: 0.375rem; 
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); 
          color: #805ad5; 
        }
        .chat-message.sent {
          background-color: #9333EAFF; 
          color: #ffffff; 
          display: inline-block;
        }
        .chat-message.received {
          background-color: #edf2f7; 
          color: #2d3748; 
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="chat-container">
        <div class="chat-messages">
          ${chatData} 
        </div>
      </div>
    </body>
    </html>
    `;

    // Create a Blob from the HTML content
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat.html";
    a.click();

    // Clean up by revoking the object URL
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
          {isDeleting ? (
            <LoaderIcon className="h-6 w-6 animate-spin text-gray-500" />
          ) : (
            <Trash2Icon className="h-6 w-6 text-red-500" />
          )}
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
        className="flex items-center justify-between p-2 space-x-4 bg-purple-700/80 backdrop-blur-lg sticky bottom-0"
      >
        <Input
          placeholder="Ask a Question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow px-6 ml-2 py-2 bg-white/90 rounded-md text-purple-800 focus:outline-none"
        />

        <Button
          type="submit"
          disabled={!input || isAsking}
          className={`px-4 py-2 font-semibold text-white transition-colors ${
            isAsking
              ? "bg-purple-500 cursor-not-allowed"
              : "bg-gray-800 hover:bg-white hover:text-black"
          }`}
        >
          {isAsking ? (
            <Loader2Icon className="animate-spin text-white" />
          ) : (
            <IoSend />
          )}
        </Button>
      </form>
    </div>
  );
}

export default Chat;
