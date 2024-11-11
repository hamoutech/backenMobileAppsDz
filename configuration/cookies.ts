import { Request,Response } from "express";

const jwt = require("jsonwebtoken");
const SECRET_TOKEN = process.env.SECRET_TOKEN;
const COOKIES_CONFIGURATION:object = {
  maxAge: 1000 * 3600 * 2, 
  secure: false, 
  httpOnly: true, 
  sameSite: "lax",  
};

function  createRefreshToken(id:string) {
  return jwt.sign({ id }, SECRET_TOKEN, { expiresIn: "1d" });
}
exports.generateCookies = (id:string, res:Response) => {
  console.log(id);
  res.cookie("token", createRefreshToken(id), COOKIES_CONFIGURATION);
};
