// const jwt = require('jsonwebtoken')
// const crypto = require('crypto')
// const { access } = require('fs')

import jwt from 'jsonwebtoken'
import crypto, { sign } from 'crypto'
import dotenv from 'dotenv'

dotenv.config({ path: './.env' });

function generateAccessToken (user){
    console.log("im in generate access token function ", process.env.DATABASE_URL, "and", process.env.JWT_ACCESS_TOKEN);
    const signature = jwt.sign({userId: user.id}, process.env.JWT_ACCESS_TOKEN,{
        expiresIn: '5min'
    })

    console.log("this is the signature", jwt.decode(signature));
    
    return signature
}

function generateRefereshToken(){
    const token = crypto.randomBytes(16).toString('base64url')
    return token
}

function generateTokens(user){
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefereshToken()
    return {accessToken, refreshToken}
}

export {
    generateAccessToken,
    generateRefereshToken,
    generateTokens
}