const nodemailer1 = require("../configuration/nodemailer");
import { Request,Response } from "express";
import mongoose from "mongoose";
import { ObjectId } from "mongoose";
const bcrypt = require("bcrypt");
const Agent = require("../models/agent.model");
const Club = require("../models/club.model");
const URL_RESET_PASSWORD= process.env.URL_RESET_PASSWORD
const jwt = require("jsonwebtoken");
const SECRET_TOKEN = process.env.SECRET_TOKEN;
const { generateCookies } = require("../configuration/cookies");
interface k extends Request {
  auth: { _id: ObjectId},
  query:{position:string,name:string,fullName:string}
}

exports.create = async (req:k, res:Response) => {
    const club = await Club.findOne({ _id: req.auth._id });

    const imageFiles = (req.files as { [fieldname: string]: Express.Multer.File[] })['image'];

    if (!req.body.fullName) return res.status(400).json({ error: "the fullName is empty" });
    if (!req.body.identityCardNumber) return res.status(400).json({ error: "the identityCardNumber is empty" });
    if (!req.body.birthDate) return res.status(400).json({ error: "the birthDate is empty" });
    if (!req.body.email) return res.status(400).json({ error: "the email is empty" });
    if (!req.body.password) return res.status(400).json({ error: "the password is empty" });
    if (!req.body.confirmPassword) return res.status(400).json({ error: "the confirmPassword is empty" });
    if(!req.body.phoneNumber) return res.status(400).json({error:'the phoneNumber is empty'});
    if (!imageFiles) return res.status(400).json({ error: "the image is empty" });
    if(!req.body.handicap || req.body.handicap===undefined || req.body.handicap===null) return res.status(400).json({error:'the handicap is empty'})

    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
    const dateFormatRegex1 = /^\d{4}\/\d{2}\/\d{2}$/;
    if (
      !dateFormatRegex.test(req.body.birthDate) &&
      !dateFormatRegex1.test(req.body.birthDate)
    ) {
      return res.status(400).json({
        error: "Invalid birthDate format. Please use YYYY-MM-DD or YYYY/MM/DD",
      });
    }

    const emailValide = verifierEmail(req.body.email);
    if (!emailValide) return res.status(400).json({ error: "Invalid email" });

    const agent = await Agent.findOne({email:req.body.email, club:club._id});
    if (agent) {
      return res.status(401).json({ error: "Agent with this email already exists." });
    }

    const agent1 = await Agent.findOne({phoneNumber:req.body.phoneNumber, club:club._id});
    if (agent1) {
      return res.status(401).json({ error: "Agent with this phoneNumber already exists." });
    }

    const password = req.body.password;
    if (password.length < 6) return res.status(400).json({ error: "the password must have at least 6 characters" });
    
    if (req.body.password !== req.body.confirmPassword)
      return res.status(400).json({
        error:
          "the password and the confirmation password are different",
      });
      
  try {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    req.body.confirmPassword = await bcrypt.hash(req.body.confirmPassword, 10);
    
    const agent1 = new Agent({
      fullName: req.body.fullName,
      identityCardNumber: req.body.identityCardNumber,
      birthDate: new Date(req.body.birthDate),
      email: req.body.email,
      phoneNumber:req.body.phoneNumber,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      image:imageFiles,
      handicap: req.body.handicap,
      status:"VALIDATED",
      clubName: club.name,
      club:club._id,
    });
    
    await agent1.save();

    const agent= await Agent.findOne({_id: agent1._id}).select("-__v -password -confirmPassword")

    res.status(201).json({ message: "The agent account is created", agent: agent });
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
exports.login = async (req:k, res:Response) => {
  try {
    if (!req.body.password) 
      return res.status(400).json({ error: "the password is empty" });
    if(!req.body.email && !req.body.phoneNumber) 
      return res.status(400).json({ error: "email and phoneNumber are empty, please log in with email or phoneNumber" });
    if(!req.body.clubName) 
      return res.status(400).json({ error: "the clubName is empty" });

    const agent = await Agent.findOne().or([{ email: req.body.email,clubName: req.body.clubName }, { phoneNumber: req.body.phoneNumber,clubName: req.body.clubName }]);
    if (!agent)
      return res.status(404).json({ error: "The agent does not exist" });

    const valide_pass = await bcrypt.compare(req.body.password, agent.password);
    if (!valide_pass)
      return res.status(401).json({ error: "incorrect password" });

    if (agent.status!=="VALIDATED") {
        return res.status(403).json({ error: "You are not authorized, please contact the club administrators!" });
      }

    generateCookies(agent._id, res);

    const token = createToken(agent._id);
    const refresh_token = createRefreshToken(agent._id);

    res.status(200).json({
      message: "the agent is well connected",
      fullName: agent.fullName,
      phoneNumber: agent.phoneNumber,
      email: agent.email,
      birthDate: agent.birthDate,
      image: agent.image,
      clubName: agent.clubName,
      club: agent.club,
      identityCardNumber: agent.identityCardNumber,
      handicap: agent.handicap,
      token: token,
      refresh_token: refresh_token,
      id: agent._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server Error" });
  }
};
exports.forgetPassword= async (req:Request,res:Response)=>{
  try {
    if(!req.body.email) 
        return res.status(400).json({ error: "the email and is empty" });
      if(!req.body.clubName) 
        return res.status(400).json({ error: "the clubName is empty" });

    const agent = await Agent.findOne({ email: req.body.email, clubName:req.body.clubName });

    if (!agent)
      return res.status(404).json({ error: "The agent does not exist" });
   const token=  createToken(agent._id)
   const emailValid = await nodemailer1.sendNewPassword(agent.email,token );
   if (!emailValid)
      return res.status(400).json({ error: "The email was not sent" });
      agent.resetLink=URL_RESET_PASSWORD+token ;

      await agent.save();
    res.status(200).json({
      message: "The password reset link was sent to your email",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server Error" });
  }
};
exports.resetPassword=async(req:Request,res:Response)=>{
  try {
    const agent = await Agent.findOne({ resetLink: req.body.resetLink });

    if (!agent)
      return res.status(404).json({ error: "The agent does not exist" });
    if(!req.body.resetLink)
    return res.status(401).json({error:"The resetLink is empty"})
      if (!req.body.password)
      return res
        .status(401)
        .json({ error: "The new password is empty" });
    if (req.body.password !== req.body.confirmPassword)
      return res.status(400).json({
        error:
          "the new password and the new confirmation password are different",
      });
    agent.password = await bcrypt.hash(req.body.password, 10);
    agent.confirmPassword = await bcrypt.hash(req.body.confirmPassword, 10);
    agent.resetLink = null;
    await agent.save();
    return res.status(201).json({
      message: "your password was changed correctly",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server Error" });
  }
};
exports.profil = async (req:k, res:Response) => {
    try {
      const agent = await Agent.findOne({ _id: req.auth._id }).select("-password -__v -confirmPassword");

        res.status(200).json(agent);

    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Server Error" });
    }
  };

  exports.getAll = async (req: k, res: Response) => {
    try {
      const club = await Club.findOne({ _id: req.auth._id });

      const agents = await Agent.find({ club: club._id }).select("-__v -password -confirmPassword");
   
      res.status(200).json({agents: agents});
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
    
      const agent = await Agent.findOne({ _id: req.params.id, club: club._id }).select(
        "-__v -password -confirmPassword"
      );
      if (!agent)
        return res.status(404).json({ message: "the agent does not exist" });

      res.status(200).json({agent: agent});
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };

  exports.deleteById = async (req: k, res: Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(403).json({ message: "the id is invalid" });
  
      const agent = await Agent.findOne({ _id: req.params.id });
      if (!agent)
        return res.status(404).json({ message: "the agent does not exist" });
  
      const club = await Club.findOne({ _id: req.auth._id });
  
      if (club._id.toString() !== agent.club.toString())
        return res.status(400).json({
          error: "you are not allowed to remove a agent from another club",
        });
  
      await Agent.findOneAndDelete({ _id: req.params.id });
  
      res.status(201).json({ message: "The agent was deleted" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };
  
  exports.editeMyProfil = async (req: k, res: Response) => {
    
        if (req.body.password !== req.body.confirmPassword)
      return res.status(404).json({
        error:
          "the new password and the new confirmation password are different",
      });
      
      const agent = await Agent.findOne({ _id: req.auth._id });
    try {  
    
      if (req.body.password) {
        const password = req.body.password;
        if (password.length < 6) return res.status(400).json({ error: "the password must have at least 6 characters" });
        req.body.password = await bcrypt.hash(req.body.password, 10);
        agent.password=req.body.password
      } else {
        agent.password=agent.password
      }   
      if (req.body.confirmPassword) {
        req.body.confirmPassword = await bcrypt.hash(req.body.confirmPassword, 10);
        agent.confirmPassword=req.body.confirmPassword
      } else {
        agent.confirmPassword=agent.confirmPassword
      }  
          
      const imageFiles = req.files&&(req.files as { [fieldname: string]: Express.Multer.File[] })['image'];
      if (imageFiles) {
        agent.image=imageFiles;
      } else {
        agent.image=agent.image
      }
      if (req.body.phoneNumber) {
        if (req.body.phoneNumber===agent.phoneNumber) {
            agent.phoneNumber=agent.phoneNumber
        } else {
            const agent1 = await Agent.findOne({phoneNumber:req.body.phoneNumber, club: agent.club});
            if (agent1) {
              return res.status(401).json({ error: "This phoneNumber already exists." });
            }
            
            agent.phoneNumber= req.body.phoneNumber;
        }
      } else {
        agent.phoneNumber=agent.phoneNumber
      }
      if (req.body.email) {
        if (req.body.email===agent.email) {
            agent.email=agent.email
        } else {
            const agent1 = await Agent.findOne({email:req.body.email, club: agent.club});
            if (agent1) {
              return res.status(401).json({ error: "This email already exists." });
            }
            
            agent.email= req.body.email;
        }
      } else {
        agent.email=agent.email
      }
      if (req.body.identityCardNumber) {
        agent.identityCardNumber=req.body.identityCardNumber
      } else {
        agent.identityCardNumber=agent.identityCardNumber
      }
      if (req.body.fullName) {
        agent.fullName=req.body.fullName
      } else {
        agent.fullName=agent.fullName
      }
      if (req.body.birthDate) {
        const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
        const dateFormatRegex1 = /^\d{4}\/\d{2}\/\d{2}$/;
        if (
          !dateFormatRegex.test(req.body.birthDate) &&
          !dateFormatRegex1.test(req.body.birthDate)
        ) {
          return res.status(400).json({
            error: "Invalid birthDate format. Please use YYYY-MM-DD or YYYY/MM/DD",
          });
        }

        agent.birthDate=new Date(req.body.birthDate)
      } else {
        agent.birthDate=agent.birthDate
      }
     
    await agent.save();

    if ((!req.body.phoneNumber)&&(!imageFiles)&&(!req.body.confirmPassword)&&(!req.body.password)&&
    (!req.body.fullName)&&(!req.body.email)&&(!req.body.birthDate)&&(!req.body.identityCardNumber)) {
      return res.status(403).json({ error: "please modify at least one field" });
    } else {
        const agent1= await Agent.findOne({_id: agent._id}).select("-__v -password -confirmPassword")

      res.status(201).json({ message: "your account has been modified", agent:agent1 });
    }
     
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Server Error" });
    }
  };
  
exports.banned = async (req: k, res: Response) => {
  try {
    if (!req.body.argument)
      return res.status(400).json({ message: "the argument is empty" });

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "the id is invalid" });
  
    const agent = await Agent.findOne({ _id: req.params.id });
    if (!agent)
      return res.status(404).json({ message: "the agent does not exist" });
  
    const club = await Club.findOne({ _id: req.auth._id });
  
    if (club._id.toString() !== agent.club.toString())
      return res.status(401).json({
        error: "you are not allowed to banned a agent from another club",
      });
  
   if (agent.status=== "BANNED") {
      return res.status(406).json({
          error: "Agent account is already banned!",
        });
   }

   agent.status= "BANNED";
   agent.argument= req.body.argument;

    await agent.save();

    const agent1 = await Agent.findOne({ _id: agent._id }).select("-__v -password -confirmPassword");

    res.status(201).json({ message: "the agent account is banned.", agent: agent1 });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};

exports.validated = async (req: k, res: Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(403).json({ message: "the id is invalid" });
    
      const agent = await Agent.findOne({ _id: req.params.id });
      if (!agent)
        return res.status(404).json({ message: "the agent does not exist" });
    
      const club = await Club.findOne({ _id: req.auth._id });
    
      if (club._id.toString() !== agent.club.toString())
        return res.status(400).json({
          error: "you are not allowed to validated a agent from another club",
        });
    
     if (agent.status=== "VALIDATED") {
        return res.status(406).json({
            error: "Agent account is already validated!",
          });
     }
  
     agent.status= "VALIDATED"
  
      await agent.save();
  
      const agent1 = await Agent.findOne({ _id: agent._id }).select("-__v");
  
      res.status(201).json({ message: "Agent account is validated.", agent: agent1 });
      
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };

function verifierEmail(email:string){
    const regex=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
  }
  function  createToken(id:string) {
    return jwt.sign({ id }, SECRET_TOKEN, { expiresIn: "2h" });
  }
  export function createRefreshToken(id:string) {
    return jwt.sign({ id }, SECRET_TOKEN, { expiresIn: "1d" });
  }
 