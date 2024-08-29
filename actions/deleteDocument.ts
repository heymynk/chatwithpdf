"use server"

import { auth } from "@clerk/nextjs/server";


export async function deleteDocument(docId:string) {
    
    auth().protect();

    const {userId} = await auth();
}