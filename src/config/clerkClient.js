import { Clerk } from "@clerk/clerk-sdk-node";
import dotenv from "dotenv";

dotenv.config(); 

export const clerkClient = new Clerk({
  apiKey: process.env.CLERK_SECRET_KEY,
  apiVersion: 2,
});
