"use client";

import React, { useTransition } from "react";
import { Button } from "./ui/button";
import { PlusCircleIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";

function PlaceholderDocument() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      router.push("/dashboard/upload");
    });
  };

  return (
    <Button
      onClick={handleClick}
      className="flex flex-col items-center w-64 h-80 rounded-xl bg-gray-300 drop-shadow-md text-gray-600"
      disabled={isPending} // Disable the button while the transition is pending
    >
      {isPending ? (
        <Loader2Icon className="h-16 w-16 animate-spin" />
      ) : (
        <>
          <PlusCircleIcon className="h-16 w-16" />
          <p>Add a document</p>
        </>
      )}
    </Button>
  );
}

export default PlaceholderDocument;
