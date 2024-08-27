"use server";

import { generateEmbeddingsInPinecodeVectorStore } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function generateEmbeddings(docId: string) {
  auth().protect();

  //turn a PDF into embeddings [0.354653, 0.334563 .....]
  await generateEmbeddingsInPinecodeVectorStore(docId);

  revalidatePath("/dashboard");

  return { completed: true };
}
