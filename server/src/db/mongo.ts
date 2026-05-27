import mongoose from "mongoose";
import { env } from "../config/env.js";

export async function connectMongo() {
  if (!env.MONGODB_URI) {
    console.warn("MONGODB_URI not set — skipping Mongo connection");
    return;
  }
  await mongoose.connect(env.MONGODB_URI);
  console.log("Mongo connected");
}

export function mongoStatus() {
  return mongoose.connection.readyState === 1 ? "ok" : "down";
}
