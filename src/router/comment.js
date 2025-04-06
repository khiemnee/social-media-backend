import express from "express";
import auth from "../middleware/auth.js";
import Post from "../models/post.js";
import Comment from "../models/comment.js";

const commentRouter = express.Router();

commentRouter.post("/posts/:id/comments", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const comment = new Comment({
      ...req.body,
      user: req.user._id,
      post: req.params.id,
    });

    if (!post) {
      return res.status(404).send({
        error: "post not found",
      });
    }

    post.comments.push(comment);

    await post.save();
    await comment.save();

    res.status(201).send(post.comments);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

commentRouter.get("/posts/:id/comments", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate({
      path: "comments.user",
    });
    if (!post) {
      return res.status(404).send({
        error: "post not found",
      });
    }
    res.send(post.comments);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

commentRouter.delete(
  "/posts/:id/comments/:commentId",
  auth,
  async (req, res) => {
    try {
      const comment = await Comment.findOne({
        _id: req.params.commentId,
        post: req.params.id,
        user: req.user._id,
      });
      const post = await Post.findOne({
        _id: req.params.id,
        owner: req.user._id,
      });

      if (!comment) {
        return res.status(404).send({
          error: "comment not found",
        });
      }

      if (!post) {
        return res.status(404).send({
          error: "post not found",
        });
      }

      const commentIndex = post.comments.findIndex((values) =>
        values._id.equals(comment._id)
      );

      if (commentIndex !== -1) {
        post.comments.splice(commentIndex, 1);
      }

      await Comment.deleteOne({ _id: comment._id });
      await post.save();

      res.send(post);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

commentRouter.patch(
  "/posts/:id/comments/:commentId",
  auth,
  async (req, res) => {
    try {
      const updates = Object.keys(req.body);
      const allowedUpdates = ["text"];

      const isValid = updates.every((values) =>
        allowedUpdates.includes(values)
      );

      if (!isValid) {
        return res.status(400).send({
          error: "please enter valid field",
        });
      }

      const comment = await Comment.findOne({
        _id: req.params.commentId,
        post: req.params.id,
        user: req.user._id,
      });
      const post = await Post.findOne({
        _id: req.params.id,
        owner: req.user._id,
      });

      if (!comment) {
        return res.status(404).send({
          error: "comment not found",
        });
      }

      if (!post) {
        return res.status(404).send({
          error: "post not found",
        });
      }

      const commentIndex = post.comments.findIndex((values) =>
        values._id.toString() === comment._id.toString()
      );

      console.log(commentIndex)

     

      if (commentIndex >= 0) {
        updates.forEach(
          (value) => (post.comments[commentIndex][value] = req.body[value])
        );
        updates.forEach((value) => (comment[value] = req.body[value]));
        await comment.save();
        await post.save();

        return res.send(post);
      }

      res.status(404).send();
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

export default commentRouter;
