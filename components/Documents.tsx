"use server";

import React from "react";
import PlaceholderDocument from "./PlaceholderDocument";
import GooglePlaceholderDocument from "./GooglePlaceholderDocument";
import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/firebaseAdmin";
import Document from "./Document";

async function Documents() {
  const { userId } = await auth(); 

  if (!userId) {
    throw new Error("User not found");
  }

  // Fetch document snapshots
  const documentSnapshot = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .get();

  return (
    <div className="flex flex-wrap p-5 bg-gray-100 justify-center lg:justify-center rounded-sm gap-5 max-w-7xl mx-auto">
      {/* Map through the documents */}
      {documentSnapshot.docs.map((doc) => {
        const { name, downloadURL, size } = doc.data();

        return (
          <Document
            key={doc.id}
            id={doc.id}
            name={name}
            size={size}
            downloadURL={downloadURL} 
          />
        );
      })}

      {/* Placeholder documents */}
      <PlaceholderDocument />
      <GooglePlaceholderDocument />
    </div>
  );
}

export default Documents;
