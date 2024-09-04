"use client";

import { useUser } from "@clerk/nextjs";
import { Message } from "./Chat";
import Image from "next/image";
import { BotIcon } from "lucide-react";
import Markdown from "react-markdown";
import { motion } from "framer-motion";

const messageVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

const bubbleVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const ChatMessage = ({ message }: { message: Message }) => {
  const isHuman = message.role === "human";
  const { user } = useUser();

  return (
    <motion.div 
      className={`chat ${isHuman ? "chat-end" : "chat-start"} mb-4`}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5, type: 'spring', stiffness: 80 }}
    >
      <div className="chat-image avatar">
        <div className="w-8 h-8 rounded-full"> 
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
            <div className="h-8 w-8 bg-purple-600 flex items-center justify-center rounded-full"> 
              <BotIcon className="text-white h-6 w-6" />
            </div>
          )}
        </div>
      </div>
      <motion.div 
        className={`chat-bubble prose ${isHuman ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-800"} flex items-center justify-center`}
        variants={bubbleVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {message.message === "Thinking..." ? (
          <div className="flex items-center justify-center space-x-1.5">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-100"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-200"></div>
          </div>
        ) : (
          <Markdown>{message.message}</Markdown>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ChatMessage;
