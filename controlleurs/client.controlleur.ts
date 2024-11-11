const nodemailer1 = require("../configuration/nodemailer");
import { Request,Response } from "express";
import mongoose from "mongoose";
import { ObjectId } from "mongoose";
const bcrypt = require("bcrypt");
const Client = require("../models/client.model");
const Partner = require("../models/partner.model");
const Joueur = require("../models/joueur.model");
const Club = require("../models/club.model");
const Match = require("../models/match.model");
const News = require("../models/news.model");
const Staff = require("../models/staff.model");
const Stadium= require("../models/stadium.model");
const Live= require("../models/live.model");
const URL_RESET_PASSWORD= process.env.URL_RESET_PASSWORD
const jwt = require("jsonwebtoken");
const SECRET_TOKEN = process.env.SECRET_TOKEN;
const { generateCookies } = require("../configuration/cookies");
interface k extends Request {
  auth: { _id: ObjectId},
  query:{position:string,name:string,fullName:string}
}

exports.account = async (req:Request, res:Response) => {
    if (!req.body.pseudo) return res.status(400).json({ error: "the pseudo is empty" });
    if (!req.body.email) return res.status(400).json({ error: "the email is empty" });
    if (!req.body.password) return res.status(400).json({ error: "the password is empty" });
    if (!req.body.confirmPassword) return res.status(400).json({ error: "the confirmPassword is empty" });
    if(!req.body.clubName) return res.status(400).json({error:'the clubName is empty'})
    const password = req.body.password;
    if (password.length < 6) return res.status(400).json({ error: "the password must have at least 6 characters" });

    const club =await Club.findOne({name:req.body.clubName});
    if(!club) return res.status(400).json({error:"the club does not exist "});

    const emailValide = verifierEmail(req.body.email);
    if (!emailValide) return res.status(400).json({ error: "invalid email" });
    const client = await Client.findOne({email:req.body.email, clubName:req.body.clubName});
    if (client) {
      return res.status(401).json({ error: "Client with this email already exists." });
    }

    const client1 = await Client.findOne({pseudo:req.body.pseudo, clubName:req.body.clubName});
    if (client1) {
      return res.status(401).json({ error: "Client with this pseudo already exists." });
    }
    
    if (req.body.password !== req.body.confirmPassword)
      return res.status(400).json({
        error:
          "the password and the confirmation password are different",
      });
      
  try {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    req.body.confirmPassword = await bcrypt.hash(req.body.confirmPassword, 10);
    const imageFiles = (req.files as { [fieldname: string]: Express.Multer.File[] })['image'];
    if(club){
    const client1 = new Client({
      pseudo: req.body.pseudo,
      phoneNumber:req.body.phoneNumber,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      image:imageFiles,
      status:"VALIDATED",
      clubName: club.name,
      club:club._id,
      gender:req.body.gender
    });
    
    await client1.save();
    res.status(201).json({ message: "The account is created" });}
  } catch (error) {
    res.status(500).json({ error: "Server Error", });
  }
};
exports.login = async (req:k, res:Response) => {
  try {
    if (!req.body.password) 
      return res.status(400).json({ error: "the password is empty" });
    if(!req.body.email && !req.body.pseudo) 
      return res.status(400).json({ error: "email and pseudo are empty, please log in with email or pseudo" });
    if(!req.body.clubName) 
      return res.status(400).json({ error: "the clubName is empty" });

    const client = await Client.findOne().or([{ email: req.body.email,clubName: req.body.clubName }, { pseudo: req.body.pseudo,clubName: req.body.clubName }]);
    if (!client)
      return res.status(404).json({ error: "The client does not exist" });

    const valide_pass = await bcrypt.compare(req.body.password, client.password);
    if (!valide_pass)
      return res.status(401).json({ error: "incorrect password" });

    if (client.status!=="VALIDATED") {
      return res.status(403).json({ error: "You are not authorized, please contact the club administrators!" });
    }

    generateCookies(client._id, res);

    const token = createToken(client._id);
    const refresh_token = createRefreshToken(client._id);

    res.status(200).json({
      message: "the client is well connected",
      pseudo: client.pseudo,
      email: client.email,
      phoneNumber: client.phoneNumber,
      image: client.image,
      clubName: client.clubName,
      club: client.club,
      gender: client.gender,
      token: token,
      refresh_token: refresh_token,
      id: client._id,
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

    const client = await Client.findOne({ email: req.body.email,clubName:req.body.clubName });

    if (!client)
      return res.status(404).json({ error: "The client does not exist" });
   const token=  createToken(client._id)
   const emailValid = await nodemailer1.sendNewPassword(client.email,token );
   if (!emailValid)
      return res.status(400).json({ error: "The email was not sent" });
      client.resetLink=URL_RESET_PASSWORD+token ;

      await client.save();
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
    const client = await Client.findOne({ resetLink: req.body.resetLink });

    if (!client)
      return res.status(404).json({ error: "The client does not exist" });
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
    client.password = await bcrypt.hash(req.body.password, 10);
    client.confirmPassword = await bcrypt.hash(req.body.confirmPassword, 10);
    client.resetLink = null;
    await client.save();
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
      const client = await Client.findOne({ _id: req.auth._id }).select("-password -__v -confirmPassword");

        res.status(200).json(client);

    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Server Error" });
    }
  };

  exports.getAll = async (req: k, res: Response) => {
    try {
      const club = await Club.findOne({ _id: req.auth._id });

      const clients = await Client.find({ club: club._id }).select("-__v -password -confirmPassword");
   
      res.status(200).json({clients: clients});
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
    
      const client = await Client.findOne({ _id: req.params.id, club: club._id }).select(
        "-__v -password -confirmPassword"
      );
      if (!client)
        return res.status(404).json({ message: "the client does not exist" });

      res.status(200).json({client: client});
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };

  exports.deleteById = async (req: k, res: Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(403).json({ message: "the id is invalid" });
  
      const client = await Client.findOne({ _id: req.params.id });
      if (!client)
        return res.status(404).json({ message: "the client does not exist" });
  
      const club = await Club.findOne({ _id: req.auth._id });
  
      if (club._id.toString() !== client.club.toString())
        return res.status(400).json({
          error: "you are not allowed to remove a client from another club",
        });
  
      await Client.findOneAndDelete({ _id: req.params.id });
  
      res.status(201).json({ message: "The client was deleted" });
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
      
      const client = await Client.findOne({ _id: req.auth._id });
    try {  
    
      if (req.body.password) {
        const password = req.body.password;
        if (password.length < 6) return res.status(400).json({ error: "the password must have at least 6 characters" });
        req.body.password = await bcrypt.hash(req.body.password, 10);
        client.password=req.body.password
      } else {
        client.password=client.password
      }   
      if (req.body.confirmPassword) {
        req.body.confirmPassword = await bcrypt.hash(req.body.confirmPassword, 10);
        client.confirmPassword=req.body.confirmPassword
      } else {
        client.confirmPassword=client.confirmPassword
      }  
          
      const imageFiles = req.files&&(req.files as { [fieldname: string]: Express.Multer.File[] })['image'];
      if (imageFiles) {
        client.image=imageFiles;
      } else {
        client.image=client.image
      }
      if (req.body.phoneNumber) {
        client.phoneNumber= req.body.phoneNumber;
      } else {
        client.phoneNumber=client.phoneNumber
      }
      client.pseudo=client.pseudo;
      client.clubName=client.clubName
      client.email= client.email;
     
    await client.save();
    if ((!req.body.phoneNumber)&&(!imageFiles)&&(!req.body.confirmPassword)&&(!req.body.password)) {
      return res.status(403).json({ error: "please modify at least one field" });
    } else {
      res.status(201).json({ message: "your account has been modified",id:client._id });
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
  
    const client = await Client.findOne({ _id: req.params.id });
    if (!client)
      return res.status(404).json({ message: "the client does not exist" });
  
    const club = await Club.findOne({ _id: req.auth._id });
  
    if (club._id.toString() !== client.club.toString())
      return res.status(401).json({
        error: "you are not allowed to banned a client from another club",
      });
  
   if (client.status=== "BANNED") {
      return res.status(406).json({
          error: "Client account is already banned!",
        });
   }

   client.status= "BANNED";
   client.argument= req.body.argument;

    await client.save();

    const client1 = await Client.findOne({ _id: client._id }).select("-__v -password -confirmPassword");

    res.status(201).json({ message: "the client account is banned.", client: client1 });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};

exports.validated = async (req: k, res: Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(403).json({ message: "the id is invalid" });
    
      const client = await Client.findOne({ _id: req.params.id });
      if (!client)
        return res.status(404).json({ message: "the client does not exist" });
    
      const club = await Club.findOne({ _id: req.auth._id });
    
      if (club._id.toString() !== client.club.toString())
        return res.status(400).json({
          error: "you are not allowed to validated a client from another club",
        });
    
     if (client.status=== "VALIDATED") {
        return res.status(406).json({
            error: "Client account is already validated!",
          });
     }
  
     client.status= "VALIDATED"
  
      await client.save();
  
      const client1 = await Client.findOne({ _id: client._id }).select("-__v");
  
      res.status(201).json({ message: "Client account is validated.", client: client1 });
      
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };

  exports.getPlayers = async (req:Request, res:Response) => {
    try {

      const club = await Club.findOne({ name:req.params.name })
      if (!club) return res.status(401).json({ message: "the club does not exist" });

      const joueur= await Joueur.find({createdBy:club}).select("-__v")
      res.status(200).json(joueur);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };
  exports.getPlayersByPosition = async (req: k, res: Response) => {
    try {

      const club = await Club.findOne({ name:req.query.name });
      if (!club) return res.status(401).json({ message: "the club does not exist" });
      let filter: any = { createdBy: club };
      if (req.query.position) {
        const allowedPositions = ["goalkeeper", "midfielder", "defender", "attacker"];
        if (allowedPositions.includes(req.query.position)) {
          filter.position = req.query.position;
        } else {
          return res.status(400).json({ error: "Invalid position parameter. enum: [goalkeeper, midfielder, defender, attacker]" });
        }
      }
  
      const joueurs = await Joueur.find(filter).select("-__v");
      res.status(200).json(joueurs);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };
  exports.getPlayersByFullName = async (req: k, res: Response) => {
    try {
      const club = await Club.findOne({ name:req.query.name });
      if (!club) return res.status(401).json({ message: "the club does not exist" });
      let filter: any = { createdBy: club };
      if (req.query.fullName) {
        const fullNameParts = req.query.fullName.split(' ');
  
        // Use $all without regex for case-insensitive search
        filter.fullName = { $all: fullNameParts.map(part => new RegExp(part, 'i')) };
      }
  
      const joueur = await Joueur.find(filter).select("-__v");
  
      res.status(200).json(joueur);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };
  
  exports.getPlayerById = async (req:Request, res:Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(403).json({ message: "the id is invalid" });
  
      const joueur = await Joueur.findOne({ _id: req.params.id })

      if (!joueur) return res.status(404).json({ message: "the player does not exist" });

      res.status(200).json(joueur);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };

  exports.getMatchs = async (req:Request, res:Response) => {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const nameAdversary = req.query.nameAdversary as string;
      let match;
      const club = await Club.findOne({ name:req.params.name })
      if (!club) return res.status(401).json({ message: "the club does not exist" });
      
      match= await Match.find({createdBy:club}).select("-__v")
      if (startDate && endDate) {
        const startFilterDate = new Date(startDate.replace(/\//g, '-'));
        const endFilterDate = new Date(endDate.replace(/\//g, '-'));
        
        if (isNaN(startFilterDate.getTime()) || isNaN(endFilterDate.getTime())) {
            return res.status(400).json({ error: "Invalid date format. Please use YYYY-MM-DD or YYYY/MM/DD" });
        }
    
        match = match.filter((m: any) => {
            const matchDate = new Date(m.date);
            return matchDate >= startFilterDate && matchDate <= endFilterDate;
        });
    }

    if (nameAdversary) {
      const nameAdversaryRegex = new RegExp(nameAdversary, 'i');
      match = match.filter((m: any) => nameAdversaryRegex.test(m.nameAdversary));
    }
    
      res.status(200).json(match);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };
  exports.getMatchById = async (req:Request, res:Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(403).json({ message: "the id is invalid" });
  
      let match = await Match.findOne({ _id: req.params.id })
      if (!match) return res.status(404).json({ message: "the match does not exist" });
      res.status(200).json(match);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };
  exports.getNews = async (req:Request, res:Response) => {
    try {

      const club = await Club.findOne({ name:req.params.name })
      if (!club) return res.status(401).json({ message: "the club does not exist" });
      
      const news= await News.find({createdBy:club}).select("-__v")
      res.status(200).json(news);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };
  exports.getNewsById = async (req:Request, res:Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(403).json({ message: "the id is invalid" });
  
      let news = await News.findOne({ _id: req.params.id })

      if (!news) return res.status(404).json({ message: "the news does not exist" });
      res.status(200).json(news);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };
  exports.getStaff = async (req:Request, res:Response) => {
    try {

      const club = await Club.findOne({ name:req.params.name })
      if (!club) return res.status(401).json({ message: "the club does not exist" });
      
      const staff= await Staff.find({createdBy:club}).select("-__v")
      res.status(200).json(staff);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };
  exports.getStaffByFullName = async (req: k, res: Response) => {
    try {
      const club = await Club.findOne({ name:req.query.name });
      if (!club) return res.status(401).json({ message: "the club does not exist" });
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
  exports.getStaffById = async (req:Request, res:Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(403).json({ message: "the id is invalid" });
  
      let staff = await Staff.findOne({ _id: req.params.id })

      if (!staff) return res.status(404).json({ message: "the staff member does not exist" });
      res.status(200).json(staff);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };
  exports.getStadium = async (req:Request, res:Response) => {
    try {

      const club = await Club.findOne({ name:req.params.name })
      if (!club) return res.status(401).json({ message: "the club does not exist" });
      
      const stadium= await Stadium.find({createdBy:club}).select("-__v")
      res.status(200).json(stadium);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };

exports.getLive = async (req:Request, res:Response) => {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      let live;
      const club = await Club.findOne({ name:req.params.name })
      if (!club) return res.status(401).json({ message: "the club does not exist" });
      
      live= await Live.find({createdBy:club}).select("-__v")
      if (startDate && endDate) {
        const startFilterDate = new Date(startDate.replace(/\//g, '-'));
        const endFilterDate = new Date(endDate.replace(/\//g, '-'));
        
        if (isNaN(startFilterDate.getTime()) || isNaN(endFilterDate.getTime())) {
            return res.status(400).json({ error: "Invalid date format. Please use YYYY-MM-DD or YYYY/MM/DD" });
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

  exports.getLiveById = async (req:Request, res:Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(403).json({ message: "the id is invalid" });
  
      let live = await Live.findOne({ _id: req.params.id })
      if (!live) return res.status(404).json({ message: "the live does not exist" });
      res.status(200).json(live);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };

  exports.getPlayerGoalNumberForClub = async (req: any, res: any) => {
    try {
  
      const clubExists = await Club.findOne({
        name: req.params.clubName
      });
      if (!clubExists) {
        return res.status(404).json({
          error: `Club with clubName '${req.params.clubName}' does not exist`,
        });
      }
     
      if (!mongoose.Types.ObjectId.isValid(req.params.joueurId))
        return res.status(403).json({ message: "the joueurId is invalid" });    
  
      const joueurExists = await Joueur.findOne({
        _id: req.params.joueurId, createdBy: clubExists
      });
      if (!joueurExists) {
        return res.status(404).json({
          error: `Joueur with joueurId '${req.params.joueurId}' does not exist`,
        });
      }
  
      const matches= await Match.find({createdBy:clubExists,"joueurs.joueurId":joueurExists._id})
  
      let totalGoals = 0;
      matches.forEach((match:any) => {
        match.joueurs.forEach((joueur:any) => {
          if (joueur.joueurId.equals(joueurExists._id)) {
            totalGoals += 1;
          }
        });
      });
  
      res.status(200).json({
        message: `The number of goals scored by ${joueurExists.fullName} for the ${clubExists.name} club is: ${totalGoals} goals.`,
      });
      
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };

  exports.getAllClubScorers = async (req: any, res: any) => {
    try {
  
      const clubExists = await Club.findOne({
        name: req.params.clubName
      });
      if (!clubExists) {
        return res.status(404).json({
          error: `Club with clubName '${req.params.clubName}' does not exist`,
        });
      }
     
      const joueurs = await Joueur.find({ createdBy: clubExists });
      
      if (!joueurs || joueurs.length === 0) {
        return res.status(404).json({ error: "No players found for this club" });
      }
  
      const matches = await Match.find({ createdBy: clubExists });
  
      const goalCounts: { [key: string]: { fullName: string; goals: number } } = {};
  
      joueurs.forEach((joueur:any) => {
        goalCounts[joueur._id] = { fullName: joueur.fullName, goals: 0 };
      });
  
      matches.forEach((match: any) => {
        match.joueurs.forEach((joueur: any) => {
          if (goalCounts[joueur.joueurId]) {
            goalCounts[joueur.joueurId].goals += 1;
          }
        });
      });
  
      // Filtrer et créer la liste des buteurs (joueurs qui ont marqué au moins un but)
      const scorers = Object.values(goalCounts).filter((player) => player.goals > 0);
  
      // Retourner la réponse avec la liste des buteurs
      res.status(200).json({
        scorers,
      });
      
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };
  
  exports.getAllPartner = async (req: k, res: Response) => {
    try {
      const clubExists = await Club.findOne({
        name: req.params.clubName
      });
      if (!clubExists) {
        return res.status(404).json({
          error: `Club with clubName '${req.params.clubName}' does not exist`,
        });
      }

      const partner = await Partner.find({ clubName: clubExists.name }).select("-__v");
  
      res.status(200).json(partner);
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
 