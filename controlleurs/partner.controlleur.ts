import { Request, Response } from "express";
const Club = require("../models/club.model");
const Partner = require("../models/partner.model");
import mongoose from "mongoose";
import { ObjectId } from "mongoose";
interface k extends Request {
  auth: { _id: ObjectId };
}
exports.create = async (req: k, res: Response) => {
  if (!req.body.companyName)
    return res.status(400).json({ error: "the companyName is empty" });
  if (!req.body.RC) return res.status(400).json({ error: "the RC is empty" });
  if(!req.body.description) return res.status(400).json({ error: "the description is empty" });
      const description = req.body.description;
    if (description.length < 6) return res.status(400).json({ error: "the description must have at least 6 characters" });
  if (!req.body.phoneNumber)
    return res.status(400).json({ error: "the phoneNumber is empty" });
  if (!req.body.email)
    return res.status(400).json({ error: "the email is empty" });
  const emailValide = verifierEmail(req.body.email);
  if (!emailValide) return res.status(400).json({ error: "email invalide" });

  const partner = await Partner.findOne({ companyName: req.body.companyName });
  if (partner) return res.status(401).json({ error: "partner already exists" });
  try {
    const club = await Club.findOne({ _id: req.auth._id });
    const imageFiles =
      req.files &&
      (req.files as { [fieldname: string]: Express.Multer.File[] })["image"];

    const partner1 = new Partner({
      companyName: req.body.companyName,
      RC: req.body.RC,
      description: req.body.description,
      image: imageFiles,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      clubId:club._id,
      clubName:club.name,
      status:"VALIDATED",
      createdDate: new Date(),
      createdBy: club,
    });
    await partner1.save();
    club.partner = partner1;
    await club.save();
    res.status(201).json({ message: "The partner is created" });
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
};

exports.register = async (req: k, res: Response) => {
  if (!req.body.companyName)
    return res.status(400).json({ error: "the companyName is empty" });
  if (!req.body.RC) return res.status(400).json({ error: "the RC is empty" });
  if(!req.body.description) return res.status(400).json({ error: "the description is empty" });
      const description = req.body.description;
    if (description.length < 6) return res.status(400).json({ error: "the description must have at least 6 characters" });
  if (!req.body.phoneNumber)
    return res.status(400).json({ error: "the phoneNumber is empty" });
  if (!req.body.email)
    return res.status(400).json({ error: "the email is empty" });

  const emailValide = verifierEmail(req.body.email);
  if (!emailValide) return res.status(400).json({ error: "email invalide" });

  const partner = await Partner.findOne({ companyName: req.body.companyName });
  if (partner) return res.status(401).json({ error: "partner already exists" });

  const club = await Club.findOne({ name: req.params.clubName });
  if (!club)
    return res.status(404).json({ message: "the club does not exist" });

  try {
    
    const imageFiles =
      req.files &&
      (req.files as { [fieldname: string]: Express.Multer.File[] })["image"];

    const partner1 = new Partner({
      companyName: req.body.companyName,
      RC: req.body.RC,
      description: req.body.description,
      image: imageFiles,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      clubId:club._id,
      clubName:club.name,
      status:"PENDING",
      createdDate: new Date(),
    });

    await partner1.save();

    club.partner = partner1;

    await club.save();

    res.status(201).json({ message: "The partner is created" });
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
};

exports.getAll = async (req: k, res: Response) => {
  try {
    const club = await Club.findOne({ _id: req.auth._id });
    const partner = await Partner.find({ clubId: club._id }).select("-__v");

    res.status(200).json(partner);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
exports.getPartner = async (req: any, res: Response) => {
  try {
    const club = await Club.findOne({ _id: req.auth._id });

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "the id is invalid" });

    let partner = await Partner.findOne({ _id: req.params.id, clubId:club._id }).select("-__v");
    if (!partner)
      return res.status(404).json({ message: "the partner does not exist" });

    res.status(200).json(partner);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
exports.deletePartner = async (req: k, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "the id is invalid" });
    const partner = await Partner.findOne({ _id: req.params.id });
    if (!partner)
      return res.status(404).json({ message: "the partner does not exist" });
    const club = await Club.findOne({ _id: req.auth._id });
    if (club._id.toString() !== partner.clubId.toString())
      return res.status(401).json({
        error: "you are not allowed to remove a partner from another club",
      });
    await Partner.findOneAndDelete({ _id: req.params.id });
    res.status(201).json({ message: "The partner was deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
exports.deleteAll = async (req: k, res: Response) => {
  try {
    const club = await Club.findOne({ _id: req.auth._id });
    await Partner.deleteMany({ clubId: club._id });
    return res.status(200).json({
      msg: "all " + club.name + " partner have been successfully deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
exports.setPartner = async (req: k, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(403).json({ message: "the id is invalid" });

  const partner = await Partner.findOne({ _id: req.params.id });
  if (!partner)
    return res.status(404).json({ message: "the partner does not exist" });
  const club = await Club.findOne({ _id: req.auth._id });
  if (club._id.toString() !== partner.clubId.toString())
    return res.status(406).json({
      error: "you are not allowed to modify a partner from another club",
    });
  try {
    const imageFiles =
      req.files &&
      (req.files as { [fieldname: string]: Express.Multer.File[] })["image"];
    if (imageFiles) {
      partner.image = imageFiles;
    } else {
      partner.image = partner.image;
    }
    if (req.body.RC) {
      partner.RC = req.body.RC;
    } else {
      partner.RC = partner.RC;
    }
    if (req.body.description) {
              const description = req.body.description;
              if (description.length < 6) return res.status(401).json({ error: "the description must have at least 6 characters" });
              partner.description=req.body.description
            } else {
              partner.description=partner.description
            }
    if (req.body.phoneNumber) {
      partner.phoneNumber = req.body.phoneNumber;
    } else {
      partner.phoneNumber = partner.phoneNumber;
    }
    if (req.body.email) {
      const emailValide = verifierEmail(req.body.email);
      if (!emailValide) return res.status(400).json({ error: "invalid email" });
      if (req.body.email === partner.email) {
        partner.email = partner.email;
      } else {
        const partner1 = await partner.findOne({ email: req.body.email });
        if (partner1)
          return res.status(401).json({ error: "the email already exists" });
        partner.email = req.body.email;
      }
    } else {
      partner.email = partner.email;
    }
    if (req.body.companyName) {
      if (req.body.companyName === partner.companyName) {
        partner.companyName = partner.companyName;
      } else {
        const partner1 = await Partner.findOne({
          companyName: req.body.companyName,
        });
        if (partner1)
          return res
            .status(400)
            .json({ error: "the companyName already exists" });
        partner.companyName = req.body.companyName;
      }
    } else {
      partner.companyName = partner.companyName;
    }

    partner.modificationDate= new Date(),
    partner.editedBy = club;

    await partner.save();
    club.partner = partner;
    await club.save();
    if (
      !req.body.companyName &&
      !req.body.RC &&
      !req.body.description &&
      !req.body.email &&
      !req.body.createdDate &&
      !imageFiles
    ) {
      return res
        .status(403)
        .json({ error: "please modify at least one field" });
    } else {
      res.status(201).json({ message: "the partner was modified" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};

exports.refuserPartner = async (req: k, res: Response) => {
  const club = await Club.findOne({ _id: req.auth._id })

  if (!req.body.argument)
    return res.status(400).json({ error: "the argument is empty" });

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "l'id est invalide" });

    const partner = await Partner.findOne({ _id: req.params.id , clubId:club._id})

    if (!partner) return res.status(404).json({ message: "le partner n'éxiste pas" });
    
    partner.status = "REFUSED";
    partner.argument = req.body.argument;

    await partner.save();

    res.status(201).json({ message: "le partner a était refusé" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};

exports.validerPartner = async (req: k, res: Response) => {
  const club = await Club.findOne({ _id: req.auth._id })

  if (!req.body.argument)
    return res.status(400).json({ error: "the argument is empty" });

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "l'id est invalide" });

    const partner = await Partner.findOne({ _id: req.params.id , clubId:club._id})

    if (!partner) return res.status(404).json({ message: "le partner n'éxiste pas" });
    
    partner.status = "VALIDATED";
    partner.argument = req.body.argument;

    await partner.save();

    res.status(201).json({ message: "le partner a était validé" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "erreur de serveur" });
  }
};

function verifierEmail(email: string) {
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
}
