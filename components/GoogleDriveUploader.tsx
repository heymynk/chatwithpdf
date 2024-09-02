"use client";

import React, { useState, useTransition, useCallback } from "react";
import { Button } from "./ui/button";
import { FaGoogleDrive } from "react-icons/fa";
import { useRouter } from "next/navigation";
import useDrivePicker from "react-google-drive-picker";
import { useDropzone } from "react-dropzone";
import { RocketIcon, CheckCircleIcon, SaveIcon, HammerIcon } from "lucide-react"; // Ensure to import necessary icons

// Define a TypeScript type for the selected file
interface SelectedFile {
  id: string;
  name: string;
  mimeType: string;
  url: string;
}

enum StatusText {
  UPLOADING = "Uploading...",
  UPLOADED = "Uploaded",
  SAVING = "Saving...",
  GENERATING = "Generating...",
}

function GoogleDriveUploader() {
  const router = useRouter();
  const [openPicker] = useDrivePicker();
  const [isPending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<StatusText>(StatusText.UPLOADING);

  // Simulate a file upload process
  const handleUpload = async (file: File) => {
    setStatus(StatusText.UPLOADING);
    // Simulate file upload progress
    setProgress(50); // Example progress value

    // Here, you would handle the actual file upload logic
    // Example: await uploadFileToServer(file);

    setStatus(StatusText.UPLOADED);
    setProgress(100);
    // After upload is completed, navigate to the file's page
    router.push(`/dashboard/files/${file.name}`); // You might want to use a file ID or other identifier
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        await handleUpload(file);
      } else {
        console.error("No file selected");
      }
    },
    [handleUpload]
  );

  const { getRootProps, getInputProps, isFocused, isDragActive, isDragAccept } =
    useDropzone({
      onDrop,
      maxFiles: 1,
      accept: {
        "application/pdf": [".pdf"],
      },
    });

  const handleAddFromGoogleDrive = () => {
    openPicker({
      clientId: "305248275761-66iogb5k5anc7dk9f9puk95ptc2si7tj.apps.googleusercontent.com",
      developerKey: "AIzaSyC3CSpcsW0fhyiyhpYhV3lZP7YS5WixP8w",
      viewId: "DOCS",
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: false,
      callbackFunction: (data) => {
        if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.PICKED) {
          const doc = data[window.google.picker.Response.DOCUMENTS][0];
          console.log("Selected file:", doc);

          // Convert Google Drive file to a local file object (mock implementation)
          const file: SelectedFile = {
            id: doc.id,
            name: doc.name,
            mimeType: doc.mimeType,
            url: doc.url,
          };

          // Simulate downloading the file (e.g., using fetch or another method)
          fetch(doc.url)
            .then((res) => res.blob())
            .then((blob) => {
              const localFile = new File([blob], file.name, { type: file.mimeType });
              onDrop([localFile]); // Trigger file upload process
            });

          setSelectedFile(file);
        } else if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.CANCEL) {
          console.log("User clicked cancel/close button");
        }
      },
    });
  };

  // Icons to represent different upload statuses
  const statusIcon: {
    [key in StatusText]: JSX.Element;
  } = {
    [StatusText.UPLOADING]: <RocketIcon className="h-20 w-20 text-purple-600" />,
    [StatusText.UPLOADED]: <CheckCircleIcon className="h-20 w-20 text-purple-600" />,
    [StatusText.SAVING]: <SaveIcon className="h-20 w-20 text-purple-600" />,
    [StatusText.GENERATING]: <HammerIcon className="h-20 w-20 text-purple-600" />,
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={handleAddFromGoogleDrive}
        className="flex flex-col items-center w-64 h-80 rounded-xl bg-gray-300 drop-shadow-md text-gray-600"
        disabled={isPending}
      >
        {isPending ? (
          <span className="h-16 w-16 animate-spin">Loading...</span> // Replace with a loading spinner if needed
        ) : (
          <>
            <FaGoogleDrive className="h-16 w-16" />
            <p>Add a Document from Google Drive</p>
          </>
        )}
      </Button>

      {selectedFile && (
        <div className="mt-4">
          <p>Selected File:</p>
          <a href={selectedFile.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
            {selectedFile.name}
          </a>
        </div>
      )}

      {status && (
        <div className="mt-4 flex items-center gap-2">
          {statusIcon[status]}
          <p>{status}</p>
        </div>
      )}
    </div>
  );
}

export default GoogleDriveUploader;
