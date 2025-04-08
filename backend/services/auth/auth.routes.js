import express from "express";
import Joi from "joi";
import bcrypt from "bcrypt";

import { generateTokens } from "../../utils/jwt.js";

import {
  addRefereshTokenToWhitelist,
  findRefreshToken,
  deleteRefreshTokenById,
  revokeTokens,
} from "../auth/auth.services.js";

const router = express.Router();

import {
  findUserByEmail,
  createUserByEmailAndPassword,
  findUserById,
} from "../user/users.services.js";

const registratioSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
  name: Joi.string().alphanum().min(3).max(30).required(),
});

router.post("/register", async (req, res, next) => {
  try {
    const { err } = registratioSchema.validate(req.body);
    if (err) {
      return res.status(400).json({ message: err.details[0].message });
    }
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "please provide all necessary informations" });
    }
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "email already there" });
    }

    const user = await createUserByEmailAndPassword({ email, password, name });

    const { accessToken, refreshToken } = generateTokens(user);

    await addRefereshTokenToWhitelist({ refreshToken, userId: user.id });

    return res.json({ accessToken, refreshToken });
  } catch (error) {
    return res.status(500).json({
      message: "theres an internal error please try again later",
      error,
    });
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: "please provide email and password in order to connect",
      });
    }

    const existingUser = await findUserByEmail(email);

    if (!existingUser) {
      res.status(404).json({ message: "user is not here sorry ://" });
    }

    const validPass = await bcrypt.compare(password, existingUser.password);

    if (!validPass) {
      res.status(403).json({ message: "incorrect password" });
    }

    const { refreshToken, accessToken } = generateTokens(existingUser);

    await addRefereshTokenToWhitelist({
      refreshToken: refreshToken,
      userId: existingUser.id,
    });

    return res.json({ accessToken, refreshToken });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "sorry theres an error ://", error });
  }
});

router.post("/refreshToken", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ message: "missing refresh token" });
    }

    const verifyRefreshToken = await findRefreshToken(refreshToken);
    if (
      !verifyRefreshToken ||
      verifyRefreshToken.revoked == true ||
      Date.now() >= verifyRefreshToken.expireAt.getTime()
    ) {
      res.status(401).json({ message: "unauth" });
    }

    const user = await findUserById(verifyRefreshToken.userId);
    if (!user) {
      res.status(401).json({ message: "unauth" });
    }

    await deleteRefreshTokenById(verifyRefreshToken.id);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    await addRefereshTokenToWhitelist({
      refreshToken: newRefreshToken,
      userId: user.id,
    });

    return res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "sorry bud but theres some internal error", error });
  }
});

export default router;
