import { Request, Response } from "express";
const Club = require("../models/club.model");
const Live = require("../models/live.model");
import mongoose from "mongoose";
import { ObjectId } from "mongoose";
const { io } = require("../index");
interface k extends Request {
  auth: { _id: ObjectId };
}

exports.createLive = async (req: k, res: Response) => {
  if (!req.body.link)
    return res.status(400).json({ error: "the link is empty" });
  if (req.body.display === undefined || req.body.display === null)
    return res.status(400).json({ error: "the display is empty" });
  if (!req.body.description)
    return res.status(400).json({ error: "the description is empty" });

  if (req.body.creationDate) {
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
    const dateFormatRegex1 = /^\d{4}\/\d{2}\/\d{2}$/;
    if (
      !dateFormatRegex.test(req.body.creationDate) &&
      !dateFormatRegex1.test(req.body.creationDate)
    ) {
      return res.status(404).json({
        error: "Invalid date format. Please use YYYY-MM-DD or YYYY/MM/DD",
      });
    }
  }
  try {
    const club = await Club.findOne({ _id: req.auth._id }).populate("live");

    const live = new Live({
      titled: req.body.titled,
      link: req.body.link,
      display: req.body.display,
      match: req.body.match,
      description: req.body.description,
      createdBy: club,
    });
    if (req.body.creationDate) {
      live.creationDate = new Date(req.body.creationDate.replace(/\//g, "-"));
    }else{
      live.creationDate=new Date()
    }
    await live.save();
    club.live = live;
    await club.save();

    const live1= await Live.findOne({_id:live._id}).select("-__v")

    io.emit("liveUpdated", { action: "create", data: live1 });

    res.status(201).json({ message: "The live is created", live: live1 });
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
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    let live;

    const club = await Club.findOne({ _id: req.auth._id });
    live = await Live.find({ createdBy: club }).select("-__v");

    if (startDate && endDate) {
      const startFilterDate = new Date(startDate.replace(/\//g, "-"));
      const endFilterDate = new Date(endDate.replace(/\//g, "-"));

      if (isNaN(startFilterDate.getTime()) || isNaN(endFilterDate.getTime())) {
        return res.status(400).json({
          error: "Invalid date format. Please use YYYY-MM-DD or YYYY/MM/DD",
        });
      }

      live = live.filter((m: any) => {
        const liveDate = new Date(m.creationDate);
        return liveDate >= startFilterDate && liveDate <= endFilterDate;
      });
    }

    res.status(200).json(live);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};

exports.getLive = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "the id is invalid" });

    let live = await Live.findOne({ _id: req.params.id }).select(
      "-__v -editedBy -createdBy"
    );
    if (!live)
      return res.status(404).json({ message: "the live does not exist" });
    res.status(200).json(live);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
exports.deleteLive = async (req: k, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "the id is invalid" });
    const live = await Live.findOne({ _id: req.params.id });
    if (!live)
      return res.status(404).json({ message: "the live does not exist" });
    const club = await Club.findOne({ _id: req.auth._id });
    if (club._id.toString() !== live.createdBy.toString())
      return res.status(401).json({
        error: "you are not allowed to remove a live from another club",
      });
    await Live.findOneAndDelete({ _id: req.params.id });

    io.emit("liveUpdated", { action: "delete", id: req.params.id });

    res.status(201).json({ message: "The live was deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
exports.deleteAll = async (req: k, res: Response) => {
  try {
    const club = await Club.findOne({ _id: req.auth._id });
    await Live.deleteMany({ createdBy: club });

    io.emit("liveUpdated", { action: "deleteAll", clubName: club.name });

    return res.status(200).json({
      msg: "all " + club.name + " live have been successfully deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
exports.setLive = async (req: k, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(401).json({ message: "the id is invalid" });

  const live = await Live.findOne({ _id: req.params.id });
  if (!live)
    return res.status(404).json({ message: "the live does not exist" });
  const club = await Club.findOne({ _id: req.auth._id });
  if (club._id.toString() !== live.createdBy.toString())
    return res.status(400).json({
      error: "you are not allowed to modify a live from another club",
    });
  try {
    if (req.body.titled) {
      live.titled = req.body.titled;
    } else {
      live.titled = live.titled;
    }
    if (req.body.link) {
      live.link = req.body.link;
    } else {
      live.link = live.link;
    }
    if (req.body.match) {
      live.match = req.body.match;
    } else {
      live.match = live.match;
    }
    if (req.body.creationDate) {
      const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
      const dateFormatRegex1 = /^\d{4}\/\d{2}\/\d{2}$/;
      if (
        !dateFormatRegex.test(req.body.creationDate) &&
        !dateFormatRegex1.test(req.body.creationDate)
      ) {
        return res.status(406).json({
          error: "Invalid date format. Please use YYYY-MM-DD or YYYY/MM/DD",
        });
      }
      live.creationDate = new Date(req.body.creationDate);
    } else {
      live.creationDate = live.creationDate;
    }
    if (req.body.display !== undefined && req.body.display !== null) {
      live.display = req.body.display;
    } else {
      live.display = live.display;
    }
    if (req.body.description) {
      live.description = req.body.description;
    } else {
      live.description = live.description;
    }

    live.editedBy = club;

    await live.save();
    club.live = live;
    await club.save();
    if (
      !req.body.titled &&
      !req.body.description &&
      !req.body.link &&
      !req.body.creationDate &&
      (req.body.display === undefined || req.body.display === null)
    ) {
      return res
        .status(403)
        .json({ error: "please modify at least one field" });
    } else {
      const updatedLive = await Live.findOne({ _id: live._id }).select("-__v");

      io.emit("liveUpdated", { action: "update", data: updatedLive });

      res.status(201).json({ message: "the live was modified", live: updatedLive });
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
