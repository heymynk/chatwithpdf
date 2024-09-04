"use client";

import { useRouter } from "next/navigation";
import byteSize from "byte-size";
import { Button } from "./ui/button";
import { DownloadCloud, Trash2Icon, LoaderIcon } from "lucide-react";
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
      className="relative flex flex-col w-64 h-80 rounded-xl bg-white drop-shadow-md justify-between p-4 transition-all transform hover:scale-105 hover:bg-purple-600 hover:text-white cursor-pointer group"
      onClick={() => router.push(`/dashboard/files/${id}`)}
    >
      <div className="flex-1">
        <p className="font-semibold line-clamp-2">{name}</p>
        <p className="text-sm text-gray-500 group-hover:text-purple-200">
          {byteSize(size).value} KB
        </p>
      </div>

      <div className="absolute bottom-4 right-4 flex space-x-2">
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
          <a href={downloadURL} download target="_blank">
            <DownloadCloud className="h-6 w-6 text-purple-600" />
          </a>
        </Button>
      </div>
    </div>
  );
}

export default Document;
