import { Request, Response } from "express";
const Club = require("../models/club.model");
const Soccer = require("../models/auth.model");
import mongoose from "mongoose";
import { ObjectId } from "mongoose";
const bcrypt = require("bcrypt");
interface k extends Request {
  auth: { _id: ObjectId };
}
exports.register = async (req: k, res: Response) => {
  if (!req.body.name)
    return res.status(400).json({ error: "le name est vide" });
  if (!req.body.headName)
    return res.status(400).json({ error: "le headName est vide" });
  if (!req.body.email)
    return res.status(400).json({ error: "l'email est vide" });
  if (!req.body.description)
    return res.status(400).json({ error: "la discription est vide" });
  if (!req.body.address)
    return res.status(400).json({ error: "l'address est vide" });
  if (!req.body.phoneNumber)
    return res.status(400).json({ error: "le phoneNumber est vide" });
  const imageFiles =
    req.files &&
    (req.files as { [fieldname: string]: Express.Multer.File[] })["image"];
  if (!imageFiles) return res.status(400).json({ error: "la photo est vide" });
  if (!req.body.createdDate)
    return res.status(400).json({ error: "la date de creation est vide" });
  const description = req.body.description;
  if (description.length < 6)
    return res
      .status(400)
      .json({ error: "la discription doit avoir au moins 6 caractères" });
  const emailValide = verifierEmail(req.body.email);
  if (!emailValide) return res.status(400).json({ error: "email invalide" });
  const motDePasseValide = verifierMotDePasse(req.body.password);
  if (!motDePasseValide)
    return res.status(400).json({
      error:
        "le password doit contenir au moins un char spécial,une minuscule,un majuscule,et une longueur minimale de 8 caractères",
    });
  try {
    const club = await Club.findOne().or([
      { email: req.body.email },
      { name: req.body.name },
    ]);
    if (club) return res.status(401).json({ error: "Club existe déjà " });
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const soccer = await Soccer.findOne({ _id: req.auth._id }).populate("club");
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

      createdBy: soccer,
    });
    await club1.save();
    soccer.club = club1;
    await soccer.save();
    res.status(201).json({ message: "le compte est créer" });
  } catch (error) {
    console.log(error, "error");
    res.status(500).json({ error: "erreur de serveur" });
  }
};
exports.getClubs = async (req: Request, res: Response) => {
  try {
    const club = await Club.find()
      .select("-__v -email -adress -photo")
      .populate(
        "createdBy",
        "-password -__v -lastName -firstName -email -confirmPassword -phoneNumber"
      );

    res.status(200).json(club);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};
exports.getClub = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: " L'id est invalide" });

    let club = await Club.findOne({ _id: req.params.id })
      .select("-__v -email -adress -photo")
      .populate(
        "createdBy",
        "-password -__v -lastName -firstName -email -confirmPassword -phoneNumber"
      );

    if (!club) return res.status(404).json({ message: "le club n'éxiste pas" });
    res.status(200).json(club);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};
exports.deleteClub = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "le id est invalide" });
    const club = await Club.findOneAndDelete({ _id: req.params.id });
    if (!club) return res.status(404).json({ message: "le club n'éxiste pas" });
    res.status(201).json({ message: "le club a était bien supprimer" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};
exports.deleteClubs = async (req: Request, res: Response) => {
  try {
    await Club.deleteMany({});
    return res.status(200).json({ msg: "delete all clubs successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};
exports.setClub = async (req: k, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "le id est invalide" });
    const club = await Club.findOne({ _id: req.params.id }).populate(
      "createdBy"
    );
    if (!club) return res.status(404).json({ message: "le club n'éxiste pas" });

    const soccer = await Soccer.findOne({ _id: req.auth._id }).populate("club");
    if (req.body.name) {
      if (req.body.name === club.name) {
        club.name = club.name;
      } else {
        const club1 = await Club.findOne({ name: req.body.name });
        if (club1)
          return res
            .status(401)
            .json({ message: "le nom de club existe déjà" });
        club.name = req.body.name;
      }
    } else {
      club.name = club.name;
    }
    if (req.body.headName) {
      club.headName = req.body.headName;
    } else {
      club.headName = club.headName;
    }
    if (req.body.email) {
      const emailValide = verifierEmail(req.body.email);
      if (!emailValide)
        return res.status(400).json({ error: "invalide email" });
      if (req.body.email === club.email) {
        club.email = club.email;
      } else {
        const club1 = await Club.findOne({ email: req.body.email });
        if (club1)
          return res.status(401).json({ message: "l'email existe déjà" });
        club.email = req.body.email;
      }
    } else {
      club.email = club.email;
    }
    if (req.body.description) {
      const description = req.body.description;
      if (description.length < 6)
        return res
          .status(400)
          .json({ error: "la discription doit avoir au moins 6 caractères" });
      club.description = req.body.description;
    } else {
      club.description = club.description;
    }
    if (req.body.adress) {
      club.adress = req.body.adress;
    } else {
      club.adress = club.adress;
    }
    if (req.body.phoneNumber) {
      club.phoneNumber = req.body.phoneNumber;
    } else {
      club.phoneNumber = club.phoneNumber;
    }
    const imageFiles =
      req.files &&
      (req.files as { [fieldname: string]: Express.Multer.File[] })["image"];
    if (imageFiles) {
      club.image = imageFiles;
    } else {
      club.image = club.image;
    }
    if (req.body.createdDate) {
      club.createdDate = new Date(req.body.createdDate);
    } else {
      club.createdDate = club.createdDate;
    }
    if (req.body.modificationDate) {
      club.modificationDate = new Date(req.body.modificationDate);
    } else {
      club.modificationDate = club.modificationDate;
    }
    if (req.body.status) {
      club.status = req.body.status;
    } else {
      club.status = club.status;
    }
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
      club.password = req.body.password;
    } else {
      club.password = club.password;
    }
    if (req.body.emailClub) {
      const emailValide = verifierEmail(req.body.emailClub);
      if (!emailValide)
        return res.status(400).json({ error: "invalide email" });
      else club.emailClub = req.body.emailClub;
    } else {
      club.emailClub = club.emailClub;
    }
    if (req.body.creationDateClub) {
      club.creationDateClub = req.body.creationDateClub;
    } else {
      club.creationDateClub = club.creationDateClub;
    }
    if (req.body.phoneNumberClub) {
      club.phoneNumberClub = req.body.phoneNumberClub;
    } else {
      club.phoneNumberClub = club.phoneNumberClub;
    }
    if (req.body.nbrTitreGagner) {
      club.nbrTitreGagner = req.body.nbrTitreGagner;
    } else {
      club.nbrTitreGagner = club.nbrTitreGagner;
    }

    club.editedBy = soccer;
    await club.save();
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
        .json({ error: "veuillez modifier au moins un seul champ" });
    } else {
      res.status(201).json({ message: "le club a était bien modifier" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};
exports.bannirClub = async (req: k, res: Response) => {
  if (!req.body.argument)
    return res.status(400).json({ error: "the argument is empty" });
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "l'id est invalide" });
    const club = await Club.findOne({ _id: req.params.id }).populate(
      "createdBy"
    );

    if (!club) return res.status(404).json({ message: "le club n'éxiste pas" });
    const soccer = await Soccer.findOne({ _id: req.auth._id }).populate("club");
    club.status = "BANNED";
    club.argument = req.body.argument;
    club.createdBy = soccer;

    await club.save();

    res.status(201).json({ message: "le club a était banni" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};
exports.validerClub = async (req: k, res: Response) => {
  if (!req.body.argument)
    return res.status(400).json({ error: "the argument is empty" });
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "l'id est invalide" });
    const club = await Club.findOne({ _id: req.params.id }).populate(
      "createdBy"
    );

    if (!club) return res.status(404).json({ message: "le club n'éxiste pas" });
    const soccer = await Soccer.findOne({ _id: req.auth._id }).populate("club");
    club.status = "VALIDATED";
    club.argument = req.body.argument;
    club.createdBy = soccer;

    await club.save();

    res.status(201).json({ message: "le club a était validé" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};
function verifierMotDePasse(motDePasse: string) {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(motDePasse);
}
function verifierEmail(email: string) {
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
}
