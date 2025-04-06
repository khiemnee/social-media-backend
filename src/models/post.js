import mongoose from "mongoose";

const postSchmea = mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  images: [
    {
      type: Buffer,
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      text: String,
      createdAt: { type: Date, default: Date.now },
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
});



const Post = mongoose.model("Post", postSchmea);
export default Post;
