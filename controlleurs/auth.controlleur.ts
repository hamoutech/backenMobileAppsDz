const nodemailer1 = require("../configuration/nodemailer");
import { Request,Response } from "express";
import mongoose from "mongoose";
import { ObjectId } from "mongoose";
const bcrypt = require("bcrypt");
const Soccer = require("../models/auth.model");
const { generateCookies } = require("../configuration/cookies");
const URL_RESET_PASSWORD= process.env.URL_RESET_PASSWORD
const otpGenerator= require("otp-generator")
const jwt = require("jsonwebtoken");
const SECRET_TOKEN = process.env.SECRET_TOKEN;
interface k extends Request {
  auth: { _id: ObjectId};
}
exports.register = async (req:Request, res:Response) => {
  if (
    !req.body.lastName ||
    !req.body.firstName||
    !req.body.email ||
    !req.body.password ||
    !req.body.confirmPassword||
    !req.body.phoneNumber
  )
    return res.status(400).json({ error: "le champ est vide" });
  const emailValide=verifierEmail(req.body.email);
  if(!emailValide) return res.status(400).json({error:"invalide email"});
  try {
    const soccer = await Soccer.findOne({ email: req.body.email });
    if (soccer)
      return res.status(401).json({ error: "email existe déjà " });
    if (req.body.password !== req.body.confirmPassword)
      return res.status(400).json({
        error:
          "le mot de passe et le mot de passe de confirmation sont diffirents",
      });
    req.body.password = await bcrypt.hash(req.body.password, 10);
    req.body.confirmPassword = await bcrypt.hash(req.body.confirmPassword, 10);
    const soccer1 = new Soccer({
      lastName: req.body.lastName,
      firstName:req.body.firstName,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      phoneNumber: req.body.phoneNumber

    });
    await soccer1.save();
    res.status(201).json({ message: "le compte est créer" });
  } catch (error) {
    console.log(error,"error");
    res.status(500).json({ error: "erreur de serveur", });
  }
};
exports.login = async (req:Request, res:Response) => {
  try {
    if (
      !req.body.email ||
      !req.body.password 
    )
      return res.status(400).json({ error: "le champ est vide" });
      
    const soccer = await Soccer.findOne({ email: req.body.email });

    if (!soccer)
      return res.status(404).json({ error: "utilisateur n'éxiste pas" });

    const valide_pass = await bcrypt.compare(req.body.password, soccer.password);

    if (!valide_pass)
      return res.status(401).json({ error: "erreur de connexion" });

       generateCookies(soccer._id, res);

    const token=  createToken(soccer._id)
    const refresh_token = createRefreshToken(soccer._id);
     res.status(200).json({
      message: "vous etes bien connecté",lastName:soccer.lastName,firstName:soccer.firstName,token:token,refresh_token:refresh_token,role:soccer.role,id:soccer._id
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};
exports.forgetPassword= async (req:Request,res:Response)=>{
  try {
    const soccer = await Soccer.findOne({ email: req.body.email });

    if (!soccer)
      return res.status(404).json({ error: "utilisateur n'éxiste pas" });
      generateCookies(soccer._id, res);
   const token=req.cookies.token
   const emailValid = await nodemailer1.sendNewPassword(soccer.email,token );
   if (!emailValid)
      return res.status(400).json({ error: "L'email n'as pas était envoyer" });
      soccer.resetLink=URL_RESET_PASSWORD+token ;

      await soccer.save();
    res.status(200).json({
      message: "Le lien de réinitialisation de mot de passe a était envoyer sur votre email",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};
exports.resetPassword=async(req:Request,res:Response)=>{
  try {
    if(!req.body.resetLink) return res.status(403).json({error:"resetLink est vide"})
    const soccer = await Soccer.findOne({ resetLink: req.body.resetLink });

    if (!soccer)
      return res.status(404).json({ error: "utilisateur n'éxiste pas" });
      if (!req.body.password)
      return res
        .status(401)
        .json({ error: "Le nouveau mot de passe est vide" });
    if (req.body.password !== req.body.confirmPassword)
      return res.status(400).json({
        error:
          "le nouveau mot de passe et le nouveau mot de passe de confirmation sont diffirents",
      });
    soccer.password = await bcrypt.hash(req.body.password, 10);
    soccer.confirmPassword = await bcrypt.hash(req.body.confirmPassword, 10);
    soccer.resetLink = null;
    await soccer.save();
    return res.status(201).json({
      message: "votre mot de passe a était modifier correctement",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
}
exports.createCode = async (req:Request, res:Response) => {
  try {
    const soccer = await Soccer.findOne({ email: req.body.email });
    if (!soccer)
      return res.status(404).json({ error: "utilisateur n'éxiste pas" });
      const code= otpGenerator.generate(8, { Number:true, specialChars: false});
      const emailValid = await nodemailer1.sendNewPassword(soccer.email, code);
    
    if (!emailValid)
      return res.status(500).json({ error: "L'email n'as pas était envoyer" });
  
    await soccer.save();
    res.status(201).json({
      message: "votre code de confirmation a était envoyer sur votre email",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};
exports.verifierEmail = async (req:Request, res:Response) => {
  try {
    const soccer = await Soccer.findOne({ email: req.body.email });
    if (!soccer)
      return res.status(404).json({ error: "utilisateur n'éxiste pas" });
    if (!soccer.code) return res.status(400).json({ error: "Bad request" });
    
    if (req.body.code !== soccer.code) {
      soccer.code = null;
      soccer.save();
      return res.status(403).json({
        error:
          "le code de confirmation est faux, veuiller cliquer sur renvoyer à nouveau un autre code",
      });
    }
    res.status(200).json({
      message:
        "Votre email est valide",
    });
    soccer.verified=true
    soccer.code=null,
    soccer.save();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};
exports.getUsers = async (req:Request, res:Response) => {
  try {
    const soccer = await Soccer.find()
      .select("-password -__v -confirmPassword -type")
      .populate("club","-__v -email -adress -photo -createdBy" );
    res.status(200).json(soccer);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};
exports.getUser = async (req:k, res:Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: " L'id est invalide" });

    let soccer = await Soccer.findOne({ _id: req.params.id })
      .select("-password -__v -confirmPassword -type")
      .populate("club", "-__v -email -adress -photo -createdBy");

    if (!soccer) return res.status(404).json({ message: "le club n'éxiste pas" });
    res.status(200).json(soccer);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};
exports.profil= async (req:k, res:Response) => {
  try {
    const soccer = await Soccer.findOne({ _id: req.auth._id }).select("-password -__v -confirmPassword -type").populate(
      "club","-__v  -createdBy"
    );
    res.status(200).json(soccer);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};

function  createToken(id:string) {
  return jwt.sign({ id }, SECRET_TOKEN, { expiresIn: "2h" });
}
function createRefreshToken(id:string){
  return jwt.sign({id}, SECRET_TOKEN, {
    expiresIn: "1d",
  });
};
function verifierEmail(email:string){
  const regex=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
}