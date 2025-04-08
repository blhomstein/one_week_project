import React, { useState,useEffect } from 'react';
import {client }from "../lib/axiosClient.js"
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { getRoot, postLogin } from '@/lib/services.js';
import axios from 'axios';




const AuthPages = () => {




  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
const [loginPassword, setLoginPassword] = useState("");

// Register form state
const [registerName, setRegisterName] = useState("");
const [registerEmail, setRegisterEmail] = useState("");
const [registerPassword, setRegisterPassword] = useState("");
const [loading, setLoading] = useState(false)

const navigate = useNavigate()


useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    setLoading(false);
    return;
  }

  axios.get(`${baseUrl}/users/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then((res) => {
    setUser(res.data);
  })
  .catch(() => {
    localStorage.removeItem('token');
  })
  .finally(() => {
    setLoading(false);
  });
}, []);


const handleLogin = async () =>{
  console.log("i get ran");
  
    try {
      console.log("i get ran2");
      const res =   await axios.post("http://localhost:8080/auth/login",{
        email: loginEmail,
        password: loginPassword
      });
      console.log(res);
      
      const {accessToken, refreshToken} = res.data
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
      navigate("/dashboard")
    } catch (error) {
        console.log("login failed : ", error || "server error")
    }
}

const handleRegister = async()=>{
    try {
        const res = await axios.post("http://localhost:8080/auth/register", {
            name : registerName,
            email: registerEmail,
            password: registerPassword
        })

        const {accessToken, refreshToken} = res.data

        localStorage.setItem("accessToken", accessToken)
        localStorage.setItem("refreshToken", refreshToken)
        navigate("/dashboard")
    } catch (error) {
        
      console.log("Registration failed: ", error.response?.data?.message  || "server error baby")
    }
}
  
  
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          {/* Login Tab */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Welcome back</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="user@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={isPasswordVisible ? "text" : "password"} 
                      placeholder="••••••••"
                      value={loginPassword} 
                      onChange={(e) =>{setLoginPassword(e.target.value)}}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={togglePasswordVisibility}
                    >
                      {isPasswordVisible ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {isPasswordVisible ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleLogin}>Sign in</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Register Tab */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Create an account</CardTitle>
                <CardDescription>
                  Enter your details to create your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName"> Name</Label>
                    <Input id="firstName" value={registerName} onChange={(e) => setRegisterName(e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-register">Email</Label>
                  <Input id="email-register" type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} />
                  </div>
                <div className="space-y-2">
                  <Label htmlFor="password-register">Password</Label>
                  <div className="relative">
                  <Input id="password-register" type={isPasswordVisible ? "text" : "password"} value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} />

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={togglePasswordVisibility}
                    >
                      {isPasswordVisible ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {isPasswordVisible ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Password must be at least 8 characters with a number and a special character
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleRegister}>Create account</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPages;