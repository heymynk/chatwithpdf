import Chat from "@/components/Chat";
import PdfView from "@/components/PdfView";
import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";

// Async function to handle the page that displays a chat and a PDF file based on the provided ID
async function chatToFilePage({
  params: { id },
}: {
  params: {
    id: string;
  };
}) {
  // Protect the route to ensure only authenticated users can access it
  auth().protect();

  // Get the authenticated user's ID
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }
  console.log("User ID:", userId);

  try {
    // Fetch the document from Firestore using the user's ID and the file ID
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

    // Extract the document data and get the download URL from the document data
    const data = ref.data();
    console.log("Document data:", data);
    const url = data?.downloadURL;
    console.log("Download URL from Firebase:", url);

    if (!url) {
      throw new Error("No download URL found in the document.");
    }

    // Render the chat interface and the PDF viewer side by side
    return (
      <div className="grid lg:grid-cols-5 h-full overflow-hidden">
        {/* Right: Display the chat component */}
        <div className="col-span-5 lg:col-span-2 overflow-y-auto">
          <Chat id={id} />
        </div>

        {/* Left: Display the PDF viewer */}
        <div className="col-span-5 lg:col-span-3 bg-gray-100 border-r-2 lg:border-purple-600 lg:-order-1 overflow-auto">
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
