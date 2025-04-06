import {client} from "./axiosClient.js"

export function regiser ({name, email, password}){
    return client.post("/auth/register", {name, email, password})
}

export function login({email, password}){
    return client.post("auth/login", {email, password})
}

export function getProfile(){
    return client.get("/user/profile")
}