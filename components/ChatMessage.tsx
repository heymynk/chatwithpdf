"use client";

import { useUser } from "@clerk/nextjs";
import { Message } from "./Chat";
import Image from "next/image";
import { BotIcon } from "lucide-react";
import Markdown from "react-markdown";

function ChatMessage({ message }: { message: Message }) {
  const isHuman = message.role === "human";
  const { user } = useUser();

  return (
    <div className={`chat ${isHuman ? "chat-end" : "chat-start"} mb-4`}>
      <div className="chat-image avatar">
        <div className="w-8 h-8 rounded-full"> {/* Smaller avatar */}
          {isHuman ? (
            user?.imageUrl && (
              <Image
                src={user?.imageUrl}
                alt="Profile Picture"
                width={32}
                height={32}
                className="rounded-full"
              />
            )
          ) : (
            <div className="h-8 w-8 bg-purple-600 flex items-center justify-center rounded-full"> {/* Smaller bot icon */}
              <BotIcon className="text-white h-6 w-6" />
            </div>
          )}
        </div>
      </div>
      <div className={`chat-bubble prose ${isHuman && "bg-purple-600 text-white"} flex items-center justify-center`}>
        {message.message === "Thinking..." ? (
          <div className="flex items-center justify-center space-x-1.5">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-100"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-200"></div>
          </div>
        ) : (
          <Markdown>{message.message}</Markdown>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
