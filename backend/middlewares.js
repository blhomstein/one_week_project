import jwt from 'jsonwebtoken'

import dotenv from 'dotenv'

dotenv.config();

function isAuth (req,res,next){
    
    const {authorization} = req.headers
    
    // console.log("THIS IS REQ HEADERS :???",authorization);

    if(!authorization){
        // console.log("auth")
        return res.status(401).json({message: "unauthorized"})
    }
    try {
        const token = authorization.split(' ')[1]
        // console.log("THIS IS THE TOKEN : ", token);

        // console.log("this is the process env babyyyyy!!! : ", process.env.JWT_ACCESS_TOKEN);
        const decoded = jwt.decode(token);
        // console.log("Decoded JWT Token (no verification): ", decoded);
        
        const payload = jwt.verify(token, process.env.JWT_ACCESS_TOKEN)

        // console.log("THIS IS THE PAYLOAD", payload);
        
        req.user = payload
        next()
        // return payload

    } catch (error) {
        if(error.name == "TokenExpiredError"){
            return res.status(401).json({message: "token has been expired"})
        }

       return res.status(500).json({message: "we've got an error"}) 
    }
}

export default isAuth