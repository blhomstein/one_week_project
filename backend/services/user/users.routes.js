import express from 'express'
import isAuth from '../../middlewares.js'
import { findUserById } from './users.services.js'

const router = express.Router()

router.get('/profile', isAuth, async (req,res)=>{
    console.log("from user routes", req.user);
    
    try {
        const {userId} = req.user
        console.log("this is the user id ", userId);
        
        const user = await findUserById(userId)
        console.log("this is user relaated informations", user);
        
        // delete user.password
        return res.json(user)
    } catch (error) {
        return res.status(500).json({message: "theres some error here :/"})
    }
})

export default router