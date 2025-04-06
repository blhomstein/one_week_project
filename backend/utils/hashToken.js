import { createHash } from 'crypto'

function hashToken(token){
    return createHash('sha512').update(token).digest('hex')
}

export  {hashToken}