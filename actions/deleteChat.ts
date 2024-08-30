"use server";

import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";

export async function deleteChat(chatId: string, userId: string) {
  auth().protect();

  console.log(`Deleting chat for userId: ${userId} and chatId: ${chatId}`);

  // Reference to the chat collection
  const chatCollectionRef = adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(chatId)
    .collection("chat");

  // Get all documents in the chat collection
  const chatDocsSnapshot = await chatCollectionRef.get();

  console.log(`Found ${chatDocsSnapshot.size} chat documents to delete`);

  // Check if there are documents to delete
  if (chatDocsSnapshot.empty) {
    console.log("No chat documents found for deletion.");
    return { message: "No chat conversation found to delete." };
  }

  // Delete each document in the chat collection
  const deletePromises = chatDocsSnapshot.docs.map((doc) => {
    console.log(`Deleting document with ID: ${doc.id}`);
    return doc.ref.delete();
  });

  // Wait for all deletions to complete
  await Promise.all(deletePromises);

  console.log("All chat documents deleted successfully");

  // Return a success message
  return { message: "Chat conversation deleted successfully" };
}
