import { middleware } from "./utils/middleware.js";
import { logger } from "./utils/logger.js";
import { config } from "./utils/config.js";
import express from "express";
import "express-async-errors";
import cors from "cors";
import mongoose from "mongoose";
import blogsRouter from "./controllers/blogs.js";
import userRouter from "./controllers/users.js";
import loginRouter from "./controllers/login.js";

const app = express();
mongoose.set("strictQuery", false);

const {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
} = middleware();
const { info, error } = logger();
const { MONGODB_URI } = config();

info("connecting to", MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    info("connected to MongoDB");
  })
  .catch((er) => {
    error("error connecting to MongoDB:", er.message);
  });

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(requestLogger);
app.use(tokenExtractor);

app.use("/api/login", loginRouter);
app.use("/api/blogs", blogsRouter);
app.use("/api/users", userRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

export default app;
