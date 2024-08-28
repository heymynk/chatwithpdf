"use client";

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";

import { Button } from "./ui/button";

import {Input} from "./ui/input";
// import {askQuestion, Message} from "@/actions/askQuestion";
import { Loader2Icon } from "lucide-react";
// import ChatMessage from "./ChatMessage";
import {useCollection} from "react-firebase-hooks/firebase";


import { useUser } from "@clerk/nextjs";
import {collection, orderBy, query} from "firebase/firestore";

import { db } from "@/firebase";




function Chat({ id }: { id: string }) {
  return <div>Chat</div>;
}

export default Chat;
