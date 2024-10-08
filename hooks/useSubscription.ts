"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useEffect } from "react";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import { collection, doc } from "firebase/firestore";
import { db } from "@/firebase";

//number of docs the user is allowed to have
const PRO_LIMIT = 20;
const FREE_LIMIT = 2;

function useSubscription() {
  const [hasActiveMembership, setHasActiveMembership] = useState(null);
  const [isOverFileLimit, setIsOverFileLimit] = useState(false);

  const { user } = useUser();

  //Listen to the user document
  const [snapshot, loading, error] = useDocument(
    user && doc(db, "users", user.id),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  //Listen to the users files collection
  const [fileSnapShot, filesLoading, Fileserror] = useCollection(
    user && collection(db, "users", user?.id, "files")
  );

  useEffect(() => {
    if (!snapshot) return;

    const data = snapshot.data();
    if (!data) return;

    setHasActiveMembership(data.activeMembership);

  }, [snapshot]);

  useEffect(() => {
    if(!fileSnapShot || hasActiveMembership === null) return;

    const files = fileSnapShot.docs;
    const userLimit = hasActiveMembership ? PRO_LIMIT : FREE_LIMIT;

    console.log(
        "Checking if user is over file limit",
        files.length,
        userLimit
    );

    setIsOverFileLimit(files.length >= userLimit)

  }, [fileSnapShot, hasActiveMembership, PRO_LIMIT, FREE_LIMIT])


  return {hasActiveMembership, loading, error, Fileserror, isOverFileLimit, filesLoading}
  

}

export default useSubscription;
