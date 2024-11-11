import { Request, Response, query } from "express";
import mongoose from "mongoose";
import { ObjectId } from "mongoose";
const Message = require("../models/message.model");
const Club = require("../models/club.model");
const moment = require("moment");
interface k extends Request {
  auth: { _id: ObjectId };
}

exports.createMessage = async (req: Request, res: Response) => {
  if (!req.body.firstName)
    return res.status(400).json({ error: "the firstName is empty" });
  if (!req.body.email)
    return res.status(400).json({ error: "the email is empty" });
  if (!req.body.lastName)
    return res.status(400).json({ error: "the lastName is empty" });
  if (!req.body.clubName)
    return res.status(400).json({ error: "the clubName is empty" });
  if (!req.body.message)
    return res.status(400).json({ error: "the message is empty" });

  const club = await Club.findOne({ name: req.params.clubName });
  if (!club)
    return res
      .status(404)
      .json({ message: "the club " + req.params.clubName + " does not exist" });
  if (req.body.clubName !== req.params.clubName)
    return res
      .status(401)
      .json({ message: "you can't send a message to two different clubs" });
  const emailValide = verifierEmail(req.body.email);
  if (!emailValide) return res.status(400).json({ error: "invalid email" });

  try {
    const message = new Message({
      firstName: req.body.firstName,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      clubName: req.body.clubName,
      lastName: req.body.lastName,
      message: req.body.message,
      createdDate: moment().format("DD/MM/YYYY"),
    });

    await message.save();
    res.status(201).json({ message: "The message has been sent" });
  } catch (error) {
    console.log("createMessageError: ", error);

    res.status(500).json({ error: "Server Error" });
  }
};
exports.getAllMessages = async (req: k, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 0;
    let message;
    const club = await Club.findOne({ _id: req.auth._id });
    let filter: any = { clubName: club.name };
    if (req.query.createdDate) {
      const dateFormatRegex =
        /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
      if (!dateFormatRegex.test(req.query.createdDate as string)) {
        return res
          .status(400)
          .json({ error: "Invalid createdDate format. Please use DD/MM/YYYY" });
      }
      filter.createdDate = req.query.createdDate;
    }
    if (limit > 0) {
      const startIndex = (page - 1) * limit;
      message = await Message.find(filter)
        .select("-__v")
        .skip(startIndex)
        .limit(limit);
    } else {
      message = await Message.find(filter).select("-__v");
    }

    const totalItems = await Message.find({
      clubName: club.name,
    }).countDocuments();

    res.status(200).json({
      page: page ? page : 1,
      limit: limit ? limit : 0,
      totalItems,
      data: message,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
exports.getMessage = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "the id is invalid" });

    let message = await Message.findOne({ _id: req.params.id }).select(
      "-__v -editedBy -createdBy"
    );
    if (!message)
      return res.status(404).json({ message: "the message does not exist" });
    res.status(200).json(message);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
exports.deleteMessage = async (req: k, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "the id is invalid" });
    const message = await Message.findOne({ _id: req.params.id });
    if (!message)
      return res.status(404).json({ message: "the message does not exist" });
    // const club = await Club.findOne({ _id: req.auth._id });
    // if (club._id.toString() !== message.createdBy.toString())
    //   return res.status(401).json({
    //     error: "you are not allowed to remove a message from another club",
    //   });
    await Message.findOneAndDelete({ _id: req.params.id });
    res.status(201).json({ message: "The message was deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
function verifierEmail(email: string) {
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
}