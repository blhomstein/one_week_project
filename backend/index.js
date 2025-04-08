import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";

import serviceRouter from "./services/auth/auth.routes.js";
import users from "./services/user/users.routes.js";

import { db } from "./utils/db.js";
import isAuth from "./middlewares.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/auth", serviceRouter);
app.use("/user", users);

app.use("/uploads", express.static("uploads"));

app.use((req, res, next) => {
  console.log("===== Incoming Request =====");
  console.log("Method:", req.method);
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Body keys:", Object.keys(req.body));
  next();
});

app.get("/", (req, res) => {
  return res.status(200).json({ msg: "you momma fat" });
});

app.post("/post", isAuth, upload.single("attachement"), async (req, res) => {
  try {
    const { title, content, scheduledFor, attachments, labels } = req.body;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauth" });
    }
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "you need title and content please" });
    }

    if (typeof labels === "string") {
      try {
        labels = JSON.parse(labels);
      } catch (err) {
        return res
          .status(400)
          .json({ message: "Labels should be valid JSON." });
      }
    }

    await db.post.create({
      data: {
        title,
        content,
        published: false, // Default unless specified
        scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(), // Use provided date or default to now()
        authorId: req.user.userId,
        // Handle labels (if provided)
        labels: labels
          ? {
              connectOrCreate: labels.map((label) => ({
                where: { name: label },
                create: {
                  name: label,
                  color: label.color || null,
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
        labels: true, // Return labels in response
        attachements: true, // Return attachments in response
      },
    });
    return res
      .status(201)
      .json({ message: "blog was created successfully bro !" });
  } catch (error) {
    return res.status(500).json({
      message: "internal error happening, please try again ! ",
      error,
    });
  }
});

app.get("/getAll", isAuth, async (req, res) => {
  try {
    const blogs = await db.post.findMany({
      where: {
        authorId: req.user.userId,
      },
      include: {
        labels: true,
        attachements: true,
      },
    });
    return res.status(201).json({ blogs });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "theres an internal error fetching blogs :/", error });
  }
});

app.get("/get/:identifier", isAuth, async (req, res) => {
  const { identifier } = req.params;

  try {
    let post;
    const isNumeric = /^\d+$/.test(identifier);

    post = await db.post.findUnique({
      where: { id: identifier },
      include: { labels: true, attachements: true },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
});

app.put("/put/:id", isAuth, async (req, res) => {
  const { id } = req.params;
  const { title, content, status, scheduledFor, labels, attachments } =
    req.body;

  try {
    // 1. Validate status (if provided)
    if (status && !["IN_PROGRESS", "COMPLETED"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be: TODO, IN_PROGRESS, or COMPLETED",
      });
    }

    // 2. Build dynamic update data
    const updateData = {
      ...(title && { title }),
      ...(content && { content }),
      ...(status && { status }), // Now guaranteed valid
      ...(scheduledFor && {
        scheduledFor: new Date(scheduledFor),
      }),
      ...(labels && {
        labels: {
          connectOrCreate: labels
            .filter((label) => label?.name)
            .map((label) => ({
              where: { name: label.name },
              create: {
                name: label.name,
                color: label.color || null,
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
    return res.status(500).json(
      {
        message: "Failed to update post",
      },
      error
    );
  }
});
app.delete("/delete/:id", isAuth, async (req, res) => {
  const { id } = req.params;

  const findPost = db.post.findFirst({
    where: {
      id: id,
    },
  });

  const postId = parseInt(id, 10);

  try {
    if (!findPost) {
      return res.status(404).json({ message: "theres no post with this id" });
    }
    await db.post.delete({
      where: {
        id: id,
      },
    });

    return res.status(201).json({ message: "the user has been deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "there is an internal error", error });
  }
});

app.listen(8080, () => {
  console.log("server is listening on port 8080 ;)");
});
