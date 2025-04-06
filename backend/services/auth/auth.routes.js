import express from 'express'
import Joi from 'joi'
import bcrypt from 'bcrypt'

import { generateTokens } from '../../utils/jwt.js'

import { addRefereshTokenToWhitelist, findRefreshToken, deleteRefreshTokenById, revokeTokens } from '../auth/auth.services.js'

const router = express.Router()

import { findUserByEmail, createUserByEmailAndPassword, findUserById } from '../user/users.services.js'

const registratioSchema = Joi.object({
    email: Joi.string().email({minDomainSegments: 2, tlds:{allow:['com', 'net']}}).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    name: Joi.string().alphanum().min(3).max(30).required()
})

router.post('/register', async (req, res, next)=>{
    console.log("im heerreee");
    
    try {
        console.log("1");
        
        const {err} = registratioSchema.validate(req.body)
        if(err){
            return res.status(400).json({message: err.details[0].message})
        }
        const {email,password,name} = req.body
        if(!email || !password || !name){
            return res.status(400).json({message: "please provide all necessary informations"})
        }
        const existingUser = await findUserByEmail(email)
        if(existingUser){
            return res.status(400).json({message: 'email already there'})
        }
        console.log("2");
        const user = await createUserByEmailAndPassword({email, password, name})
        console.log("from auth routes", user);
        
        console.log("3");
        const {accessToken, refreshToken} = generateTokens(user)
        console.log("4");
        await addRefereshTokenToWhitelist({refreshToken, userId: user.id})
        console.log("5");

        return res.json({accessToken, refreshToken})
    } catch (error) {
        return res.status(500).json({message: "theres an internal error please try again later"})
    }
})

router.post('/login', async(req,res,next)=>{
    console.log("1");
    
    try {
        const {email,password} = req.body
        console.log(email, password);
        
        if(!email || !password) {
            res.status(400).json({message: "please provide email and password in order to connect"})
        }
        console.log("2");
        const existingUser = await findUserByEmail(email)
        console.log(existingUser);
        if(!existingUser){
            res.status(404).json({message: "user is not here sorry ://"})
        }
        console.log("3");
        const validPass = await bcrypt.compare(password, existingUser.password)
        console.log("this is bcrypt", validPass);
        if(!validPass){
            res.status(403).json({message: "incorrect password"})
        }
        console.log("4");
        const {refreshToken, accessToken} = generateTokens(existingUser)
        console.log("5");
        await addRefereshTokenToWhitelist({refreshToken: refreshToken, userId: existingUser.id})
        console.log("6");
        res.json({accessToken, refreshToken})

    } catch (error) {
        return res.status(500).json({message: "sorry theres an error ://"})
    }
})

router.post('/refreshToken', async (req,res)=>{
    try {
        const {refreshToken} = req.body
        if(!refreshToken){
            res.status(400).json({message: "missing refresh token"})
        }

        const verifyRefreshToken = await findRefreshToken(refreshToken)
        if(!verifyRefreshToken || verifyRefreshToken.revoked == true || Date.now()>= verifyRefreshToken.expireAt.getTime() ){
            res.status(401).json({message :"unauth"})
        }
        console.log("this is the refresh token informations : ", verifyRefreshToken)
        const user = await findUserById(verifyRefreshToken.userId)
        if(!user){
            res.status(401).json({message: "unauth"})
        }

        await deleteRefreshTokenById(verifyRefreshToken.id)
        const {accessToken, refreshToken: newRefreshToken} =  generateTokens(user)
        console.log("this is the new refreshtoken", newRefreshToken);

        console.log("THIS IS THE USER INFORMATIONS : ", user);
        
        
        await addRefereshTokenToWhitelist({refreshToken: newRefreshToken, userId: user.id})
        console.log("this is after adding the new refresh token to the whitelist");
        
        return res.json({accessToken, refreshToken: newRefreshToken})
    } 
    catch (error) {
        return res.status(500).json({message: "sorry bud but theres some internal error"})
    }
})


// module.exports = router
export default router