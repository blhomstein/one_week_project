import { db } from '../../utils/db.js'
import { hashToken } from '../../utils/hashToken.js'


// creation of refresh token, if the user is inactive for 30days he will be prompted to login again
function addRefereshTokenToWhitelist({refreshToken, userId}){
    return db.refreshToken.create({
        data:{
            hashedToken: hashToken(refreshToken),
            userId,
            expireAt: new Date(Date.now() + 1000 *60*60*24*30)
        }
    })
}


// check if the token sent by client using http only cookies during request is there on db
function findRefreshToken(token){
    return db.refreshToken.findUnique({
        where:{
            hashedToken: hashToken(token)
        }
    })
}
// delete refresh token after usage 
function deleteRefreshTokenById(id){
    return db.refreshToken.update({
        where:{
            id,
        }, data : {
            revoked: true
        }
    })
}


// invalidate the refresh token, so if under any circumstances the invalidate refresh token history is needed
function revokeTokens(userId){
    return db.refreshToken.updateMany({
        where:{
            userId,
        },
        data:{
            revoked:true,
        }
    })
}

export {
    addRefereshTokenToWhitelist,
    findRefreshToken,
    deleteRefreshTokenById,
    revokeTokens
}
