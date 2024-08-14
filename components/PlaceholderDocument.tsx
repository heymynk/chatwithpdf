"use client"

import React from "react";
import { Button } from "./ui/button";
import { PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";

function PlaceholderDocument() {

   const router = useRouter(); 

  const handleClick = () => {

    // Check if the user is Free and if limit is exhausted, push user to the upgrade page

    router.push("/dashboard/upload")
  };

  return (
    <Button
      onClick={handleClick}
      className="flex flex-col items-center w-64 h-80 rounded-xl bg-gray-300 drop-shadow-md text-gray-600"
    >
      <PlusCircleIcon className="h-16 w-16" />
      <p>Add a document</p>
    </Button>
  );
}

export default PlaceholderDocument;
