import PdfView from "@/components/PdfView";
import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";

async function chatToFilePage({
  params: { id },
}: {
  params: {
    id: string;
  };
}) {
  auth().protect();
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }
  console.log("User ID:", userId);

  try {
    const ref = await adminDb
      .collection("users")
      .doc(userId)
      .collection("files")
      .doc(id)
      .get();
      

      if (!ref.exists) {
        throw new Error(`Document with ID ${id} does not exist.`);
      }

    console.log("Firebase document reference fetched:", ref);

    const data = ref.data();
    console.log("Document data:", data);

    const url = data?.downloadURL;
    console.log("Download URL from Firebase:", url);

    if (!url) {
      throw new Error("No download URL found in the document.");
    }

    return (
      <div className="grid lg:grid-cols-5 h-full overflow-hidden">
        {/* Right */}
        <div className="col-span-5 lg:grid-cols-2 overflow-y-auto">
          {/* chat */}
        </div>

        {/* Left */}
        <div className="col-span-5 lg:col-span-3 bg-gray-100 border-r-2 lg:border-purple-600 lg:-order-1 overflow-auto">
          {/* PDFView */}
          <PdfView url={url} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching document or rendering PDF:", error);
    return <div>Error loading file. Please try again later.</div>;
  }
}

export default chatToFilePage;