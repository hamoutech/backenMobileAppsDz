import { Request, Response } from "express";
const Club = require("../models/club.model");
const Stadium = require("../models/stadium.model");
import mongoose from "mongoose";
import { ObjectId } from "mongoose";

interface k extends Request {
  auth: { _id: ObjectId };
}

exports.createStadium = async (req: k, res: Response) => {
  const club = await Club.findOne({ _id: req.auth._id }).populate("stadium");
  const stadiumofClub = club.stadium;
  if (stadiumofClub.length > 0)
    return res
      .status(403)
      .json({ error: "you cannot create a second stadium per club" });
  if (!req.body.stadiumName)
    return res.status(400).json({ error: "the stadiumName is empty" });
  if (!req.body.stadiumCapacity)
    return res.status(400).json({ error: "the stadiumCapacity is empty" });
  if (!req.body.description)
    return res.status(400).json({ error: "the description is empty" });
  const imageFiles =
    req.files &&
    (req.files as { [fieldname: string]: Express.Multer.File[] })[
      "stadiumImage"
    ];
  const description = req.body.description;
  if (description.length < 80)
    return res
      .status(400)
      .json({ error: "the description must have at least 80 characters" });
  const stadium = await Stadium.findOne({ stadiumName: req.body.stadiumName });
  if (stadium) return res.status(401).json({ error: "stadium already exists" });

  try {
    const stadium1 = new Stadium({
      stadiumName: req.body.stadiumName,
      location: req.body.location,
      stadiumCapacity: req.body.stadiumCapacity,
      description: req.body.description,
      stadiumFieldSize: req.body.stadiumFieldSize,
      stadiumImage: imageFiles,
      gps: req.body.gps,
      tenant: req.body.tenant,
      builder: req.body.builder,
      totalSurface: req.body.totalSurface,
      architect: req.body.architect,
      createdBy: club,
    });

    await stadium1.save();
    club.stadium = stadium1;
    await club.save();
    res.status(201).json({ message: "The stadium is created" });
  } catch (error) {
    res.status(500).json({ error: "server error" });
    console.log(error);
  }
};

exports.getStadium = async (req: k, res: Response) => {
  try {
    const club = await Club.findOne({ _id: req.auth._id });
    const stadium = await Stadium.find({ createdBy: club }).select("-__v");

    res.status(200).json(stadium);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};

exports.updateStadium = async (req: k, res: Response) => {
  const club = await Club.findOne({ _id: req.auth._id });
  const stadium = await Stadium.findOne({ createdBy: club });
  if (!stadium)
    return res
      .status(404)
      .json({
        message:
          "The " + club.name + " club does not yet have a stadium in its name",
      });

  try {
    const imageFiles =
      req.files &&
      (req.files as { [fieldname: string]: Express.Multer.File[] })[
        "stadiumImage"
      ];
    if (imageFiles) {
      stadium.stadiumImage = imageFiles;
    } else {
      stadium.stadiumImage = stadium.stadiumImage;
    }
    if (req.body.location) {
      stadium.location = req.body.location;
    } else {
      stadium.location = stadium.location;
    }
    if (req.body.stadiumCapacity) {
      stadium.stadiumCapacity = req.body.stadiumCapacity;
    } else {
      stadium.stadiumCapacity = stadium.stadiumCapacity;
    }
    if (req.body.description) {
      const description = req.body.description;
      if (description.length < 80)
        return res
          .status(401)
          .json({ error: "the description must have at least 80 characters" });
      stadium.description = req.body.description;
    } else {
      stadium.description = stadium.description;
    }
    if (req.body.stadiumName) {
      if (req.body.stadiumName === stadium.stadiumName) {
        stadium.stadiumName = stadium.stadiumName;
      } else {
        const stadium1 = await Stadium.findOne({
          stadiumName: req.body.stadiumName,
        });
        if (stadium1)
          return res
            .status(400)
            .json({ error: "the stadiumName already exists" });
        stadium.stadiumName = req.body.stadiumName;
      }
    } else {
      stadium.stadiumName = stadium.stadiumName;
    }
    if (req.body.stadiumFieldSize) {
      stadium.stadiumFieldSize = req.body.stadiumFieldSize;
    } else {
      stadium.stadiumFieldSize = stadium.stadiumFieldSize;
    }
    if (req.body.gps) {
      stadium.gps = req.body.gps;
    } else {
      stadium.gps = stadium.gps;
    }
    if (req.body.totalSurface) {
      stadium.totalSurface = req.body.totalSurface;
    } else {
      stadium.totalSurface = stadium.totalSurface;
    }
    if (req.body.tenant) {
      stadium.tenant = req.body.tenant;
    } else {
      stadium.tenant = stadium.tenant;
    }
    if (req.body.builder) {
      stadium.builder = req.body.builder;
    } else {
      stadium.builder = stadium.builder;
    }
    if (req.body.architect) {
      stadium.architect = req.body.architect;
    } else {
      stadium.architect = stadium.architect;
    }

    stadium.editedBy = club;

    await stadium.save();
    club.stadium = stadium;
    await club.save();
    if (
      !req.body.stadiumCapacity &&
      !req.body.description &&
      !req.body.stadiumFieldSize &&
      !req.body.gps &&
      !imageFiles &&
      !req.body.stadiumName &&
      !req.body.totalSurface &&
      !req.body.architect &&
      !req.body.builder &&
      !req.body.tenant
    ) {
      return res
        .status(403)
        .json({ error: "please modify at least one field" });
    } else {
      res.status(201).json({ message: "the stadium was modified" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
