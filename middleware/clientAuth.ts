const jwt = require("jsonwebtoken");
const SECRET_TOKEN = process.env.SECRET_TOKEN;
import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongoose";
interface e extends Request {
  cookies: { refresh_token: string };
  auth: object;
  _id: ObjectId;
}
module.exports = async (req: e, res: Response, next: NextFunction) => {
  const token = req.header("Authorization") || req.header("authorization");
  const isRefresh = req.header("RefreshT") || req.header("refresht");
  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const bearerToken = token.substring(7);
  try {
    let decodeToken = await jwt.verify(bearerToken, SECRET_TOKEN);
    // Access token is still valid, continue with the request
    req.auth = { _id: decodeToken.id };
    next();
  } catch (error) {
    if (isRefresh) {
      res.status(403).json({
          error: "not allow.",
          rtChecked: true,
        }); /*invalid refreshtoken*/
    } else {
      res.status(403).json({ error: "not allow." }); //invalid token
    }
  }
};
