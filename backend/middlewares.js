import jwt from "jsonwebtoken";

import dotenv from "dotenv";

dotenv.config();

function isAuth(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: "unauthorized" });
  }
  try {
    const token = authorization.split(" ")[1];

    const decoded = jwt.decode(token);

    const payload = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);

    req.user = payload;
    next();
  } catch (error) {
    if (error.name == "TokenExpiredError") {
      return res.status(401).json({ message: "token has been expired", error });
    }

    return res.status(500).json({ message: "we've got an error", error });
  }
}

export default isAuth;
