const jwt = require("jsonwebtoken");

const SECRET_TOKEN = process.env.SECRET_TOKEN;
import { Response, NextFunction } from "express";
const createToken = (id:String) => jwt.sign({ id }, SECRET_TOKEN, { expiresIn: "1h" });

module.exports = async (req:any, res:Response, next:NextFunction) => {
  const token = req.header("Authorization");
  const refresh_token = req.cookies.refresh_token;

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(501).json({ message: "Unauthorized" });
  }

  const bearerToken = token.substring(7);

  try {
    let decodeToken = await jwt.verify(bearerToken, SECRET_TOKEN);

    if (!decodeToken) {
      const decodedRefreshToken = await jwt.verify(refresh_token, SECRET_TOKEN);

      if (!decodedRefreshToken) {
        throw new Error("Invalid refresh token");
      }

      const newAccessToken = createToken(decodedRefreshToken.id);

      res.setHeader("Authorization", `Bearer ${newAccessToken}`);

      // Continue with the request

      req.auth = { _id: decodedRefreshToken.id };
      req._id = decodedRefreshToken._id;
    } else {
      // Access token is still valid, continue with the request

      req.auth = { _id: decodeToken.id };
      req._id = decodeToken._id;
    }

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    } else {
      res.status(501).json({ error: "non autoriser" });
    }
  }
};

