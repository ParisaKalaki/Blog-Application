import express from "express";
const blogsRouter = express.Router();
import Blog from "../models/blog.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { middleware } from "../utils/middleware.js";

const { userExtractor } = middleware();

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.get("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id);

  if (blog) {
    response.json(blog);
  } else {
    response.status(404).end();
  }
});

blogsRouter.post("/", userExtractor, async (request, response) => {
  const body = request.body;

  const user = await User.findById(request.user.id);

  if (!body.title || !body.url) {
    return response.status(400).json({
      error: "missing title or url",
    });
  }
  const blog = new Blog({
    author: body.author,
    title: body.title,
    url: body.url,
    likes: body.likes || 0,
    user: user.id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

blogsRouter.delete("/:id", userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  const userid = request.user.id;
  if (blog.user.toString() === userid.toString()) {
    await Blog.findByIdAndDelete(request.params.id);
    return response.status(204).end();
  }
  return response.status(401).json({ error: "user invalid" });
});

blogsRouter.put("/:id", userExtractor, async (request, response) => {
  const body = request.body;
  const blog = {
    author: body.author,
    title: body.title,
    url: body.url,
    likes: body.likes || 0,
  };

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
  });

  response.status(201).json(updatedBlog);
});

export default blogsRouter;
