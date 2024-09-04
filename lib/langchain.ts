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
  modelName: "gpt-3.5-turbo",
});

export const indexName = "chatwithpdf";

//fuction to fetch the messages from the DataBase
async function fetchMessagefromDB(docId: string) {
  const { userId } = await auth();
  if (!userId) throw Error("User not found.");

  console.log("--- fetching chat messages from the firebase database---");

  // Fetch chat messages using an indexed query and batch reads
  const chatSnapshot = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .collection("chat")
    .orderBy("createdAt", "desc")
    .limit(6)
    .get();

  const chatHistory = chatSnapshot.docs.map((doc) =>
    doc.data().role === "human"
      ? new HumanMessage(doc.data().message)
      : new AIMessage(doc.data().message)
  );

  return chatHistory;
}

// Check if a namespace exists in Pinecone index
async function namespaceExists(
  index: Index<RecordMetadata>,
  namespace: string
) {
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

  console.log(
    `---Fetching the download URL for docId: ${docId} from Firebase... ---`
  );

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
    console.log(
      `---Namespace ${docId} already exists, reusing existing embeddings.... ---`
    );

    pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: docId,
    });

    return pineconeVectorStore;
  } else {
    // If namespace does not exist, generate embeddings and store them
    const spiltDocs = await generateDocs(docId);

    console.log(
      `--- Storing the embeddings in namespace ${docId} in the ${indexName} Pinecone Vector Store... ---`
    );

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

// Placeholder for generating a completion using LangChain
const generateLangchainComplition = async (docId: string, question: string) => {
  let pineconeVectorStore;

  pineconeVectorStore = await generateEmbeddingsInPinecodeVectorStore(docId);
  if (!pineconeVectorStore) {
    throw new Error("pinecone vector store is not found");
  }

  // create a retriever to search through the vector store
  console.log("--- Creating a retriever ---");
  const retriever = pineconeVectorStore.asRetriever();

  // Fetch the chat history from the database
  const chatHistory = await fetchMessagefromDB(docId);

  // Define a prompt template for generating search queries based on conversation history
  console.log("---Defining a prompt template....---");

  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    ...chatHistory,

    ["user", "{input}"],
    [
      "user",
      "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
    ],
  ]);

  // Create a history-aware retriever chain that uses the model, retriever, and prompt
  console.log("---creating a history-aware retriever chain... ---");
  const historyAwareRetrieverCHain = await createHistoryAwareRetriever({
    llm: model,
    retriever,
    rephrasePrompt: historyAwarePrompt,
  });

  // Define a prompt template for answering queestions based on retrieved context
  console.log("---Defining a prompt template for answering questions... ---");

  const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "Answer the user's question based on the below context: \n\n{context}",
    ],
    ...chatHistory,
    ["user", "{input}"],
  ]);

  //create a chain to combine the retrieved documents into a coherent response
  console.log("--- Creating a document chain...---");
  const historyAwareCombineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: historyAwareRetrievalPrompt,
  });

  // create the main retrieval chain that combines history-aware retriever and document combining chains
  console.log("--- Creating the main retrieval chain... ---");
  const conversationalRetrievalChain = await createRetrievalChain({
    retriever: historyAwareRetrieverCHain,
    combineDocsChain: historyAwareCombineDocsChain,
  });

  console.log("---Running the chain with sample conversation... ---");
  const reply = await conversationalRetrievalChain.invoke({
    chat_history: chatHistory,
    input: question,
  });

  console.log(reply.answer);
  return reply.answer;
};

export { model, generateLangchainComplition };
