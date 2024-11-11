import { Request, Response } from "express";
import { ObjectId } from "mongoose";
const bcrypt = require("bcrypt");
const Soccer = require("../models/auth.model");
interface k extends Request {
  auth: { _id: ObjectId; type: number };
}

exports.account = async (req: k, res: Response) => {

  const isEmpty = (field: string) => {
    return !field || field.trim() === "";
  };

  const { lastName, firstName, email, password, confirmPassword, phoneNumber } =
    req.body;

  const fieldsToCheck = [
    { field: lastName, name: "lastName" },
    { field: firstName, name: "firstName" },
    { field: email, name: "email" },
    { field: password, name: "password" },
    { field: confirmPassword, name: "confirmPassword" },
    { field: phoneNumber, name: "phoneNumber" },
  ];

  for (const fieldInfo of fieldsToCheck) {
    if (isEmpty(fieldInfo.field)) {
      return res
        .status(400)
        .json({ error: `Le champ ${fieldInfo.name} est vide` });
    }
  }

  try {
    if (req.auth.type !== 2)
      return res.status(403).json({ message: "non autoriser" });
    const emailValide=verifierEmail(req.body.email);
    if(!emailValide) return res.status(400).json({error:"invalide email"});
    const soccer = await Soccer.findOne({ email: req.body.email });
    if (soccer) return res.status(401).json({ error: "email existe déjà " });
    if (req.body.password !== req.body.confirmPassword)
      return res.status(404).json({
        error:
          "le mot de passe et le mot de passe de confirmation sont diffirents",
      });
    req.body.password = await bcrypt.hash(req.body.password, 10);
    req.body.confirmPassword = await bcrypt.hash(req.body.confirmPassword, 10);

    const soccer1 = new Soccer({
      lastName: req.body.lastName,
      firstName: req.body.firstName,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      phoneNumber: req.body.phoneNumber,
      type: 2,
      role: "ADMIN",
    });
    await soccer1.save();
    res.status(201).json({ message: "le compte est créer" });
  } catch (error) {
    console.log(error, "error");
    res.status(500).json({ error: "erreur de serveur" });
  }
};
exports.setAdmin = async (req: k, res: Response) => {

  try {
    if (req.auth.type !== 2)
      return res.status(403).json({ message: "non autoriser" });
   
    if (req.body.password !== req.body.confirmPassword)
      return res.status(404).json({
        error:
          "le mot de passe et le mot de passe de confirmation sont diffirents",
      });
    const soccer1 = await Soccer.findOne({ _id: req.auth._id })
    if (req.body.lastName){
    soccer1.lastName=req.body.lastName    
    }else{
      soccer1.lastName=soccer1.lastName
    }
  if (!req.body.firstName){
    soccer1.firstName=req.body.firstName
  }else{
    soccer1.firstName=soccer1.firstName
  }
  if (req.body.email){
    const emailValide=verifierEmail(req.body.email);
    if(!emailValide) return res.status(400).json({error:"invalide email"});
    if (req.body.email===soccer1.email) {
      soccer1.email=soccer1.email
    } else {
      const soccer = await Soccer.findOne({ email: req.body.email });
    if (soccer) return res.status(401).json({ error: "email existe déjà " });
    soccer1.email=req.body.email
    }
    
  }else{
    soccer1.email=soccer1.email
  }
  
  if (req.body.password){
    req.body.password = await bcrypt.hash(req.body.password, 10);
    soccer1.password=req.body.password
  }else{
    soccer1.password=soccer1.password
  }
  
  if (req.body.confirmPassword){
    req.body.confirmPassword = await bcrypt.hash(req.body.confirmPassword, 10);
    soccer1.confirmPassword=req.body.confirmPassword
  }else{
    soccer1.confirmPassword=soccer1.confirmPassword
  }
    
  if (req.body.phoneNumber){
    soccer1.phoneNumber=req.body.phoneNumber
  }else{
    soccer1.phoneNumber=soccer1.phoneNumber
  }
  
    soccer1.type = 2;
    soccer1.role = "ADMIN";
    await soccer1.save();
  if ((!req.body.phoneNumber)&&(!req.body.confirmPassword)&&(!req.body.password)&&(!req.body.email)&&(!req.body.firstName)&&(!req.body.lastName)) {
    return res.status(403).json({ error: "veuillez modifier au moins un seul champ" });
  } else {
    res.status(201).json({ message: "votre compte a était bien modifier",id:req.auth._id });
  }
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};
function verifierEmail(email:string){
  const regex=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
}