import express from 'express'
import cors from 'cors'

import serviceRouter from './services/auth/auth.routes.js'
import users from './services/user/users.routes.js'

import { db } from './utils/db.js';
import isAuth from './middlewares.js';



const app = express()

app.use(cors())
app.use(express.json())

app.use('/auth',serviceRouter)
app.use('/user', users)

app.get("/api", (req,res)=>{
    return res.send("hello from our server ;*")
})

app.post("/post",isAuth, async(req,res)=>{
    console.log("this is the req body : ",req.payload);
    try {
        
        
        const {title, content, scheduledFor, attachments, labels} = req.body

        if(!req.user || !req.user.userId){
            return res.status(401).json({message: "Unauth"})
        }
        if(!title || !content){
            return res.status(400).json({message: "you need title and content please"})
        }
        const newPost = await db.post.create({
            data: {
              title,
              content,
              published: false, // Default unless specified
              scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(), // Use provided date or default to now()
              authorId: userId,
              // Handle labels (if provided)
              labels: labels
                ? {
                    connectOrCreate: labels.map((label) => ({
                      where: { name: label.name },
                      create: { 
                        name: label.name, 
                        color: label.color || null 
                      },
                    })),
                  }
                : undefined,
              // Handle attachments (if provided)
              attachements: attachments
                ? {
                    create: attachments.map((file) => ({
                      filename: file.filename,
                      path: file.path,
                      mimetype: file.mimetype,
                      size: file.size,
                    })),
                  }
                : undefined,
            },
            include: {
              labels: true,    // Return labels in response
              attachements: true, // Return attachments in response
            },
          });
        return res.status(201).json({message: "blog was created successfully bro !", data: blog})
    } catch (error) {
        return res.status(500).json({message: "internal error happening, please try again ! "})
    }
})

app.get("/getAll", async (req,res)=>{
    console.log("this the request informations related to query : ", req.params);
    
    try {
        const blogs = await db.post.findMany()
        return res.status(201).json({data: blogs.length, blogs})
    } catch (error) {
        return res.status(500).json({message: "theres an internal error fetching blogs :/"})
    }
})

//get a single blog

// app.get("/get/:title", async(req,res)=>{

//     const {title} = req.params
//     try {
//         const blog = await db.post.findFirst({where: {title}})
//         if (blog) {

//             console.log("blog found !");
//             return res.status(201).json(blog)
            
            
//         } else {
//             return res.status(404).json({message: "blog not found"})
//         }
//     } catch (error) {
//         return res.status(500).json({message: "enternal error baby"})
//     }
// })

app.get("/get/:identifier",isAuth, async (req, res) => {
    const { identifier } = req.params;
    
    try {
      let post;
      const isNumeric = /^\d+$/.test(identifier);
  
      if (isNumeric) {
        // Search by ID 
        post = await db.post.findUnique({
          where: { id: identifier },
          include: { labels: true, attachements: true }
        });
      } else {
        // Search by title 
        post = await db.post.findFirst({
          where: {
            title: { contains: identifier, mode: 'insensitive' }
          },
          include: { labels: true, attachements: true }
        });
      }
  
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      return res.status(200).json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/post/:id", isAuth, async (req, res) => {
    const { id } = req.params;
    const { 
      title, 
      content, 
      status, 
      scheduledFor, 
      labels, 
      attachments 
    } = req.body;
  
    try {
      // 1. Validate status (if provided)
      if (status && ![ "IN_PROGRESS", "COMPLETED"].includes(status)) {
        return res.status(400).json({ 
          message: "Invalid status. Must be: TODO, IN_PROGRESS, or COMPLETED" 
        });
      }
  
      // 2. Build dynamic update data
      const updateData = {
        ...(title && { title }),
        ...(content && { content }),
        ...(status && { status }), // Now guaranteed valid
        ...(scheduledFor && { 
          scheduledFor: new Date(scheduledFor) 
        }),
        ...(labels && {
          labels: {
            connectOrCreate: labels.map((label) => ({
              where: { name: label.name },
              create: { 
                name: label.name, 
                color: label.color || null 
              },
            })),
          },
        }),
        ...(attachments && {
          attachements: {
            create: attachments.map((file) => ({
              filename: file.filename,
              path: file.path,
              mimetype: file.mimetype,
              size: file.size,
            })),
          },
        }),
      };
  
      // 3. Update the post
      const updatedPost = await db.post.update({
        where: { id },
        data: updateData,
        include: {
          labels: true,
          attachements: true,
        },
      });
  
      return res.status(200).json({
        message: "Post updated successfully",
        data: updatedPost,
      });
    } catch (error) {
      console.error("Update error:", error);
      return res.status(500).json({ 
        message: "Failed to update post" 
      });
    }
  });
app.delete("/delete/:id",isAuth, async (req,res)=>{
    const {id} = req.params
    console.log(req.params.id);
    
    const findPost = db.post.findFirst({
        where: {
            id: id
        }
    
    
    })
    console.log(findPost); 
    const postId = parseInt(id, 10);

    try {
        if (!findPost){
            return res.status(404).json({message: "theres no post with this id"})
        }
        await db.post.delete({
            where: {
                id: postId
            }
        })
        
        
        return res.status(201).json({message: "the user has been deleted"} )
        
    } catch (error) {
       return res.status(500).json({message: "there is an internal error"}) 
    }
})

app.listen(8080, ()=>{
    console.log("server is listening on port 8080 ;)");
    
})

