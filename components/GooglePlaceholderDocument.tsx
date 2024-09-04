"use client";

import React, { useState, useTransition } from "react";
import useDrivePicker from "react-google-drive-picker";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";
import { FaGoogleDrive } from "react-icons/fa";
import { useAuth } from "@clerk/nextjs";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/firebase";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import { generateEmbeddings } from "@/actions/generateEmbeddings";
import { createHash } from "crypto";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

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
  GENERATING = "Generating AI Embeddings...",
}

export type Status = keyof typeof StatusText;

const statusText: Record<Status, string> = {
  UPLOADING: StatusText.UPLOADING,
  UPLOADED: StatusText.UPLOADED,
  SAVING: StatusText.SAVING,
  GENERATING: StatusText.GENERATING,
};

const generateFileId = async (file: Blob): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hash = createHash("sha256");
  hash.update(new Uint8Array(arrayBuffer));
  return hash.digest("hex");
};

const GooglePlaceholderDocument = () => {
  const [openPicker] = useDrivePicker();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const router = useRouter();

  const handleOpenPicker = async () => {
    if (!user) {
      console.error("User is not authenticated");
      return;
    }

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
            viewMimeTypes: "application/pdf",
            token: tokenInfo ? tokenInfo.access_token : null,
            showUploadView: true,
            showUploadFolders: true,
            supportDrives: true,
            multiselect: true,
            callbackFunction: async (data: GooglePickerData) => {
              if (data.action === "picked") {
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
                    )
                    .map(async (item: GooglePickerFile) => {
                      const response = await fetch(
                        `${driveFileUrl}/${item.id}?alt=media`,
                        fetchOptions
                      );
                      const blob = await response.blob();
                      const fileIdToUpload = await generateFileId(blob);
                      const fileRef = ref(
                        storage,
                        `users/${user.id}/files/${fileIdToUpload}.pdf`
                      );
                      const uploadTask = uploadBytesResumable(fileRef, blob);
                      uploadTask.on(
                        "state_changed",
                        (snapshot) => {
                          const percent = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) *
                              100
                          );
                          setStatus("UPLOADING"); // Use string literal
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
                            setStatus("SAVING"); // Use string literal

                            await setDoc(
                              doc(
                                db,
                                "users",
                                user.id,
                                "files",
                                fileIdToUpload
                              ),
                              {
                                name: item.name,
                                size: blob.size,
                                type: item.mimeType,
                                downloadURL: downloadURL,
                                ref: uploadTask.snapshot.ref.fullPath,
                                createdAt: new Date(),
                              }
                            );

                            setStatus("GENERATING"); // Use string literal

                            await generateEmbeddings(fileIdToUpload);

                            setFileId(fileIdToUpload);

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

  const handleClick = () => {
    startTransition(() => {
      handleOpenPicker();
    });
  };

  return (
    <Button
      onClick={handleClick}
      className="relative flex flex-col items-center justify-center w-64 h-80 rounded-xl bg-gray-300 drop-shadow-md text-gray-600"
      disabled={isPending}
    >
      {(status || isPending) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 bg-opacity-75 rounded-xl">
          <Loader2Icon className="h-16 w-16 animate-spin" />
          <p className="mt-2 text-sm font-semibold text-gray-700 text-center">
            {status ? statusText[status] : "Processing..."}
          </p>
        </div>
      )}
      {!status && !isPending && (
        <>
          <FaGoogleDrive className="h-16 w-16" />
          <p>Add document from Google Drive</p>
        </>
      )}
    </Button>
  );
};

export default GooglePlaceholderDocument;
