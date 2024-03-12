import dotenv from "dotenv";
dotenv.config();

export function config() {
  const PORT = process.env.PORT;

  const MONGODB_URI =
    process.env.NODE_ENV === "test"
      ? process.env.TEST_MONGO_URI
      : process.env.MONGODB_URI;

  return { PORT, MONGODB_URI };
}
