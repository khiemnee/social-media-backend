import express from "express";
import User from "../models/user.js";
import auth from "../middleware/auth.js";
import multer from 'multer'
import sharp from "sharp";

const userRouter = express.Router();
const storage = multer.memoryStorage()
const upload = multer({
  dest: "avatars",
  limits: {
    fileSize: 3000000, // được tình bằng byte - 1 triệu byte = 1MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return cb(new Error("Please upload a file image"));
    }
    cb(undefined, true);
  },
  storage
});

userRouter.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    const token = await user.generateToken();
    await user.save();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(501).send(error.message);
  }
});

userRouter.post("/users/login", async (req, res) => {
  try {
    const user = await User.findCredential(req.body.email, req.body.password);
    await user.generateToken();

    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

userRouter.get("/users/me", auth, async (req, res) => {
  try {
    res.status(200).send(req.user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

userRouter.patch("/users/me", auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password"];

    const isValid = updates.every((values) => allowedUpdates.includes(values));

    if (!isValid) {
      return res.status(404).send({ error: "Invalid updates" });
    }

    updates.forEach((value) => (req.user[value] = req.body[value]));

    await req.user.save();

    res.status(200).send(req.user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

userRouter.delete("/users/me", auth, async (req, res) => {
  try {
    await User.deleteOne({ _id: req.user._id });
    res.status(200).send();
  } catch (error) {
    res.status(500).send;
  }
});

userRouter.post("/users/:id/toggleFollow", auth, async (req, res) => {
  try {
    const userFollow = await User.findById(req.params.id);

    if (!userFollow) {
      return res.status(404).send({ error: "unable to follow" });
    }

    if (userFollow._id === req.user._id) {
      return res.status(400).send({ error: "unable to follow myself" });
    }

    if (req.user.following.includes(userFollow._id)) {
      const userFollowingIndex = req.user.following.findIndex(
        (value) => value === userFollow._id
      );
      const userFollowerIndex = userFollow.followers.findIndex(
        (value) => value === req.user._id
      );

      req.user.following.splice(userFollowingIndex, 1);
      userFollow.followers.splice(userFollowerIndex, 1);

      await userFollow.save();
      await req.user.save();

      return res.status(200).send(req.user);
    }

    req.user.following.push(userFollow._id);
    userFollow.followers.push(req.user._id);

    await userFollow.save();
    await req.user.save();

    res.status(200).send(req.user);
  } catch (error) {
    res.status(501).send();
  }
});

userRouter.get("/users/me/following", auth, async (req, res) => {
  try {
    const user = await req.user.populate("following");

    res.status(200).send(user.following);
  } catch (error) {
    res.status(501).send();
  }
});

userRouter.get("/users/me/followers", auth, async (req, res) => {
  try {
    const userFollowers = await req.user.populate("followers");

    res.status(200).send(userFollowers);
  } catch (error) {
    res.status(501).send(error.message);
  }
});

userRouter.post(
  "/users/me/avatar",
  auth,
  upload.single("avatars"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    res.user.avatar = buffer
    await req.user.save();
    res.status(200).send();
  },
  (error, req, res, next) => {
    res.status(400).json({ error: error.message });
  }
);

userRouter.delete("/users/me/avatar", auth, async (req, res) => {
  try {
    res.user.avatar = undefined;
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

export default userRouter;
