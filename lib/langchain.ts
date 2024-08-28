import { ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import pineconeClient from "./pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { PineconeConflictError } from "@pinecone-database/pinecone/dist/errors";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";
import { error } from "console";

// Initialize the OpenAI model with API Key and model name
const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo", // Use GPT-3.5-turbo model
});

export const indexName = "chatwithpdf";

// Check if a namespace exists in Pinecone index
async function namespaceExists(index: Index<RecordMetadata>, namespace: string) {
  if (namespace === null) throw new Error("No namespace value provided");

  const { namespaces } = await index.describeIndexStats();
  return namespaces?.[namespace] !== undefined;
}

// Generate document embeddings and store them in Pinecone vector store
export async function generateDocs(docId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not found");
  }

  console.log(`---Fetching the download URL for docId: ${docId} from Firebase... ---`);

  const firebaseRef = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .get();

  if (!firebaseRef.exists) {
    throw new Error(`Document with docId: ${docId} not found`);
  }

  const downloadUrl = firebaseRef.data()?.downloadURL;

  if (!downloadUrl) {
    console.log(firebaseRef.data()); 
    throw new Error("Download URL not found");
  }

  console.log(`---Download URL fetched successfully: ${downloadUrl} ---`);

  // Fetch and load the PDF from the URL
  const response = await fetch(downloadUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch PDF from the URL: ${downloadUrl}`);
  }

  const data = await response.blob();

  console.log("---Loading PDF Document... ---");
  const loader = new PDFLoader(data);
  const docs = await loader.load();

  console.log("---Splitting the loaded document into smaller parts... ---");
  const splitter = new RecursiveCharacterTextSplitter();
  const splitDocs = await splitter.splitDocuments(docs);
  console.log(`---Split into ${splitDocs.length} parts ---`);

  return splitDocs;
}

// Generate embeddings for split documents and store them in Pinecone vector store
export async function generateEmbeddingsInPinecodeVectorStore(docId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not found");
  }

  let pineconeVectorStore;

  console.log("---Generating embeddings for the split documents---");
  const embeddings = new OpenAIEmbeddings();
  const index = await pineconeClient.index(indexName);

  const namespaceAlreadyExists = await namespaceExists(index, docId);

  if (namespaceAlreadyExists) {
    console.log(`---Namespace ${docId} already exists, reusing existing embeddings.... ---`);

    pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: docId,
    });

    return pineconeVectorStore;
  } else {
    // If namespace does not exist, generate embeddings and store them
    const spiltDocs = await generateDocs(docId);

    console.log(`--- Storing the embeddings in namespace ${docId} in the ${indexName} Pinecone Vector Store... ---`);

    pineconeVectorStore = await PineconeStore.fromDocuments(
      spiltDocs,
      embeddings,
      {
        pineconeIndex: index,
        namespace: docId,
      }
    );

    return pineconeVectorStore;
  }
}

// Placeholder for generating a completion using LangChain (yet to be implemented)
const generateLangchainCompletion = async (docId: string, question: string) => {
  // Function implementation will be added here
}
