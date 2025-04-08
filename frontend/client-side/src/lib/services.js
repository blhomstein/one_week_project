import {client} from "./axiosClient.js"
import axios from "axios"

export async function regiser ({name, email, password}){
    return client.post("/auth/register", {name, email, password})
}

export async function login({email, password}){
    return client.post("auth/login", {email, password})
}

export async function getProfile(){
    return client.get("/user/profile")
}

export async function getRoot(){
    axios.get("http://localhost:8080/");
}

export async function postLogin(email, password)  {
    await axios.post("http://localhost:8080/auth/login", {
        email,
        password
        
    });
}