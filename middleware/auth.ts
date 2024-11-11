const jwt = require("jsonwebtoken");
const SECRET_TOKEN = process.env.SECRET_TOKEN;
import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongoose";
const Soccer = require("../models/auth.model");
interface e extends Request {
  cookies: { refresh_token: string };
  auth: object;
  _id: ObjectId;
}
module.exports = async (req: e, res: Response, next: NextFunction) => {

  const token = req.header("Authorization");
  const refresh_token = req.cookies.refresh_token;
  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const bearerToken = token.substring(7);
  try {
    let decodeToken = await jwt.verify(bearerToken, SECRET_TOKEN);
    if (!decodeToken){
      const decodedRefreshToken = await jwt.verify(refresh_token, SECRET_TOKEN);

    if (!decodedRefreshToken) {
      throw new Error("Invalid refresh token");
    }

    const newAccessToken = createToken(decodedRefreshToken.id);

    res.setHeader("Authorization", `Bearer ${newAccessToken}`);

    // Continue with the request
    const soccer = await Soccer.findById({ _id: decodedRefreshToken.id });

    req.auth = { _id: decodedRefreshToken.id, type: soccer.type };
    req._id = decodedRefreshToken._id;
  }else{
// Access token is still valid, continue with the request
const soccer = await Soccer.findById({ _id: decodeToken.id });

req.auth = { _id: decodeToken.id, type: soccer.type };
req._id = decodeToken._id;
  }
    next();
  } catch (error) {
    res.status(501).json({ error: "non autoriser" });
  }
};
function  createToken(id:string) {
  return jwt.sign({ id }, SECRET_TOKEN, { expiresIn: "2h" });
}
