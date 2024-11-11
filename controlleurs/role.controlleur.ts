import { Request, Response } from "express";
const Club = require("../models/club.model");
const Role = require("../models/role.model");
import mongoose from "mongoose";
import { ObjectId } from "mongoose";
interface k extends Request {
  auth: { _id: ObjectId };
}
exports.register = async (req: k, res: Response) => {
  if (!req.body.roleName)
    return res.status(400).json({ error: "the roleName is empty" });
  if (!req.body.description)
    return res.status(400).json({ error: "the description is empty" });

  const role = await Role.findOne({ roleName: req.body.roleName });
  if (role) return res.status(401).json({ error: "role already exists" });
  try {
    const club = await Club.findOne({ _id: req.auth._id });
    const role1 = new Role({
      roleName: req.body.roleName,
      description: req.body.description,
      privileges: req.body.email,
      createdBy: club,
    });
    await role1.save();
    club.role = role1;
    await club.save();
    res.status(201).json({ message: "The role is created" });
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
};
exports.getAll = async (req: k, res: Response) => {
  try {
    const club = await Club.findOne({ _id: req.auth._id });
    const role = await Role.find({ createdBy: club }).select("-__v");

    res.status(200).json(role);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
exports.getRole = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "the id is invalid" });

    let role = await Role.findOne({ _id: req.params.id }).select("-__v");
    if (!role)
      return res.status(404).json({ message: "the role does not exist" });
    res.status(200).json(role);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
exports.deleteRole = async (req: k, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "the id is invalid" });
    const role = await Role.findOne({ _id: req.params.id });
    if (!role)
      return res.status(404).json({ message: "the role does not exist" });
    const club = await Club.findOne({ _id: req.auth._id });
    if (club._id.toString() !== role.createdBy.toString())
      return res.status(401).json({
        error: "you are not allowed to remove a role from another club",
      });
    await Role.findOneAndDelete({ _id: req.params.id });
    res.status(201).json({ message: "The role was deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
