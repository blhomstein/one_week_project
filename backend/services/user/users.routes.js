import express from 'express'
import isAuth from '../../middlewares.js'
import { findUserById } from './users.services.js'

const router = express.Router()

router.get('/profile', isAuth, async (req,res)=>{
    console.log("from user routes", req.payload);
    
    try {
        const {userId} = req.payload
        const user = await findUserById(userId)
        delete user.password
        res.json(user)
    } catch (error) {
        res.status(500).json({message: "theres some error here :/"})
    }
})

export default router