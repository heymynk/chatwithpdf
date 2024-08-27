import { Pinecone } from "@pinecone-database/pinecone";

// Check Pinecone environment variable is set or not
if (!process.env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY is not set");
}

// Initialize pinecone client
const pineconeClient = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});


export default pineconeClient;