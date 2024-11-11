import { Request, Response } from "express";
import { ObjectId } from "mongoose";
import mongoose from "mongoose";
const bcrypt = require("bcrypt");
const Admin = require("../models/admin.model");
const Club = require("../models/club.model");
interface k extends Request {
  auth: { _id: ObjectId; type: number };
}

exports.account = async (req: k, res: Response) => {
  const isEmpty = (field: string) => {
    return !field || field.trim() === "";
  };

  const { name, email, password, confirmPassword, role, club } = req.body;

  const fieldsToCheck = [
    { field: name, name: "name" },
    { field: email, name: "email" },
    { field: password, name: "password" },
    { field: confirmPassword, name: "confirmPassword" },
    { field: role, name: "role" },
    { field: club, name: "club" },
  ];

  for (const fieldInfo of fieldsToCheck) {
    if (isEmpty(fieldInfo.field)) {
      return res
        .status(400)
        .json({ error: `Le champ ${fieldInfo.name} est vide` });
    }
  }

  try {
    const emailValide = verifierEmail(req.body.email);
    if (!emailValide) return res.status(400).json({ error: "invalide email" });
    const admin = await Admin.findOne({ email: req.body.email });
    if (admin) return res.status(401).json({ error: "email existe déjà " });
    if (req.body.password !== req.body.confirmPassword)
      return res.status(404).json({
        error:
          "le mot de passe et le mot de passe de confirmation sont diffirents",
      });
    req.body.password = await bcrypt.hash(req.body.password, 10);
    req.body.confirmPassword = await bcrypt.hash(req.body.confirmPassword, 10);

    const admin1 = new Admin({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      role: req.body.role,
      club: req.body.club,
    });
    await admin1.save();
    res.status(201).json({ message: "le compte est créer" });
  } catch (error) {
    console.log(error, "error");
    res.status(500).json({ error: "erreur de serveur" });
  }
};
exports.setAdmin = async (req: k, res: Response) => {
  try {
    if (req.body.password !== req.body.confirmPassword)
      return res.status(404).json({
        error:
          "le mot de passe et le mot de passe de confirmation sont diffirents",
      });
    const soccer1 = await Admin.findOne({ _id: req.body.admin_id });
    if (req.body.name) {
      soccer1.name = req.body.name;
    } else {
      soccer1.name = soccer1.name;
    }
    if (req.body.email) {
      const emailValide = verifierEmail(req.body.email);
      if (!emailValide)
        return res.status(400).json({ error: "invalide email" });
      if (req.body.email === soccer1.email) {
        soccer1.email = soccer1.email;
      } else {
        const soccer = await Admin.findOne({ email: req.body.email });
        if (soccer)
          return res.status(401).json({ error: "email existe déjà " });
        soccer1.email = req.body.email;
      }
    } else {
      soccer1.email = soccer1.email;
    }

    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
      soccer1.password = req.body.password;
    } else {
      soccer1.password = soccer1.password;
    }

    if (req.body.confirmPassword) {
      req.body.confirmPassword = await bcrypt.hash(
        req.body.confirmPassword,
        10
      );
      soccer1.confirmPassword = req.body.confirmPassword;
    } else {
      soccer1.confirmPassword = soccer1.confirmPassword;
    }

    if (req.body.role) {
      soccer1.role = req.body.role;
    } else {
      soccer1.role = soccer1.role;
    }
    await soccer1.save();
    if (
      !req.body.role &&
      !req.body.confirmPassword &&
      !req.body.password &&
      !req.body.email &&
      !req.body.name
    ) {
      return res
        .status(403)
        .json({ error: "veuillez modifier au moins un seul champ" });
    } else {
      res
        .status(201)
        .json({
          message: "votre compte a était bien modifier",
          id: req.auth._id,
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};
exports.deleteadmin = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "le id est invalide" });
    const admin = await Admin.findOneAndDelete({ _id: req.params.id });
    if (!admin)
      return res.status(404).json({ message: "le club n'éxiste pas" });
    res.status(201).json({ message: "l'admin a était bien supprimer" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};
exports.getAll = async (req: k, res: Response) => {
  try {
    const club = await Club.findOne({ _id: req.auth._id });
    const admin = await Admin.find({ club: club }).select("-__v");
    res.status(200).json(admin);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
function verifierEmail(email: string) {
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
}
