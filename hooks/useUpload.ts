"use client";

import { storage } from "@/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/firebase"; 
import { generateEmbeddings } from "@/actions/generateEmbeddings";
import { createHash } from "crypto";

export enum StatusText {
  UPLOADING = "Uploading File...", 
  UPLOADED = "File Uploaded Successfully.", 
  SAVING = "Saving file to database...", 
  GENERATING = "Generating AI Embeddings, This will only take a few seconds...", 
}

export type Status = StatusText[keyof StatusText];

const generateFileId = async (file: File): Promise<string> => {
  // Generate a unique file ID based on the file's content
  const arrayBuffer = await file.arrayBuffer();
  const hash = createHash('sha256');
  hash.update(new Uint8Array(arrayBuffer));
  return hash.digest('hex');
};

function useUpload() {
  const [progress, setProgress] = useState<number | null>(null); 
  const [fileUrl, setFileUrl] = useState<string | null>(null); 
  const [status, setStatus] = useState<Status | null>(null); 
  const [fileId, setFileId] = useState<string | null>(null); 
  const { user } = useUser(); 
  const router = useRouter(); 

  const handleUpload = async (file: File) => {

    if (!file || !user) return; 

    setStatus(StatusText.UPLOADING);

    try {
      const fileIdToUpload = await generateFileId(file); 
      const storageRef = ref(storage, `users/${user.id}/files/${fileIdToUpload}`); // Reference for the file in Firebase Storage

      const uploadTask = uploadBytesResumable(storageRef, file); 

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Monitor upload progress
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
            }); // Save file metadata to Firestore

            setStatus(StatusText.GENERATING); 

            // Generate AI Embeddings
            await generateEmbeddings(fileIdToUpload);

            setFileId(fileIdToUpload); 

          } catch (error) {
            console.error("Error saving file to database:", error); 
            setStatus(null); 
            setProgress(null); 
          }
        }
      );
    } catch (error) {
      console.error("Error generating file ID:", error); 
      setStatus(null);
      setProgress(null); 
    }
  };

  return {
    progress,
    fileUrl,
    status,
    fileId, 
    handleUpload,
  };
}

export default useUpload;
