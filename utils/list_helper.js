import map from "lodash/map.js";
import groupBy from "lodash/groupBy.js";
import maxBy from "lodash/maxBy.js";
import mapValues from "lodash/mapValues.js";
import sumBy from "lodash/sumBy.js";
import toPairs from "lodash/toPairs.js";

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum + blog.likes;
  };

  return blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  const max = blogs.reduce((prev, current) =>
    prev && prev.likes > current.likes ? prev : current
  );
  //console.log("max", blogs[max]);
  return max;
};

const mostBlogs = (blogs) => {
  const authors = groupBy(blogs, "author");

  const authorsWithBlogCount = map(authors, (blogs, author) => ({
    author,
    blogs: blogs.length,
  }));
  return maxBy(authorsWithBlogCount, "blogs");
};
const mostLikes = (blogs) => {
  const authors = groupBy(blogs, "author");

  const totalLikesByAuthor = mapValues(authors, (blogs) =>
    sumBy(blogs, "likes")
  );

  const mostLikedAuthor = maxBy(toPairs(totalLikesByAuthor), (pair) => pair[1]);

  return { author: mostLikedAuthor[0], likes: mostLikedAuthor[1] };
};
export { totalLikes, dummy, favoriteBlog, mostBlogs, mostLikes };
