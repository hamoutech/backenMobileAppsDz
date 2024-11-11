import { Request, Response } from "express";
import mongoose from "mongoose";
import { ObjectId } from "mongoose";
const Club = require("../models/club.model");
const Admin = require("../models/admin.model")
const bcrypt = require("bcrypt");
const { generateCookies } = require("../configuration/cookies");
const jwt = require("jsonwebtoken");
const SECRET_TOKEN = process.env.SECRET_TOKEN;
interface k extends Request {
  auth: { _id: ObjectId };
}
exports.register = async (req: Request, res: Response) => {
  if (!req.body.name)
    return res.status(400).json({ error: "the name is empty" });
  if (!req.body.headName)
    return res.status(400).json({ error: "the headName is empty" });
  if (!req.body.email)
    return res.status(400).json({ error: "the email is empty" });
  if (!req.body.description)
    return res.status(400).json({ error: "the description is empty" });
  if (!req.body.address)
    return res.status(400).json({ error: "the address is empty" });
  if (!req.body.phoneNumber)
    return res.status(400).json({ error: "the phone number is empty" });
  const imageFiles = (
    req.files as { [fieldname: string]: Express.Multer.File[] }
  )["image"];
  if (!imageFiles) return res.status(400).json({ error: "the image is empty" });
  if (!req.body.createdDate)
    return res.status(400).json({ error: "the createdDate is empty" });
  if (!req.body.password)
    return res.status(400).json({ error: "the password is empty" });
  const description = req.body.description;
  if (description.length < 6)
    return res
      .status(400)
      .json({ error: "the description must have at least 6 characters" });
  const emailValide = verifierEmail(req.body.email);
  if (!emailValide) return res.status(400).json({ error: "invalid email" });
  const motDePasseValide = verifierMotDePasse(req.body.password);
  if (!motDePasseValide)
    return res.status(400).json({
      error:
        "the password must contain at least one capital letter and a minimum length of 6 characters",
    });
  const club = await Club.findOne().or([
    { email: req.body.email },
    { name: req.body.name },
  ]);
  if (club) {
    return res
      .status(400)
      .json({ error: "Club with this email or name already exists." });
  }
  try {
    req.body.password = await bcrypt.hash(req.body.password, 10);

    const club1 = new Club({
      name: req.body.name,
      headName: req.body.headName,
      email: req.body.email,
      description: req.body.description,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      image: imageFiles,
      password: req.body.password,
      createdDate: new Date(req.body.createdDate),
      status: "PENDING",
    });
    await club1.save();

    res.status(201).json({
      message: "the account is created",
      name: club1.name,
      headName: club1.headName,
      email: club1.email,
      description: club1.description,
      address: club1.address,
      phoneNumber: club1.phoneNumber,
      photo: club1.photo,
      color: club1.color,
      createdDate: club1.createdDate,
      status: club1.status,
      _id: club1._id,
    });
  } catch (error) {
    console.log(error, "error");
    res.status(500).json({ error: "erreur de serveur" });
  }
};

exports.login = async (req: Request, res: Response) => {
  try {
    if (!req.body.email || !req.body.password)
      return res.status(400).json({ error: "the field is empty" });

    const club = await Club.findOne({ email: req.body.email });

    if (club) {

    const valide_pass = await bcrypt.compare(req.body.password, club.password);

    if (!valide_pass) return res.status(401).json({ error: "Connexion error" });

    if (club.status !== "VALIDATED")
      return res.status(501).json({
        error:
          "You are not authorized, please wait for validation from the administrators.",
        status: club.status,
      });
    generateCookies(club._id, res);

    const token = createToken(club._id);
    const refresh_token = createRefreshToken(club._id);
    res.status(200).json({
      message: "you are well connected",
      name: club.name,
      headName: club.headName,
      email: club.email,
      description: club.description,
      address: club.address,
      phoneNumber: club.phoneNumber,
      photo: club.photo,
      createdDate: club.createdDate,
      token: token,
      refresh_token: refresh_token,
      id: club._id,
      status: club.status,
      superadmin:true
    });}
    else {
    const admin = await Admin.findOne({email:req.body.email}) ;
    if(admin)
      {
        const valide_pass = await bcrypt.compare(req.body.password, admin.password);

    if (!valide_pass) return res.status(401).json({ error: "Connexion error" });
    const adminclub = await Club.findById(admin.club)
    if (!adminclub) return res.status(404).json({ error: "user club does not exist" });

    generateCookies(adminclub._id, res);

    const token = createToken(adminclub._id);
    const refresh_token = createRefreshToken(adminclub._id);
    res.status(200).json({
      message: "you are well connected",
      name: adminclub.name,
      headName: adminclub.headName,
      email: adminclub.email,
      description: adminclub.description,
      address: adminclub.address,
      phoneNumber: adminclub.phoneNumber,
      photo: adminclub.photo,
      createdDate: adminclub.createdDate,
      token: token,
      refresh_token: refresh_token,
      id: adminclub._id,
      role: admin.role,
      adminname:admin.name,
      adminemail:admin.email
    });
      }
      else 
    return res.status(404).json({ error: "user does not exist" });
    }
   
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};
exports.profil = async (req: k, res: Response) => {
  try {
    const club = await Club.findOne({ _id: req.auth._id }).select(
      "-password -__v -joueur -staff -news -match -createdBy -editedBy"
    );

    res.status(200).json(club);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};
exports.editeMyAccount = async (req: k, res: Response) => {
  try {
    const club1 = await Club.findOne({ _id: req.auth._id });
    if (req.body.name) {
      if (req.body.name === club1.name) {
        club1.name = club1.name;
      } else {
        const club = await Club.findOne({ name: req.body.name });
        if (club)
          return res.status(401).json({ message: "the name already exists" });
        club1.name = req.body.name;
      }
    } else {
      club1.name = club1.name;
    }
    if (req.body.headName) {
      club1.headName = req.body.headName;
    } else {
      club1.headName = club1.headName;
    }
    if (req.body.email) {
      const emailValide = verifierEmail(req.body.email);
      if (!emailValide) return res.status(400).json({ error: "invalid email" });
      if (req.body.email === club1.email) {
        club1.email = req.body.email;
      } else {
        const club = await Club.findOne({ email: req.body.email });
        if (club)
          return res.status(401).json({ message: "the email already exists" });
        club1.email = req.body.email;
      }
    } else {
      club1.email = club1.email;
    }
    if (req.body.description) {
      const description = req.body.description;
      if (description.length < 6)
        return res
          .status(403)
          .json({ error: "the description must have at least 6 characters" });
      club1.description = req.body.description;
    } else {
      club1.description = club1.description;
    }
    if (req.body.adress) {
      club1.adress = req.body.adress;
    } else {
      club1.adress = club1.adress;
    }
    if (req.body.phoneNumber) {
      club1.phoneNumber = req.body.phoneNumber;
    } else {
      club1.phoneNumber = club1.phoneNumber;
    }
    const imageFiles =
      req.files &&
      (req.files as { [fieldname: string]: Express.Multer.File[] })["image"];
    if (imageFiles) {
      club1.image = imageFiles;
    } else {
      club1.image = club1.image;
    }
    if (req.body.createdDate) {
      club1.createdDate = new Date(req.body.createdDate);
    } else {
      club1.createdDate = club1.createdDate;
    }
    if (req.body.modificationDate) {
      club1.modificationDate = new Date(req.body.modificationDate);
    } else {
      club1.modificationDate = club1.modificationDate;
    }

    if (req.body.password) {
      const motDePasseValide = verifierMotDePasse(req.body.password);
      if (!motDePasseValide)
        return res.status(404).json({
          error:
            "the password must contain at least one capital letter and a minimum length of 6 characters",
        });
      req.body.password = await bcrypt.hash(req.body.password, 10);
      club1.password = req.body.password;
    } else {
      club1.password = club1.password;
    }
    if (req.body.emailClub) {
      const emailValide = verifierEmail(req.body.emailClub);
      if (!emailValide)
        return res.status(400).json({ error: "invalide email" });
      else club1.emailClub = req.body.emailClub;
    } else {
      club1.emailClub = club1.emailClub;
    }
    if (req.body.creationDateClub) {
      club1.creationDateClub = req.body.creationDateClub;
    } else {
      club1.creationDateClub = club1.creationDateClub;
    }
    if (req.body.phoneNumberClub) {
      club1.phoneNumberClub = req.body.phoneNumberClub;
    } else {
      club1.phoneNumberClub = club1.phoneNumberClub;
    }
    if (req.body.nbrTitreGagner) {
      club1.nbrTitreGagner = req.body.nbrTitreGagner;
    } else {
      club1.nbrTitreGagner = club1.nbrTitreGagner;
    }
    club1.status = "VALIDATED";

    await club1.save();
    if (
      !req.body.createdDate &&
      !req.body.status &&
      !req.body.modificationDate &&
      !req.body.password &&
      !req.body.email &&
      !req.body.name &&
      !req.body.headName &&
      !imageFiles &&
      !req.body.description &&
      !req.body.phoneNumber &&
      !req.body.adress
    ) {
      return res
        .status(403)
        .json({ error: "please modify at least one field" });
    } else {
      res
        .status(201)
        .json({ message: "your account has been modified", id: req.auth._id });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};

function verifierMotDePasse(motDePasse: string) {
  const regex = /^(?=.*[A-Z])[A-Za-z\d@$!%*?&]{6,}$/;
  return regex.test(motDePasse);
}
function verifierEmail(email: string) {
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
}
function createToken(id: string) {
  return jwt.sign({ id }, SECRET_TOKEN, { expiresIn: "2h" });
}
function createRefreshToken(id: string) {
  return jwt.sign({ id }, SECRET_TOKEN, {
    expiresIn: "1d",
  });
}
