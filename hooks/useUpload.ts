"use client";

import { storage } from "@/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/firebase"; // Make sure to import the initialized Firestore instance
import { generateEmbeddings } from "@/actions/generateEmbeddings";

export enum StatusText {
  UPLOADING = "Uploading File...",
  UPLOADED = "File Uploaded Successfully.",
  SAVING = "Saving file to database...",
  GENERATING = "Generating AI Embeddings, This will only take a few seconds...",
}

export type Status = StatusText[keyof StatusText];

function useUpload() {
  const [progress, setProgress] = useState<number | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [fileId, setFileId] = useState<string | null>(null); // Added state for fileId
  const { user } = useUser();
  const router = useRouter();

  const handleUpload = async (file: File) => {
    if (!file || !user) return;

    setStatus(StatusText.UPLOADING);

    const fileIdToUpload = uuidv4();
    const storageRef = ref(storage, `users/${user.id}/files/${fileIdToUpload}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setStatus(StatusText.UPLOADING);
        setProgress(percent);
      },
      (error) => {
        console.error("Upload failed:", error);
        setStatus(null);
        setProgress(null);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFileUrl(downloadURL);
          setStatus(StatusText.SAVING);

          await setDoc(doc(db, "users", user.id, "files", fileIdToUpload), {
            name: file.name,
            size: file.size,
            type: file.type,
            downloadURL: downloadURL,
            ref: uploadTask.snapshot.ref.fullPath,
            createdAt: new Date(),
          });

          setStatus(StatusText.GENERATING);

          //Generate AI Embeddings

          await generateEmbeddings(fileIdToUpload);



          setFileId(fileIdToUpload);

          // Assume some AI embedding generation process here

          // Reset status and progress after completion
          setStatus(null);
          setProgress(null);
        } catch (error) {
          console.error("Error saving file to database:", error);
          setStatus(null);
          setProgress(null);
        }
      }
    );
  };

  return {
    progress,
    fileUrl,
    status,
    fileId, // Return the fileId as well
    handleUpload,
  };
}

export default useUpload;
