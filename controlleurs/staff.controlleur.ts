import { Request,Response } from "express";
const Club = require("../models/club.model");
const Staff= require("../models/staff.model");
import mongoose from "mongoose";
import { ObjectId } from "mongoose";
interface k extends Request {

    auth:{_id:ObjectId}
    query:{fullName:string}
  }
  exports.register = async (req:k, res:Response) => {
    if(!req.body.fullName) return res.status(400).json({ error: "the fullName is empty" });
    if(!req.body.email) return res.status(400).json({ error: "the email is empty" });
    if(!req.body.numberPhone) return res.status(400).json({ error: "the numberPhone is empty" });
    if(!req.body.job) return res.status(400).json({ error: "the job is empty" });
    if(!req.body.type) return res.status(400).json({ error: "the type is empty" });
    const allowedTypes = ["Staff technique", "Staff médical"];
    if(!allowedTypes.includes(req.body.type)) return res.status(403).json({ error: "Invalid type, enum: [Staff technique , Staff médical]" });
    const emailValide=verifierEmail(req.body.email);
    if(!emailValide) return res.status(400).json({error:"invalid email"});
    const staff = await Staff.findOne({ email: req.body.email });
    if (staff)
      return res.status(401).json({ error: "staff member already exists" });
      try {
          
        const club = await Club.findOne({_id:req.auth._id}).populate("staff");
        const staff1 = new Staff({
          fullName:req.body.fullName,
          email: req.body.email,
          numberPhone: req.body.numberPhone,
          type: req.body.type,
          job:req.body.job,
          createdDate:Date(),
          createdBy: club,
          
        });
        await staff1.save();
        club.staff=staff1;
        await club.save();
        res.status(201).json({ message: "The account is created" });
      } catch (error) {
        res.status(500).json({ error: "server error" });
      }
    };
    exports.getAll = async (req:k, res:Response) => {
        try {
          const club = await Club.findOne({ _id: req.auth._id })
          const staff = await Staff.find({createdBy:club}).select("-__v")
      
          res.status(200).json(staff);
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: "server error" });
        }
      };
      exports.getMember = async (req:Request, res:Response) => {
        try {
          if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(403).json({ message: "the id is invalid" });
      
          let staff = await Staff.findOne({ _id: req.params.id }).select("-__v -createdBy -editedBy")
          if (!staff) return res.status(404).json({ message: "the staff member does not exist" });
          res.status(200).json(staff);
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: "server error" });
        }
      };
      exports.deleteMember = async (req:k, res:Response) => {
        try {
          if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(403).json({ message: "the id is invalid" });
          const staff = await Staff.findOne({ _id: req.params.id });
          if (!staff) return res.status(404).json({ message: "the staff member does not exist" });
          const club = await Club.findOne({ _id: req.auth._id });
          if(club._id.toString() !== staff.createdBy.toString()) return res.status(401).json({error:"you are not allowed to remove a staff member from another club"});
          await Staff.findOneAndDelete({ _id: req.params.id });
          res.status(201).json({ message: "The staff member was deleted" });
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: "server error" });
        }
      };
      exports.deleteAll = async (req:k, res:Response) => {
        try {
          const club = await Club.findOne({ _id: req.auth._id })
          await Staff.deleteMany({createdBy:club});
          return res.status(200).json({ msg: "all "+club.name+" staff members have been successfully deleted" });
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: "server error" });
        }
      };
      exports.setMember = async (req:k, res:Response) => {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(403).json({ message: "the id is invalid" });

        const staff = await Staff.findOne({ _id: req.params.id })
        if (!staff) return res.status(404).json({ message: "the staff member does not exist" });
        const club = await Club.findOne({ _id: req.auth._id })
        if(club._id.toString() !== staff.createdBy.toString()) return res.status(406).json({error:"you are not allowed to modify a news from another club"});
        try {

            if(req.body.fullName){
              staff.fullName= req.body.fullName;
            } else{
              staff.fullName=staff.fullName;
            }
            if(req.body.email){
              const emailValide=verifierEmail(req.body.email);
              if(!emailValide) return res.status(400).json({error:"invalid email"});
              if (req.body.email===staff.email) {
                staff.email=staff.email
              } else {
                const staff1 = await Staff.findOne({ email: req.body.email });
                if (staff1) return res.status(401).json({ error: "the email already exists" });
                staff.email= req.body.email; 
              }
            } else{
              staff.email=staff.email;
            }
            if(req.body.numberPhone){
              staff.numberPhone= req.body.numberPhone;
            } else{
              staff.numberPhone=staff.numberPhone;
            }
            if(req.body.job){
              staff.job= req.body.job;
            } else{
              staff.job=staff.job;
            }
            if(req.body.type){
              const allowedTypes = ["Staff technique", "Staff médical"];
              if(!allowedTypes.includes(req.body.type)) 
              return res.status(400).json({ error: "Invalid type, enum: [Staff technique , Staff médical]" });
              staff.type= req.body.type;
            } else{
              staff.type=staff.type;
            }
            staff.modificationDate=Date();
            staff.editedBy= club;

            await staff.save();
            club.staff=staff;
            await club.save();
            if ((!req.body.type)&&(!req.body.job)&&(!req.body.email)&&(!req.body.numberPhone)&&(!req.body.fullName)) {
              return res.status(403).json({ error: "please modify at least one field" });
            } else {
              res.status(201).json({ message: "the staff member was modified" }); 
            }
          
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: "server error" });
        }
      };
      exports.getAllByFullName = async (req: k, res: Response) => {
        try {
          const club = await Club.findOne({ _id: req.auth._id });
          let filter: any = { createdBy: club };
      
          if (req.query.fullName) {
            const fullNameParts = req.query.fullName.split(' ');
      
            // Use $all without regex for case-insensitive search
            filter.fullName = { $all: fullNameParts.map(part => new RegExp(part, 'i')) };
          }
      
          const staff = await Staff.find(filter).select("-__v");
      
          res.status(200).json(staff);
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: "server error" });
        }
      };
                 
  function verifierEmail(email:string){
    const regex=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
  }