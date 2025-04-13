import jwt from 'jsonwebtoken';
import crypto, { sign } from 'crypto';
import dotenv from 'dotenv';

// dotenv.config({ path: "./.env" });

function generateAccessToken(user) {
  const signature = jwt.sign(
    { userId: user.id },
    process.env.JWT_ACCESS_TOKEN,
    {
      expiresIn: '90min',
    }
  );

  return signature;
}

function generateRefereshToken() {
  const token = crypto.randomBytes(16).toString('base64url');
  return token;
}

function generateTokens(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefereshToken();
  return { accessToken, refreshToken };
}

export { generateAccessToken, generateRefereshToken, generateTokens };
