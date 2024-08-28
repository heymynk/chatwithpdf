"use server";

import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";
// import {generateLangchainComplition} from "@/lib/langchain"

export type Message = {
    id?: string;
    role: "human" | "ai" | "placeholder";
    message: string;
    createdAt: Date;
  };

const FREE_PLAN = 3;
const PAID_PLAN = 100;

export async function askQuestion(id: string, question: string) {
  const { userId } = await auth();

  const chatRef = adminDb
    .collection("users")
    .doc(userId!)
    .collection("files")
    .doc(id)
    .collection("chat");

  // Check how many user's messages are in the chat
  // This will be used for PRO/FREE functionality
  const chatSnapshot = await chatRef.get();
  const userMessages = chatSnapshot.docs.filter(
    (doc) => doc.data().role === "human"
  );

  const userMessage: Message = {
    role: "human",
    message: question,
    createdAt: new Date(),
  };

  await chatRef.add(userMessage);

  //Generate Ai Message

  // const reply = await generateLangchainComplition(id, question);

  // const aiMessage: Message = {
  //   role: "ai",
  //   message: reply,
  //   createdAt: new Date(),
  // };

  // await chatRef.add(aiMessage);

  return {success: true, message:null};

}
