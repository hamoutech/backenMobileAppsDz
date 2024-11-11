const jwt = require("jsonwebtoken");
import { ObjectId } from "mongoose";
import { Request, Response, NextFunction } from "express";
const SECRET_TOKEN = process.env.SECRET_TOKEN;
interface e extends Request {
  cookies: { refresh_token: string };
  auth: object;
  _id: ObjectId;
}
exports.refresh = async (req: e, res: Response) => {
  try {
    const cookies = req.header("Authorization");
    if (!cookies)
      return res.sendStatus(401).json({ error: "no refresh token sent" });
    const refreshToken = cookies?.substring(7);
    const decodedRefreshToken = await jwt.verify(refreshToken, SECRET_TOKEN);
    if (!decodedRefreshToken) {
      res.sendStatus(403).json({ error: "not allow." });
    }
    const newAccessToken = createToken(decodedRefreshToken.id);
    const newRefreshToken = createRefreshToken(decodedRefreshToken.id);
    res.status(200).json({ newAccessToken, newRefreshToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};

function createToken(id: string) {
  return jwt.sign({ id }, SECRET_TOKEN, { expiresIn: "2h" });
}
function createRefreshToken(id: string) {
  return jwt.sign({ id }, SECRET_TOKEN, {
    expiresIn: "1d",
  });
}
