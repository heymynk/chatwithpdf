"use server"

import { UserDetails } from "@/app/dashboard/upgrade/page"
import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";

export async function createCheckoutSession(UserDetails: UserDetails){
    const {userId} = await auth();

    if(!userId){
        throw new Error("User Not Found.")

    }

    //First check if the user already has stripeCustomerId

    let stripeCustomerId;

    const user = await adminDb.collection("users").doc(userId).get();
    stripeCustomerId = user.data()?.stripeCustomerId;

    if(!stripeCustomerId){
        // Create a new stripe customer
    }

}