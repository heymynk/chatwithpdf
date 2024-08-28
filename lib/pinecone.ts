import { Pinecone } from "@pinecone-database/pinecone";

// Check if the Pinecone API key environment variable is set
if (!process.env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY is not set");
}

// Initialize Pinecone client with the API key
const pineconeClient = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export default pineconeClient;
