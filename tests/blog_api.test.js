import { test, after, beforeEach, describe } from "node:test";

import assert from "node:assert";
import supertest from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import Blog from "../models/blog.js";
import User from "../models/user.js";
import helper from "./test_helper.js";
import bcrypt from "bcrypt";
const api = supertest(app);

let authToken;
beforeEach(async () => {
  await User.deleteMany({});
  await Blog.deleteMany({});

  const passwordHash = await bcrypt.hash("sekret", 10);
  const user = new User({ username: "root", passwordHash });
  await user.save();

  const loginResponse = await api
    .post("/api/login")
    .send({ username: "root", password: "sekret" });

  authToken = loginResponse.body.token;

  const blogs = helper.initialBlogs.map(
    (blog) => new Blog({ ...blog, user: user.id })
  );
  await Blog.insertMany(blogs);
  // for (let blog of helper.initialBlogs) {
  //   let blogObject = new Blog(blog);
  //   await blogObject.save();
  // }
});
describe("when there is initially one user in db", () => {
  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();
    const newUser = {
      username: "parisaka",
      name: "Parisa Kalaki",
      password: "1234",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);
    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "1234",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert(result.body.error.includes("expected `username` to be unique"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
});

describe("when there is initially some blogs saved", () => {
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs");

    assert.strictEqual(response.body.length, helper.initialBlogs.length);
  });
  test("a specific note is within the returned blogs", async () => {
    const response = await api.get("/api/blogs");
    const title = response.body.map((e) => e.title);
    assert(title.includes("React patterns"));
  });

  test("the unique identifier property of the blog posts is named id", async () => {
    const blogsAtstart = await helper.blogsInDb();
    const blog = blogsAtstart[0];
    const resultBlog = await api
      .get(`/api/blogs/${blog.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.ok(resultBlog.body.id);
  });

  describe("viewing a specific blog", () => {
    test("succeeds with a valid id", async () => {
      const blogsAtstart = await helper.blogsInDb();
      const blogToView = blogsAtstart[0];

      const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      assert.deepStrictEqual(resultBlog.body, blogToView);
    });

    test("fails with statuscode 404 if blog does not exist", async () => {
      const validNonexistingId = await helper.nonExistingId();

      await api.get(`/api/blogs/${validNonexistingId}`).expect(404);
    });
    test("fails with statuscode 400 id is invalid", async () => {
      const invalidId = "5a3d5da59070081a82a3445";

      await api.get(`/api/blogs/${invalidId}`).expect(400);
    });
  });
  describe("addition of a new blog", () => {
    test("succeeds with valid data", async () => {
      const newBlog = {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
      };

      await api
        .post("/api/blogs/")
        .set({ Authorization: `Bearer ${authToken}` })
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

      const titles = blogsAtEnd.map((r) => r.title);

      assert(titles.includes("Go To Statement Considered Harmful"));
    });

    test("fails with status code 401 if a token is not provided", async () => {
      const newBlog = {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
      };
      const response = await api.post("/api/blogs/").send(newBlog).expect(401); // Expecting 401 Unauthorized status code
    });
  });

  describe("deletion of a blog", () => {
    test("succeeds with status code 204 if id is valid", async () => {
      const blogsAtstart = await helper.blogsInDb();
      const blogToDelete = blogsAtstart[0];
      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set({ Authorization: `Bearer ${authToken}` })
        .expect(204);

      const blogsAtEnd = await helper.blogsInDb();
      const titles = blogsAtEnd.map((r) => r.title);
      assert(!titles.includes(blogToDelete.title));

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);
    });
  });

  describe("updation of a blog", () => {
    test("succeeds with status code 201 if id is valid", async () => {
      const blogsAtstart = await helper.blogsInDb();
      const blogToUpdate = blogsAtstart[0];
      const updateBlog = {
        likes: 35,
      };

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .set({ Authorization: `Bearer ${authToken}` })
        .send(updateBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();

      const likes = blogsAtEnd.map((r) => r.upvote);
      assert(likes.includes(blogToUpdate.upvote));

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
    });
  });

  describe("blog without", () => {
    test("likes, it will default to the value 0", async () => {
      const newBlog = {
        title: "Test Blog Post",
        author: "Test Author",
        url: "https://example.com",
      };
      await api
        .post("/api/blogs")
        .set({ Authorization: `Bearer ${authToken}` })
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

      const likes = blogsAtEnd.map((r) => r.likes);

      assert(likes.includes(0));
    });
    test("title or url, it responds with status code 400 Bad Request.", async () => {
      const newBlog = {
        author: "Test Author",
        likes: 12,
      };
      await api
        .post("/api/blogs")
        .set({ Authorization: `Bearer ${authToken}` })
        .send(newBlog)
        .expect(400);

      const blogsAtEnd = await helper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
    });
  });

  after(async () => {
    await mongoose.connection.close();
  });
});
