"use client";
import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";

import {
  CheckCircleIcon,
  CircleArrowDown,
  HammerIcon,
  RocketIcon,
  SaveIcon,
} from "lucide-react";
import useUpload, { StatusText } from "@/hooks/useUpload";
import { useRouter } from "next/navigation";

function FileUploader() {
  const { progress, status, fileId, handleUpload } = useUpload();
  const router = useRouter();

  useEffect(() => {
    if (fileId) {
      router.push(`/dashboard/files/${fileId}`);
    }
  }, [fileId, router]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (file) {
        await handleUpload(file);
      } else {
        //toast....
      }
    },
    [handleUpload]
  );

  const statusIcon: {
    [key in StatusText]: JSX.Element;
  } = {
    [StatusText.UPLOADING]: (
      <RocketIcon className="h-20 w-20 text-purple-600" />
    ),
    [StatusText.UPLOADED]: (
      <CheckCircleIcon className="h-20 w-20 text-purple-600" />
    ),

    [StatusText.SAVING]: <SaveIcon className="h-20 w-20 text-purple-600" />,
    [StatusText.GENERATING]: (
      <HammerIcon className="h-20 w-20 text-purple-600" />
    ),
  };

  const { getRootProps, getInputProps, isFocused, isDragActive, isDragAccept } =
    useDropzone({
      onDrop,
      maxFiles: 1,
      accept: {
        "application/pdf": [".pdf"],
      },
    });

  const uploadProgress = progress != null && progress >= 0 && progress <= 100;

  return (
    <div className="flex flex-col gap-4 items-center max-w-7xl mx-auto px-4">
      {/* Loading section */}

      {uploadProgress && (
        <div className="mt-32 flex flex-col justify-center items-center gap-5">
          <div
            className={`radical-progress bg-purple-300 text-white border-purple-600 border-4 ${
              progress === 100 && "hidden"
            }`}
            role="progressbar"
            style={{
              // @ts-ignore
              "--value": progress,
              "--size": "12rem",
              "--thickness": "1.3rem",
            }}
          >
            {progress} %
          </div>
          {
            // @ts-ignore
            statusIcon[status!]
          }
        </div>
      )}

      {!uploadProgress && (
        <div
          {...getRootProps()}
          className={`p-6 sm:p-10 border-2 border-dashed mt-10 w-full sm:w-[90%] border-purple-600 text-purple-600 rounded-lg h-80 sm:h-96 flex items-center justify-center transition-colors ${
            isFocused || isDragAccept ? "bg-purple-300" : "bg-purple-100"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col justify-center items-center">
            {isDragActive ? (
              <>
                <RocketIcon className="h-20 w-20 animate-bounce " />
                <p className="text-sm sm:text-base">Drop the files here ...</p>
              </>
            ) : (
              <>
                <CircleArrowDown className="h-20 w-20 animate-bounce " />
                <p className="text-sm sm:text-base">
                  Drag n drop some files here, or click to select files
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUploader;
