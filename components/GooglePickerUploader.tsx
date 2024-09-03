"use client";

import React, { useState } from "react";
import useDrivePicker from "react-google-drive-picker";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";

import { useAuth } from "@clerk/nextjs";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/firebase";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import { generateEmbeddings } from "@/actions/generateEmbeddings";
import { createHash } from "crypto";
import { useRouter } from "next/navigation";

interface GooglePickerFile {
  id: string;
  name: string;
  mimeType: string;
}

interface GooglePickerData {
  action: string;
  docs: GooglePickerFile[];
}

export enum StatusText {
  UPLOADING = "Uploading File...",
  UPLOADED = "File Uploaded Successfully.",
  SAVING = "Saving file to database...",
  GENERATING = "Generating AI Embeddings, This will only take a few seconds...",
}

export type Status = StatusText[keyof StatusText];

const generateFileId = async (file: Blob): Promise<string> => {
  // Generate a unique file ID based on the file's content
  const arrayBuffer = await file.arrayBuffer();
  const hash = createHash("sha256");
  hash.update(new Uint8Array(arrayBuffer));
  return hash.digest("hex");
};

const GooglePickerUploader = () => {
  const [openPicker] = useDrivePicker();
  const { getToken } = useAuth();
  const { user } = useUser(); // Fetch user from auth
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const router = useRouter(); // Add useRouter for navigation

  const handleOpenPicker = async () => {
    const clerkToken = await getToken();

    gapi.load("client:auth2", () => {
      gapi.client
        .init({
          apiKey: "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",
        })
        .then(() => {
          let tokenInfo = gapi.auth.getToken();
          const pickerConfig: any = {
            clientId:
              "305248275761-66iogb5k5anc7dk9f9puk95ptc2si7tj.apps.googleusercontent.com",
            developerKey: "AIzaSyC3CSpcsW0fhyiyhpYhV3lZP7YS5WixP8w",
            viewId: "DOCS",
            viewMimeTypes: "application/pdf", // Filter to show only PDFs
            token: tokenInfo ? tokenInfo.access_token : null,
            showUploadView: true,
            showUploadFolders: true,
            supportDrives: true,
            multiselect: true,
            callbackFunction: async (data: GooglePickerData) => {
              if (data.action === "picked" && user?.id) {
                if (!tokenInfo) {
                  tokenInfo = gapi.auth.getToken();
                }
                const fetchOptions = {
                  headers: {
                    Authorization: `Bearer ${tokenInfo.access_token}`,
                  },
                };
                const driveFileUrl =
                  "https://www.googleapis.com/drive/v3/files";

                await Promise.all(
                  data.docs
                    .filter(
                      (item: GooglePickerFile) =>
                        item.mimeType === "application/pdf"
                    ) // Process only PDFs
                    .map(async (item: GooglePickerFile) => {
                      const response = await fetch(
                        `${driveFileUrl}/${item.id}?alt=media`,
                        fetchOptions
                      );
                      const blob = await response.blob();
                      const fileIdToUpload = await generateFileId(blob); // Generate file ID
                      const fileRef = ref(
                        storage,
                        `users/${user?.id}/files/${fileIdToUpload}.pdf` // Include user ID in path
                      ); // Reference for the file in Firebase Storage
                      const uploadTask = uploadBytesResumable(fileRef, blob); // Upload file to Firebase

                      uploadTask.on(
                        "state_changed",
                        (snapshot) => {
                          // Monitor upload progress
                          const percent = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) *
                              100
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
                            const downloadURL = await getDownloadURL(
                              uploadTask.snapshot.ref
                            );
                            setStatus(StatusText.SAVING);

                            // Save file metadata to Firestore
                            await setDoc(doc(db, "users", user?.id, "files", fileIdToUpload), { // Include user ID in path
                              name: item.name,
                              size: blob.size,
                              type: item.mimeType,
                              downloadURL: downloadURL,
                              ref: uploadTask.snapshot.ref.fullPath,
                              createdAt: new Date(),
                            });

                            setStatus(StatusText.GENERATING);

                            // Generate AI Embeddings
                            await generateEmbeddings(fileIdToUpload);

                            setFileId(fileIdToUpload);

                            // Navigate to file details page
                            router.push(`/dashboard/files/${fileIdToUpload}`);
                          } catch (error) {
                            console.error(
                              "Error saving file to database:",
                              error
                            );
                            setStatus(null);
                            setProgress(null);
                          }
                        }
                      );
                    })
                );
              }
            },
          };
          openPicker(pickerConfig);
        });
    });
  };

  return (
    <div className="flex flex-col gap-4 items-center max-w-7xl mx-auto px-4">
      {/* Show progress bar during file upload */}
      {progress !== null && (
        <div className="mt-32 flex flex-col justify-center items-center gap-5 relative">
          {progress < 100 ? (
            <div className="relative flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-purple-600"></div>
              <span
                className="absolute text-purple-600 font-bold text-xl"
                style={{
                  lineHeight: "8rem",
                }}
              >
                {progress} %
              </span>
            </div>
          ) : (
            <>
              {status && (
                <div className="text-purple-600 text-lg mt-2">
                  {status as string}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Button to open Google Picker */}
      <Button onClick={() => handleOpenPicker()} color="primary">
        Open Google Picker
      </Button>
    </div>
  );
};

export default GooglePickerUploader;
