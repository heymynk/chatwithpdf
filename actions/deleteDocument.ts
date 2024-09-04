"use server";

import { adminDb, adminStorage } from "@/firebaseAdmin";
import { indexName } from "@/lib/langchain";
import pineconeClient from "@/lib/pinecone";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function deleteDocument(docId: string) {
    try {
        // Protect and retrieve user information
        const { userId } = await auth().protect();
        if (!userId) {
            throw new Error("User is not authenticated");
        }

        console.log(`Deleting document with ID: ${docId} for user: ${userId}`);

        // Delete the document from Firestore
        await adminDb
            .collection("users")
            .doc(userId)
            .collection("files")
            .doc(docId)
            .delete();
        console.log(`Document ${docId} deleted from Firestore`);

        // Delete all embeddings associated with the document from Pinecone
        const index = await pineconeClient.index(indexName);
        await index.namespace(docId).deleteAll();
        console.log(`Embeddings for document ${docId} deleted from Pinecone`);

        // Verify if file exists before deletion
        const filePath = `users/${userId}/files/${docId}`;
        const fileRef = adminStorage.bucket(process.env.FIREBASE_STORAGE_BUCKET!).file(filePath);
        const [exists] = await fileRef.exists();
        
        if (exists) {
            await fileRef.delete();
            console.log(`File ${filePath} deleted from Firebase Storage`);
        } else {
            console.warn(`File ${filePath} does not exist in Firebase Storage`);
        }

        // Revalidate the path to update the UI
        revalidatePath("/dashboard");
        console.log("Path revalidated successfully");

    } catch (error) {
        console.error("Error deleting document:", error);
        // Handle errors (e.g., notify user, retry, etc.)
    }
}
