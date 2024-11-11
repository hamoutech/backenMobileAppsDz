import { Request, Response } from "express";
const Club = require("../models/club.model");
const Carte = require("../models/carte.model");
const Client = require("../models/client.model");
import mongoose from "mongoose";
import { ObjectId } from "mongoose";
interface k extends Request {
  auth: { _id: ObjectId };
}

exports.create = async (req: k, res: Response) => {
    const imageFiles =
    req.files &&
    (req.files as { [fieldname: string]: Express.Multer.File[] })[
      "image"
    ];

  if (!req.body.titled)
    return res.status(400).json({ error: "the titled is empty" });
  if (!req.body.description)
    return res.status(400).json({ error: "the description is empty" });
  if (!imageFiles)
    return res.status(400).json({ error: "the image is empty" });
  if (req.body.numberOfMatches === undefined || req.body.numberOfMatches === null || req.body.numberOfMatches <= 0)
    return res.status(400).json({ error: "the numberOfMatches is empty" });
  if (req.body.totalPrice === undefined || req.body.totalPrice === null)
    return res.status(400).json({ error: "the totalPrice is empty" });
  if (req.body.duration === undefined || req.body.duration === null || req.body.duration <= 0)
    return res.status(400).json({ error: "the duration is empty" });

  const club = await Club.findOne({ _id: req.auth._id });
  
  const carte = await Carte.findOne({titled:req.body.titled, clubName:club.name});
  if (carte) {
    return res.status(404).json({ error: "Carte with this titled already exists." });
  }

  try {

    const carte1 = new Carte({
      titled: req.body.titled,
      description: req.body.description,
      image:imageFiles,
      numberOfMatches: req.body.numberOfMatches,
      totalPrice: req.body.totalPrice,
      duration: req.body.duration,
      creationDate: new Date(),
      clubName:club.name,
      createdBy: club,
    });

    await carte1.save();

    const carte= await Carte.findOne({_id:carte1._id}).select("-__v")

    res.status(201).json({ message: "The carte is created", carte: carte });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors).map(
        (err: any) =>
          err.path +
          " is not a " +
          err.valueType +
          " , please enter a " +
          err.kind
      );

      res.status(501).json({ error: errorMessages });
    } else {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

exports.getAll = async (req: k, res: Response) => {
    try {
      const club = await Club.findOne({ _id: req.auth._id });

      const cartes = await Carte.find({ createdBy: club }).select("-__v");
   
      res.status(200).json({cartes: cartes});
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };
  
  exports.getById = async (req: k, res: Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(403).json({ message: "the id is invalid" });

      const club = await Club.findOne({ _id: req.auth._id });
    
      const carte = await Carte.findOne({ _id: req.params.id, createdBy: club }).select(
        "-__v"
      );
      if (!carte)
        return res.status(404).json({ message: "the carte does not exist" });

      res.status(200).json({carte: carte});
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };

exports.getAllForClient = async (req: k, res: Response) => {
  try {

    if (!req.params.clubName)
        return res.status(400).json({ error: "the clubName is empty" });

    const club = await Club.findOne({ name:req.params.clubName });
    
    if(!club) return res.status(400).json({error:"the club does not exist "});

    const cartes = await Carte.find({ createdBy: club }).select("-__v");

    res.status(200).json({cartes:cartes});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};

exports.getByIdForClient = async (req: Request, res: Response) => {
  try {
    if (!req.params.clubName)
        return res.status(400).json({ error: "the clubName is empty" });

    const club = await Club.findOne({ name:req.params.clubName });
    
    if(!club) return res.status(404).json({error:"the club does not exist "});

    if (!mongoose.Types.ObjectId.isValid(req.params.carteId))
      return res.status(403).json({ message: "the carteId is invalid" });

    const carte = await Carte.findOne({ _id: req.params.carteId, createdBy: club }).select(
      "-__v"
    );
    if (!carte)
      return res.status(404).json({ message: "the carte does not exist" });

    res.status(200).json({carte: carte});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
exports.deleteById = async (req: k, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "the id is invalid" });

    const carte = await Carte.findOne({ _id: req.params.id });
    if (!carte)
      return res.status(404).json({ message: "the carte does not exist" });

    const club = await Club.findOne({ _id: req.auth._id });

    if (club._id.toString() !== carte.createdBy.toString())
      return res.status(401).json({
        error: "you are not allowed to remove a carte from another club",
      });

    await Carte.findOneAndDelete({ _id: req.params.id });

    res.status(201).json({ message: "The carte was deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};

exports.update = async (req: k, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(401).json({ message: "the id is invalid" });

  const carte = await Carte.findOne({ _id: req.params.id });
  if (!carte)
    return res.status(404).json({ message: "the carte does not exist" });

  const club = await Club.findOne({ _id: req.auth._id });

  if (club._id.toString() !== carte.createdBy.toString())
    return res.status(400).json({
      error: "you are not allowed to modify a carte from another club",
    });
  try {
    if (req.body.titled) {
        if (req.body.titled===carte.titled) {
            carte.titled=carte.titled
        } else {
            const carte1 = await Carte.findOne({titled:req.body.titled, clubName:club.name});
            if (carte1) {
              return res.status(404).json({ error: "This titled already exists." });
            }

            carte.titled = req.body.titled;
        }
    } else {
      carte.titled = carte.titled;
    }
    const imageFiles =
      req.files &&
      (req.files as { [fieldname: string]: Express.Multer.File[] })[
        "image"
      ];
    if (imageFiles) {
      carte.image = imageFiles;
    } else {
      carte.image = carte.image;
    }
    if (req.body.numberOfMatches !== undefined && req.body.numberOfMatches !== null && req.body.numberOfMatches > 0) {
      carte.numberOfMatches = req.body.numberOfMatches;
    } else {
      carte.numberOfMatches = carte.numberOfMatches;
    }
    if (req.body.duration !== undefined && req.body.duration !== null && req.body.duration > 0) {
      carte.duration = req.body.duration;
    } else {
      carte.duration = carte.duration;
    }
    if (req.body.totalPrice !== undefined && req.body.totalPrice !== null) {
      carte.totalPrice = req.body.totalPrice;
    } else {
      carte.totalPrice = carte.totalPrice;
    }
    if (req.body.description) {
      carte.description = req.body.description;
    } else {
      carte.description = carte.description;
    }

    carte.modificationDate=new Date()
    carte.editedBy = club;

    await carte.save();

    if (
      !req.body.titled &&
      !req.body.description &&
      !imageFiles &&
      (req.body.numberOfMatches === undefined || req.body.numberOfMatches === null || req.body.numberOfMatches <= 0)&&
      (req.body.duration === undefined || req.body.duration === null || req.body.duration <= 0)&&
      (req.body.totalPrice === undefined || req.body.totalPrice === null)
    ) {
      return res
        .status(403)
        .json({ error: "please modify at least one field" });
    } else {
      const carte1 = await Carte.findOne({ _id: carte._id }).select("-__v");

      res.status(201).json({ message: "the carte was modified", carte: carte1 });
    }
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors).map(
        (err: any) =>
          err.path +
          " is not a " +
          err.valueType +
          " , please enter a " +
          err.kind
      );

      res.status(501).json({ error: errorMessages });
    } else {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

  