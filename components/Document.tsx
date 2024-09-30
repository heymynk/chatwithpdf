"use client";

import { useRouter } from "next/navigation";
import byteSize from "byte-size";
import { Button } from "./ui/button";
import { DownloadCloud, Trash2Icon, LoaderIcon, FileText } from "lucide-react";
import { useTransition } from "react";
import { deleteDocument } from "@/actions/deleteDocument";

function Document({
  id,
  name,
  size,
  downloadURL,
}: {
  id: string;
  name: string;
  size: number;
  downloadURL: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className="relative flex flex-col w-64 h-80 rounded-lg bg-white shadow-lg p-4 transition-transform transform hover:scale-105 hover:bg-purple-500 hover:text-white cursor-pointer group"
      onClick={() => router.push(`/dashboard/files/${id}`)}
    >
      {/* Document Name and Size */}
      <div className="text-center mb-2">
        <p className="font-semibold line-clamp-2">{name}</p>
        <p className="text-sm text-gray-500 group-hover:text-purple-200">
          {byteSize(size).value} KB
        </p>
      </div>

      {/* Centered PDF Logo with fixed height */}
      <div className="flex-1 flex items-center justify-center mt-2 h-24"> {/* Adjust height as needed */}
        <FileText className="h-16 w-16 text-gray-600 group-hover:text-white" />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-2 mt-4">
        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm("Are you sure you want to delete this document?")) {
              startTransition(() => deleteDocument(id));
            }
          }}
        >
          {isPending ? (
            <LoaderIcon className="h-6 w-6 animate-spin text-gray-500" />
          ) : (
            <Trash2Icon className="h-6 w-6 text-red-500" />
          )}
        </Button>
        <Button variant="outline" asChild>
          <a
            href={downloadURL}
            download
            target="_blank"
            onClick={(e) => e.stopPropagation()}
          >
            <DownloadCloud className="h-6 w-6 text-purple-600" />
          </a>
        </Button>
      </div>
    </div>
  );
}

export default Document;
