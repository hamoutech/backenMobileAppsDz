import { Request,Response } from "express";
const Club = require("../models/club.model");
const Joueur= require("../models/joueur.model");
import mongoose from "mongoose";
import { ObjectId } from "mongoose";
const { io } = require("../index");
interface k extends Request {
  
    auth:{_id:ObjectId},
    query:{position:string,fullName:string},
  }

  exports.register = async (req:k, res:Response) => {
    if(!req.body.fullName) return res.status(400).json({ error: "the fullName is empty" });
    if(!req.body.dateOfBirth) return res.status(400).json({ error: "the dateOfBirth is empty" });
    if(!req.body.numberPhone) return res.status(400).json({ error: "the numberPhone is empty" });
    if(!req.body.placeOfBirth) return res.status(400).json({ error: "the placeOfBirth is empty" });
    if(!req.body.position) return res.status(400).json({ error: "the position is empty" });
    if(!req.body.tShirtNumber) return res.status(400).json({ error: "the tShirtNumber is empty" });

    const allowedPositions = ["goalkeeper", "midfielder", "defender", "attacker"];
    if(!allowedPositions.includes(req.body.position)) return res.status(403).json({ error: "Invalid position, enum: [goalkeeper, midfielder, defender, attacker]" });
    const imageFiles = req.files&&(req.files as { [fieldname: string]: Express.Multer.File[] })['image'];
    const videoFiles = req.files&&(req.files as { [fieldname: string]: Express.Multer.File[] })['video'];
    if(!imageFiles) return res.status(400).json({ error: "the image is empty" });
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
    const dateFormatRegex1 = /^\d{4}\/\d{2}\/\d{2}$/;
    if (!dateFormatRegex.test(req.body.dateOfBirth)&&!dateFormatRegex1.test(req.body.dateOfBirth)) {
      return res.status(400).json({ error: "Invalid dateOfBirth format. Please use YYYY-MM-DD or YYYY/MM/DD" });
    }

    const club = await Club.findOne({_id:req.auth._id}).populate("joueur");

    const joueur = await Joueur.findOne({ numberPhone: req.body.numberPhone });
    if (joueur)
      return res.status(401).json({ error: "player already exists" });

    const joueur1 = await Joueur.findOne({ tShirtNumber: req.body.tShirtNumber, createdBy: club });
    if (joueur1)
      return res.status(404).json({ error: "Player with this tShirtNumber already exists." });

    if (!req.body.language) {
      return res
        .status(400)
        .json({ error: "The language is empty" });
   
    }
  
    let language = req.body.language;
  
    if (typeof language === "string") {
      try {
        language = JSON.parse(language); 
      } catch (e) {
        return res.status(403).json({ error: "Invalid JSON format for 'language'" });
      }
    }
  
    if (!validateLanguageInput(language)) {
      return res.status(403).json({
        message: "Invalid language input. Allowed values: 'fr', 'arb'.",
      });
    }
      
    if (!Array.isArray(language) || language.length === 0) {
      return res.status(403).json({ error: "The language array is empty or invalid" });
    }

    for (const lang of language) {
       if (lang === "arb") {
        if (!req.body.arabicFullName) {
          return res
            .status(400)
            .json({ error: "The arabicFullName is empty" });
        }
        if(!req.body.arabicPlaceOfBirth) return res.status(400).json({ error: "the arabicPlaceOfBirth is empty" });
        if(!req.body.arabicPosition) return res.status(400).json({ error: "the arabicPosition is empty" });

        const allowedArabicPositions = ["حارس المرمى", "لاعب خط وسط", "مدافع", "مهاجم"];
        if(!allowedArabicPositions.includes(req.body.arabicPosition)) return res.status(403).json({ error: "Invalid arabicPosition, enum: ['حارس المرمى', 'لاعب خط وسط', 'مدافع', 'مهاجم']" });
        }else if(lang === "fr"){
          if (!req.body.fullName) {
            return res
              .status(400)
              .json({ error: "The fullName is empty" });
          }
          if(!req.body.placeOfBirth) return res.status(400).json({ error: "the placeOfBirth is empty" });
          if(!req.body.position) return res.status(400).json({ error: "the position is empty" });
  
          const allowedPositions = ["goalkeeper", "midfielder", "defender", "attacker"];
          if(!allowedPositions.includes(req.body.position)) return res.status(403).json({ error: "Invalid position, enum: ['attacker', 'midfielder', 'defender', 'goalkeeper']" });
        }
      }
    
     
      try {
        const joueur1 = new Joueur({
          fullName:req.body.fullName,
          arabicFullName:req.body.arabicFullName,
          dateOfBirth: new Date(req.body.dateOfBirth),
          numberPhone: req.body.numberPhone,
          placeOfBirth: req.body.placeOfBirth,
          arabicPlaceOfBirth: req.body.arabicPlaceOfBirth,
          position:req.body.position,
          arabicPosition:req.body.arabicPosition,
          image: imageFiles,
          video: videoFiles,
          numberOfMatches: req.body.numberOfMatches || 0,
          numberOfGoals:req.body.numberOfGoals || 0,
          numberOfDecisivePasses:req.body.numberOfDecisivePasses || 0,
          nationality:req.body.nationality,
          arabicNationality:req.body.arabicNationality,
          atTheClubSince:req.body.atTheClubSince,
          size:req.body.size,
          weight:req.body.weight,
          strongFoot:req.body.strongFoot,
          arabicStrongFoot:req.body.arabicStrongFoot,
          description:req.body.description,
          arabicDescription:req.body.arabicDescription,
          previousClubYears:req.body.previousClubYears,
          previousClubName:req.body.previousClubName,
          arabicPreviousClubName:req.body.arabicPreviousClubName,
          previousClubNumberOfMatches:req.body.previousClubNumberOfMatches || 0,
          tShirtNumber: req.body.tShirtNumber,
          language: language,
          createdDate:Date(),
          createdBy: club,
          
        });
        
       
        await joueur1.save();
        club.joueur=joueur1;
        await club.save();

        const joueur= await Joueur.findOne({_id:joueur1._id}).select("-__v")

        io.emit("joueurUpdated", { action: "create", data: joueur });

        res.status(201).json({ message: "The account is created", joueur: joueur });
      } catch (error:any) {
        if (error.name === 'ValidationError') {
          // Extracting error messages from Mongoose validation error
          const errorMessages = Object.values(error.errors).map((err:any) => err.path+" is not a "+err.valueType+" , please enter a "+err.kind);
    
          // Sending validation error messages to the front end
          res.status(501).json({ error: errorMessages });
        } else {
          // If it's not a validation error, handle other types of errors
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    };
    exports.getAll = async (req:k, res:Response) => {
        try {
          const club = await Club.findOne({ _id: req.auth._id })
          const joueur = await Joueur.find({createdBy:club}).select("-__v")
      
          res.status(200).json(joueur);
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: "server error" });
        }
      };
      exports.getJoueur = async (req:Request, res:Response) => {
        try {
          if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(403).json({ message: "the id is invalid" });
      
          let joueur = await Joueur.findOne({ _id: req.params.id })
            .select("-__v")
            .populate("createdBy", "-password -__v")
            .populate("editedBy", "-password -__v");
          if (!joueur) return res.status(404).json({ message: "the player does not exist" });
          res.status(200).json(joueur);
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: "server error" });
        }
      };
      exports.deleteJoueur = async (req:k, res:Response) => {
        try {
          if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(403).json({ message: "the id is invalid" });

          const joueur = await Joueur.findOne({ _id: req.params.id });
          if (!joueur) return res.status(404).json({ message: "the player does not exist" });

          const club = await Club.findOne({ _id: req.auth._id });
          if (club._id.toString() !== joueur.createdBy.toString()) {
            return res.status(401).json({ error: "you are not allowed to remove a player from another club" });
          }
          
          await Joueur.findOneAndDelete({ _id: req.params.id });

          io.emit("joueurUpdated", { action: "delete", id: req.params.id });

          res.status(201).json({ message: "The player was deleted" });
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: "server error" });
        }
      };
      exports.deleteAll = async (req:k, res:Response) => {
        try {
          const club = await Club.findOne({ _id: req.auth._id })
          await Joueur.deleteMany({createdBy:club});

          io.emit("joueurUpdated", { action: "deleteAll", clubName: club.name });

          return res.status(200).json({ msg: "all "+club.name+" players have been successfully deleted" });
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: "server error" });
        }
      };
      exports.setJoueur = async (req:k, res:Response) => {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(403).json({ message: "the id is invalid" });

        const joueur = await Joueur.findOne({ _id: req.params.id })
        if (!joueur) return res.status(404).json({ message: "the player does not exist" });
        const club = await Club.findOne({ _id: req.auth._id })
        if(club._id.toString() !== joueur.createdBy.toString()) return res.status(400).json({error:"you are not allowed to modify a player from another club"});
        try {
            if (req.body.fullName) {
              joueur.fullName=req.body.fullName
            } else {
              joueur.fullName=joueur.fullName
            }
            if (req.body.dateOfBirth) {
              const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
              const dateFormatRegex1 = /^\d{4}\/\d{2}\/\d{2}$/;
              if (!dateFormatRegex.test(req.body.dateOfBirth)&&!dateFormatRegex1.test(req.body.dateOfBirth)) {
                return res.status(400).json({ error: "Invalid dateOfBirth format. Please use YYYY-MM-DD or YYYY/MM/DD" });
              }
              joueur.dateOfBirth=new Date(req.body.dateOfBirth)
            } else {
              joueur.dateOfBirth=joueur.dateOfBirth
            }
            if (req.body.numberPhone) {
              if (req.body.numberPhone===joueur.numberPhone) {
                joueur.numberPhone=joueur.numberPhone
              } else {
                const joueur1 = await Joueur.findOne({ numberPhone: req.body.numberPhone });
              if (joueur1) return res.status(401).json({ error: "the numberPhone already exists" });
              joueur.numberPhone=req.body.numberPhone
              }
              
            } else {
              joueur.numberPhone=joueur.numberPhone
            }
            if (req.body.tShirtNumber) {
              if (req.body.tShirtNumber===joueur.tShirtNumber) {
                joueur.tShirtNumber=joueur.tShirtNumber
              } else {
                const joueur1 = await Joueur.findOne({ tShirtNumber: req.body.tShirtNumber, createdBy: club });
              if (joueur1) return res.status(404).json({ error: "Player with this tShirtNumber already exists." });
              
              }
              
              joueur.tShirtNumber=req.body.tShirtNumber

            } else {
              joueur.tShirtNumber=joueur.tShirtNumber
            }
            if (req.body.placeOfBirth) {
              joueur.placeOfBirth=req.body.placeOfBirth
            } else {
              joueur.placeOfBirth=joueur.placeOfBirth
            }
            if (req.body.position) {
              const allowedPositions = ["goalkeeper", "midfielder", "defender", "attacker"];
              if(!allowedPositions.includes(req.body.position)) 
              return res.status(403).json({ error: "Invalid position, enum: [goalkeeper, midfielder, defender, attacker]" });
              joueur.position=req.body.position
            } else {
              joueur.position=joueur.position
            }
            const videoFiles = req.files&&(req.files as { [fieldname: string]: Express.Multer.File[] })['video'];
            if (videoFiles) {
              joueur.video=videoFiles
            } else {
              joueur.video=joueur.video
            }
            const imageFiles = req.files&&(req.files as { [fieldname: string]: Express.Multer.File[] })['image'];
            if (imageFiles) {
              joueur.image=imageFiles
            } else {
              joueur.image=joueur.image
            }
            if (req.body.numberOfMatches) {
              joueur.numberOfMatches=req.body.numberOfMatches
            } else {
              joueur.numberOfMatches=joueur.numberOfMatches
            }
            if (req.body.numberOfGoals) {
              joueur.numberOfGoals=req.body.numberOfGoals
            } else {
              joueur.numberOfGoals=joueur.numberOfGoals
            }
            if (req.body.numberOfDecisivePasses) {
              joueur.numberOfDecisivePasses=req.body.numberOfDecisivePasses
            } else {
              joueur.numberOfDecisivePasses=joueur.numberOfDecisivePasses
            }
            if (req.body.nationality) {
              joueur.nationality=req.body.nationality
            } else {
              joueur.nationality=joueur.nationality
            }
            if (req.body.atTheClubSince) {
              joueur.atTheClubSince=req.body.atTheClubSince
            } else {
              joueur.atTheClubSince=joueur.atTheClubSince
            }
            if (req.body.size) {
              joueur.size=req.body.size
            } else {
              joueur.size=joueur.size
            }
            if (req.body.weight) {
              joueur.weight=req.body.weight
            } else {
              joueur.weight=joueur.weight
            }
            if (req.body.strongFoot) {
              joueur.strongFoot=req.body.strongFoot
            } else {
              joueur.strongFoot=joueur.strongFoot
            }
            if (req.body.description) {
              joueur.description=req.body.description
            } else {
              joueur.description=joueur.description
            }
            if (req.body.previousClubName) {
              joueur.previousClubName=req.body.previousClubName
            } else {
                joueur.previousClubName=joueur.previousClubName
            }
            if (req.body.previousClubYears) {
              joueur.previousClubYears=req.body.previousClubYears
            } else {
                joueur.previousClubYears=joueur.previousClubYears
            }
            if (req.body.previousClubNumberOfMatches) {
              joueur.previousClubNumberOfMatches=req.body.previousClubNumberOfMatches
            } else {
                joueur.previousClubNumberOfMatches=joueur.previousClubNumberOfMatches
            }

            if (req.body.language) {

              let language = req.body.language;
  
              if (typeof language === "string") {
                try {
                  language = JSON.parse(language); 
                } catch (e) {
                  return res.status(403).json({ error: "Invalid JSON format for 'language'" });
                }
              }
            
              if (!validateLanguageInput(language)) {
                return res.status(403).json({
                  message: "Invalid language input. Allowed values: 'fr', 'arb'.",
                });
              }
                
              if (!Array.isArray(language) || language.length === 0) {
                return res.status(403).json({ error: "The language array is empty or invalid" });
              }
          
              for (const lang of language) {
                 if (lang === "arb") {
                  if (!req.body.arabicFullName) {
                    return res
                      .status(400)
                      .json({ error: "The arabicFullName is empty" });
                  }
                  if(!req.body.arabicPlaceOfBirth) return res.status(400).json({ error: "the arabicPlaceOfBirth is empty" });
                  if(!req.body.arabicPosition) return res.status(400).json({ error: "the arabicPosition is empty" });
          
                  const allowedArabicPositions = ["حارس المرمى", "لاعب خط وسط", "مدافع", "مهاجم"];
                  if(!allowedArabicPositions.includes(req.body.arabicPosition)) return res.status(403).json({ error: "Invalid arabicPosition, enum: ['حارس المرمى', 'لاعب خط وسط', 'مدافع', 'مهاجم']" });
                  }else if(lang === "fr"){
                    if (!req.body.fullName) {
                      return res
                        .status(400)
                        .json({ error: "The fullName is empty" });
                    }
                    if(!req.body.placeOfBirth) return res.status(400).json({ error: "the placeOfBirth is empty" });
                    if(!req.body.position) return res.status(400).json({ error: "the position is empty" });
            
                    const allowedPositions = ["goalkeeper", "midfielder", "defender", "attacker"];
                    if(!allowedPositions.includes(req.body.position)) return res.status(403).json({ error: "Invalid position, enum: ['attacker', 'midfielder', 'defender', 'goalkeeper']" });
                  }
                }

                joueur.language=language
          }

          if (req.body.arabicFullName) {
            joueur.arabicFullName=req.body.arabicFullName
          }

          if (req.body.arabicPlaceOfBirth) {
            joueur.arabicPlaceOfBirth=req.body.arabicPlaceOfBirth
          }

          if (req.body.arabicPosition) {
            const allowedArabicPositions = ["حارس المرمى", "لاعب خط وسط", "مدافع", "مهاجم"];
            if(!allowedArabicPositions.includes(req.body.arabicPosition)) return res.status(403).json({ error: "Invalid arabicPosition, enum: ['حارس المرمى', 'لاعب خط وسط', 'مدافع', 'مهاجم']" });

            joueur.arabicPosition=req.body.arabicPosition
          }

          if (req.body.arabicNationality) {
            joueur.arabicNationality=req.body.arabicNationality
          }

          if (req.body.arabicStrongFoot) {
            joueur.arabicStrongFoot=req.body.arabicStrongFoot
          }

          if (req.body.arabicDescription) {
            joueur.arabicDescription=req.body.arabicDescription
          }

          if (req.body.arabicPreviousClubName) {
            joueur.arabicPreviousClubName=req.body.arabicPreviousClubName
          }

          if (req.body.arabicFullName) {
            joueur.arabicFullName=req.body.arabicFullName
          }

            joueur.modificationDate=Date();
            joueur.editedBy= club;

            await joueur.save();
            club.joueur=joueur;
            await club.save();
            if((!req.body.previousClubName)&&(!req.body.arabicPreviousClubName)&&(!req.body.previousClubNumberOfMatches)&&
            (!req.body.previousClubYears)&&(!req.body.arabicDescription)&&(!req.body.arabicStrongFoot)&&(!req.body.arabicFullName)&&
            (!req.body.description)&&(!req.body.strongFoot)&&(!req.body.numberPhone)&&(!req.body.fullName)&&
            (!req.body.weight)&&(!req.body.size)&&(!imageFiles)&&(!videoFiles)&&(!req.body.atTheClubSince)&&
            (!req.body.nationality)&&(!req.body.arabicNationality)&&(!req.body.numberOfDecisivePasses)&&(!req.body.numberOfGoals)&&
            (!req.body.numberOfMatches)&&(!req.body.arabicPosition)&&(!req.body.arabicPlaceOfBirth)&&
            (!req.body.position)&&(!req.body.placeOfBirth)&&(!req.body.dateOfBirth)&&(!req.body.tShirtNumber)) {
              return res.status(406).json({ error: "please modify at least one field" });
            } else {
              const updatedJoueur = await Joueur.findOne({ _id: joueur._id }).select("-__v");

              io.emit("joueurUpdated", { action: "update", data: updatedJoueur });

              res.status(201).json({ message: "the player was modified", joueur: updatedJoueur }); 
            }
          
        }catch (error:any) {
          if (error.name === 'ValidationError') {
            // Extracting error messages from Mongoose validation error
            const errorMessages = Object.values(error.errors).map((err:any) =>err.path+" is not a "+err.valueType+" , please enter a "+err.kind);
      
            // Sending validation error messages to the front end
            res.status(501).json({ error: errorMessages });
          } else {
            // If it's not a validation error, handle other types of errors
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
          }
        }
      };
      exports.getAllByPosition = async (req: k, res: Response) => {
        try {
          const club = await Club.findOne({ _id: req.auth._id });
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
      exports.getAllByFullName = async (req: k, res: Response) => {
        try {
          const club = await Club.findOne({ _id: req.auth._id });
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
      
      exports.getNumberPlayersByAgeRange = async (req:any, res:any) => {
        try {
            const club = await Club.findOne({ _id: req.auth._id });
    
            let filter: any = {
                createdBy: club,
            };
    
            const joueurs = await Joueur.find(filter).select("-__v");
    
            // Transform the date of birth to age and filter based on startingAge and finalAge
            const playersWithAge = joueurs
                .map((joueur: any) => {
                    const birthDate = new Date(joueur.dateOfBirth);
                    const age = new Date().getFullYear() - birthDate.getFullYear();
                    return { ...joueur.toObject(), age };
                })
                .filter((player: any) => {
                    const { age } = player;
                    const startingAge = req.query.startingAge !== undefined ? req.query.startingAge : 0;
                    const finalAge = req.query.finalAge !== undefined ? req.query.finalAge : 100;
    
                    return age >= startingAge && age <= finalAge;
                })
                .map((player: any) => {
                    const { age, ...playerWithoutAge } = player;
                    return playerWithoutAge;
                });

            const startingAge= req.query.startingAge || 0;
            const finalAge= req.query.finalAge || 100

            res.status(200).json({message:"The number of "+club.name+" club players with an age range between "+startingAge+" and "+finalAge+" years old are : "+playersWithAge.length});
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };

    const allowedLanguages = ["fr", "arb"]; 

function validateLanguageInput(languages:any) {
  return Array.isArray(languages) && languages.every(lang => allowedLanguages.includes(lang));
}
    