const Admin = require("../models/admin.model");
import { Response, NextFunction } from "express";

module.exports = async (req:any, res:Response, next:NextFunction) => {
  try {
    const admin = await Admin.findById(req.auth._id);
    if (!admin||admin.role!=="ADMIN") {
      return res.status(403).json({ msg: "Access to admin resources denied." });
    }
    next();
  } catch (err:any) {
    return res.status(500).json({ msg: err.message });
  }
};

