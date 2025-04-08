import express from "express";
import isAuth from "../../middlewares.js";
import { findUserById } from "./users.services.js";

const router = express.Router();

router.get("/profile", isAuth, async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "theres some error here :/", error });
  }
});

export default router;
