import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  author: {
    type: String,
    minlength: 1,
    required: true,
  },
  title: {
    type: String,
    minlength: 1,
    required: true,
  },
  url: {
    type: String,
    minlength: 1,
    required: true,
  },
  likes: {
    type: Number,
    minlength: 1,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

blogSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.user = returnedObject.user?.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

export default mongoose.model("Blog", blogSchema);
