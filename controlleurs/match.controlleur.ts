import { Request, Response } from "express";
const Club = require("../models/club.model");
const Match = require("../models/match.model");
const Joueur = require("../models/joueur.model");
import mongoose from "mongoose";
import { ObjectId } from "mongoose";
import * as FirebaseService from "../middleware/FirebaseService";
import Expo from "expo-server-sdk";
const { io } = require("../index");

const expo = new Expo();
interface k extends Request {
  auth: { _id: ObjectId };
}

exports.register = async (req: k, res: Response) => {
  const club = await Club.findOne({ _id: req.auth._id }).populate("match");

  if (!req.body.titled)
    return res.status(400).json({ error: "the titled is empty" });
  if (!req.body.stadiumName)
    return res.status(400).json({ error: "the stadiumName is empty" });

  if (!('delayed' in req.body)) {
    return res.status(400).json({ error: "the delayed is required" });
  }
  if (req.body.delayed === "") {
    return res.status(400).json({ error: "the delayed is empty" });
  }

  if (!req.body.description)
    return res.status(400).json({ error: "the description is empty" });

  if (!('seats' in req.body)) {
    return res.status(400).json({ error: "the seats is required" });
  }

  if (Object.keys(req.body.seats).length === 0) {
    return res.status(400).json({ error: "the seats is empty" });
  }


  if (req.body.delayed === false) {
    if (!req.body.date)
      return res.status(400).json({ error: "the date is empty" });
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
    const dateFormatRegex1 = /^\d{4}\/\d{2}\/\d{2}$/;
    if (
      !dateFormatRegex.test(req.body.date) &&
      !dateFormatRegex1.test(req.body.date)
    ) {
      return res.status(400).json({
        error: "Invalid date format. Please use YYYY-MM-DD or YYYY/MM/DD",
      });
    }
    if (!req.body.hour)
      return res.status(400).json({ error: "the hour is empty" });

    const hourFormatRegex = /^\d{2}:\d{2}$/;
    const hourFormatRegex1 = /^\d{2}:\d{2}$/;
    if (!hourFormatRegex.test(req.body.hour) && !hourFormatRegex1.test(req.body.hour)) {
      return res.status(400).json({
        error: `Invalid hour "${req.body.hour}" format. Please use HH:MM`,
      });
    }
  }
  if (!req.body.nameAdversary)
    return res.status(400).json({ error: "nameAdversary is empty" });
  const imageFiles =
    req.files &&
    (req.files as { [fieldname: string]: Express.Multer.File[] })[
      "adversaryLogo"
    ];
  if (!imageFiles)
    return res.status(400).json({ error: "the adversaryLogo is empty" });

  

  try {
    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  
    const match = new Match({
      titled: req.body.titled,
      stadiumName: req.body.stadiumName,
      delayed: req.body.delayed,
      date: req.body.delayed ? null : req.body.date,
      hour: req.body.delayed ? null : req.body.hour,
      competition: req.body.competition,
      numberOfGoals: req.body.numberOfGoals || 0,
      goalkeeper: req.body.goalkeeper,
      defender: req.body.defender,
      midfielder: req.body.midfielder,
      attacker: req.body.attacker,
      myClubName: club.name,
      myClubResult: req.body.myClubResult || 0,
      nameAdversary: req.body.nameAdversary,
      resultAdversary: req.body.resultAdversary || 0,
      displayNotif: req.body.displayNotif,
      notifTitle: req.body.notifTitle,
      notifBody: req.body.notifBody,
      adversaryLogo: imageFiles,
      notified: req.body.notified,
      description: req.body.description,
      seats: req.body.seats,
      createdDate: localNow,
      createdBy: club,
    });

    if (req.body.date) {
      // Gestion multiple des formats de date
      let year: number, month: number, day: number;
      const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateFormatRegex.test(req.body.date)) {
        [year, month, day] = req.body.date.split("-").map(Number);
      } else {
        [year, month, day] = req.body.date.split("/").map(Number);
      }

      const [hours, minutes] = req.body.hour.split(":").map(Number);

      const date1 = new Date(Date.UTC(year, month - 1, day, hours, minutes));

      // Vérification si date1 est valide
      if (isNaN(date1.getTime())) {
        return res.status(400).json({ error: "Invalid Date" });
      }

      if (date1.getTime() <= localNow.getTime()) {
        // Réinitialisation du tableau joueurs
        const joueurs = [];
        if (req.body.joueurs && Array.isArray(req.body.joueurs)) {
          const uniqueJoueursSet = new Set();
          for (const joueur of req.body.joueurs) {
            if (!joueur.joueurId)
              return res.status(400).json({ error: "the joueurId in joueurs is empty" });
            if (!joueur.minute)
              return res.status(400).json({ error: "the minute in joueurs is empty" });

            if (!mongoose.Types.ObjectId.isValid(joueur.joueurId))
              return res.status(403).json({ message: "the joueurId is invalid" });

            const joueurExists = await Joueur.findOne({
              _id: joueur.joueurId,
              createdBy: club,
            });
            if (!joueurExists) {
              return res.status(404).json({
                error: `Joueur with joueurId '${joueur.joueurId}' does not exist`,
              });
            }

            const uniqueKey = `${joueur.joueurId}-${joueur.minute}`;
            if (uniqueJoueursSet.has(uniqueKey)) {
              return res.status(409).json({
                error: `Duplicate 'minute' value '${joueur.minute}' is not allowed in the joueurs array`,
              });
            }

            uniqueJoueursSet.add(uniqueKey);

            joueurs.push({
              joueurId: joueurExists._id,
              fullName: joueurExists.fullName,
              minute: joueur.minute,
            });
          }
        }
        match.joueurs = joueurs;
      }
    } else {
      // Réinitialisation du tableau joueurs
      const joueurs = [];
      if (req.body.joueurs) {
        if (!Array.isArray(req.body.joueurs)) {
          return res.status(409).json({ error: "joueurs must be an array" });
        }
      }
      if (req.body.joueurs && Array.isArray(req.body.joueurs)) {
        const uniqueJoueursSet = new Set();
        for (const joueur of req.body.joueurs) {
          if (!joueur.joueurId)
            return res.status(400).json({ error: "the joueurId in joueurs is empty" });
          if (!joueur.minute)
            return res.status(400).json({ error: "the minute in joueurs is empty" });

          if (!mongoose.Types.ObjectId.isValid(joueur.joueurId))
            return res.status(403).json({ message: "the joueurId is invalid" });

          const joueurExists = await Joueur.findOne({
            _id: joueur.joueurId,
            createdBy: club,
          });
          if (!joueurExists) {
            return res.status(404).json({
              error: `Joueur with joueurId '${joueur.joueurId}' does not exist`,
            });
          }

          const uniqueKey = `${joueur.joueurId}-${joueur.minute}`;
          if (uniqueJoueursSet.has(uniqueKey)) {
            return res.status(409).json({
              error: `Duplicate 'minute' value '${joueur.minute}' is not allowed in the joueurs array`,
            });
          }

          uniqueJoueursSet.add(uniqueKey);

          joueurs.push({
            joueurId: joueurExists._id,
            fullName: joueurExists.fullName,
            minute: joueur.minute,
          });
        }
      }
      match.joueurs = joueurs;
    }

  
    if (!req.body.resultAdversary || !req.body.myClubResult) {
      match.state = false;
    } else {
      match.state = true;
    }
    await match.save();
    club.match = match;
    await club.save();

    const match1 = await Match.findOne({ _id: match._id }).select("-__v");

    io.emit("matchUpdated", { action: "create", data: match1 });

    res.status(201).json({ message: "The match is created", match: match1 });

    if (match.displayNotif) {
      let notifbody =
        match.myClubName +
        "  " +
        match.myClubResult +
        "--" +
        match.resultAdversary +
        "  " +
        match.nameAdversary;
      if (match.notifBody !== undefined) {
        notifbody = match.notifBody;
      }
      const tokens = await FirebaseService.getallToken();
      if (tokens) {
        try {
          for (const token of tokens) {
            if (token.token) {
              expo.sendPushNotificationsAsync([
                {
                  to: token.token,
                  title: match.notifTitle || req.body.titled,
                  body: notifbody,
                  data: { url: "matche" },
                },
              ]);
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  } catch (error: any) {
    if (error.name === "ValidationError") {
      // Extracting error messages from Mongoose validation error
      const errorMessages = Object.values(error.errors).map(
        (err: any) =>
          err.path +
          " is not a " +
          err.valueType +
          " , please enter a " +
          err.kind
      );

      // Sending validation error messages to the front end
      res.status(501).json({ error: errorMessages });
    } else {
      // If it's not a validation error, handle other types of errors
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

exports.getAll = async (req: k, res: Response) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const nameAdversary = req.query.nameAdversary as string;
    let match;

    const club = await Club.findOne({ _id: req.auth._id });
    match = await Match.find({ createdBy: club }).select("-__v");

    if (startDate && endDate) {
      const startFilterDate = new Date(startDate.replace(/\//g, "-"));
      const endFilterDate = new Date(endDate.replace(/\//g, "-"));

      if (isNaN(startFilterDate.getTime()) || isNaN(endFilterDate.getTime())) {
        return res.status(400).json({
          error: "Invalid date format. Please use YYYY-MM-DD or YYYY/MM/DD",
        });
      }

      match = match.filter((m: any) => {
        const matchDate = new Date(m.date);
        return matchDate >= startFilterDate && matchDate <= endFilterDate;
      });
    }

    if (nameAdversary) {
      const nameAdversaryRegex = new RegExp(nameAdversary, "i");
      match = match.filter((m: any) =>
        nameAdversaryRegex.test(m.nameAdversary)
      );
    }

    res.status(200).json(match);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};

exports.getNumberMatchsByMonth = async (req: any, res: any) => {
  try {
    const monthQuery = req.query.month as string;
    const yearQuery = req.query.year as string;

    const club = await Club.findOne({ _id: req.auth._id });
    let matches;

    matches = await Match.find({ createdBy: club }).select("-__v");

    if (monthQuery && yearQuery) {
      // Convert numeric month to abbreviated month format (e.g., "12" to "Dec")
      const monthAbbreviation = new Date(
        `${yearQuery}-${monthQuery}-01`
      ).toLocaleString("default", { month: "short" });

      const filteredMatches = matches.filter((match: any) => {
        const matchDate = new Date(match.date);
        const matchYear = matchDate.getFullYear().toString();
        const matchMonth = matchDate.toLocaleString("default", {
          month: "short",
        });

        return matchYear === yearQuery && matchMonth === monthAbbreviation;
      });

      matches = filteredMatches;
    }

    if (monthQuery && yearQuery) {
      res.status(200).json({
        message:
          "The number of " +
          club.name +
          " club matches for the month " +
          monthQuery +
          " of the year " +
          yearQuery +
          " is : " +
          matches.length +
          " matches",
      });
    } else {
      res.status(200).json({
        message:
          "The number of " +
          club.name +
          " club matches is : " +
          matches.length +
          " matches",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};

exports.getPlayerGoalNumberForClub = async (req: any, res: any) => {
  try {

    const club = await Club.findOne({ _id: req.auth._id });
   
    if (!mongoose.Types.ObjectId.isValid(req.params.joueurId))
      return res.status(403).json({ message: "the joueurId is invalid" });    

    const joueurExists = await Joueur.findOne({
      _id: req.params.joueurId, createdBy: club
    });
    if (!joueurExists) {
      return res.status(404).json({
        error: `Joueur with joueurId '${req.params.joueurId}' does not exist`,
      });
    }

    const matches= await Match.find({createdBy:club,"joueurs.joueurId":joueurExists._id})

    let totalGoals = 0;
    matches.forEach((match:any) => {
      match.joueurs.forEach((joueur:any) => {
        if (joueur.joueurId.equals(joueurExists._id)) {
          totalGoals += 1;
        }
      });
    });

    res.status(200).json({
      message: `The number of goals scored by ${joueurExists.fullName} for the ${club.name} club is: ${totalGoals} goals.`,
    });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};

exports.getAllClubScorers = async (req: any, res: any) => {
  try {

    const club = await Club.findOne({ _id: req.auth._id });
   
    const joueurs = await Joueur.find({ createdBy: club });
    
    if (!joueurs || joueurs.length === 0) {
      return res.status(404).json({ error: "No players found for this club" });
    }

    const matches = await Match.find({ createdBy: club });

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

exports.getMatch = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "the id is invalid" });

    let match = await Match.findOne({ _id: req.params.id })
      .select("-__v")
      .populate("createdBy", "-password -__v")
      .populate("editedBy", "-password -__v");
    if (!match)
      return res.status(404).json({ message: "the match does not exist" });
    res.status(200).json(match);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
exports.deleteMatch = async (req: k, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "the id is invalid" });
    const match = await Match.findOne({ _id: req.params.id });
    if (!match)
      return res.status(404).json({ message: "the match does not exist" });
    const club = await Club.findOne({ _id: req.auth._id });
    if (club._id.toString() !== match.createdBy.toString())
      return res.status(401).json({
        error: "you are not allowed to remove a match from another club",
      });
    await Match.findOneAndDelete({ _id: req.params.id });

    io.emit("matchUpdated", { action: "delete", id: req.params.id });

    res.status(201).json({ message: "The match was deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
exports.deleteAll = async (req: k, res: Response) => {
  try {
    const club = await Club.findOne({ _id: req.auth._id });
    await Match.deleteMany({ createdBy: club });

    io.emit("matchUpdated", { action: "deleteAll", clubName: club.name });

    return res.status(200).json({
      msg: "all " + club.name + " matchs have been successfully deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
exports.setMatch = async (req: k, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(401).json({ message: "the id is invalid" });

  const match = await Match.findOne({ _id: req.params.id });
  if (!match)
    return res.status(404).json({ message: "the match does not exist" });
  const club = await Club.findOne({ _id: req.auth._id });
  if (club._id.toString() !== match.createdBy.toString())
    return res.status(400).json({
      error: "you are not allowed to modify a match from another club",
    });
  try {
    const imageFiles =
      req.files &&
      (req.files as { [fieldname: string]: Express.Multer.File[] })[
        "adversaryLogo"
      ];
    if (imageFiles) {
      match.adversaryLogo = imageFiles;
    } else {
      match.adversaryLogo = match.adversaryLogo;
    }
    if (req.body.titled) {
      match.titled = req.body.titled;
    } else {
      match.titled = match.titled;
    }
    if (req.body.stadiumName) {
      match.stadiumName = req.body.stadiumName;
    } else {
      match.stadiumName = match.stadiumName;
    }
    if (req.body.competition) {
      match.competition = req.body.competition;
    } else {
      match.competition = match.competition;
    }

    if ('delayed' in req.body) {
      if (req.body.delayed === true) {
        match.delayed = true;
        match.date = null;
        match.hour = null;
      }
      else {
        match.delayed = false;
        if ('date' in req.body) {
          const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
          const dateFormatRegex1 = /^\d{4}\/\d{2}\/\d{2}$/;
          if (
            !dateFormatRegex.test(req.body.date) &&
            !dateFormatRegex1.test(req.body.date)
          ) {
            return res.status(406).json({
              error: "Invalid date format. Please use YYYY-MM-DD or YYYY/MM/DD",
            });
          }
          match.date = new Date(req.body.date);
        }
        else {
          return res.status(400).json({ error: "the date is required" });
        }

        if ('hour' in req.body) {
          const hourFormatRegex = /^\d{2}:\d{2}$/;
          const hourFormatRegex1 = /^\d{2}:\d{2}$/;
          if (!hourFormatRegex.test(req.body.hour) && !hourFormatRegex1.test(req.body.hour)) {
            return res.status(400).json({
              error: `Invalid hour "${req.body.hour}" format. Please use HH:MM`,
            });
          }
          match.hour = req.body.hour;
        }
        else {
          return res.status(400).json({ error: "the hour is required" });
        }
      }
    }

    if (req.body.numberOfGoals) {
      match.numberOfGoals = req.body.numberOfGoals;
    } else {
      match.numberOfGoals = match.numberOfGoals;
    }
    if (req.body.defender) {
      match.defender = req.body.defender;
    } else {
      match.defender = match.defender;
    }
    if (req.body.midfielder) {
      match.midfielder = req.body.midfielder;
    } else {
      match.midfielder = match.midfielder;
    }
    if (req.body.attacker) {
      match.attacker = req.body.attacker;
    } else {
      match.attacker = match.attacker;
    }
    if (req.body.goalkeeper) {
      match.goalkeeper = req.body.goalkeeper;
    } else {
      match.goalkeeper = match.goalkeeper;
    }
    if (req.body.myClubResult) {
      match.myClubResult = req.body.myClubResult;
    } else {
      match.myClubResult = match.myClubResult;
    }
    if (req.body.nameAdversary) {
      match.nameAdversary = req.body.nameAdversary;
    } else {
      match.nameAdversary = match.nameAdversary;
    }
    if (req.body.resultAdversary) {
      match.resultAdversary = req.body.resultAdversary;
    } else {
      match.resultAdversary = match.resultAdversary;
    }
    if (req.body.displayNotif !== undefined) {
      match.displayNotif = req.body.displayNotif;
    } else {
      match.displayNotif = match.displayNotif;
    }

    if (req.body.notifTitle !== undefined) {
      match.notifTitle = req.body.notifTitle;
    } else {
      match.notifTitle = match.notifTitle;
    }

    if (req.body.notifBody !== undefined) {
      match.notifBody = req.body.notifBody;
    } else {
      match.notifBody = match.notifBody;
    }
    if (req.body.notified) {
      match.notified = req.body.notified;
    } else {
      match.notified = match.notified;
    }
    if (req.body.description) {
      match.description = req.body.description;
    } else {
      match.description = match.description;
    }
    const joueurs = [];
    if (req.body.joueurs) {
      if (!Array.isArray(req.body.joueurs)) {
        return res.status(409).json({ error: "joueurs must be an array" });
      }
    }
    if (req.body.joueurs && Array.isArray(req.body.joueurs)) {
      const uniqueJoueursSet = new Set();
      for (const joueur of req.body.joueurs) {
        if (!joueur.joueurId)
          return res.status(400).json({ error: "the joueurId in joueurs is empty" });
        if (!joueur.minute)
          return res.status(400).json({ error: "the minute in joueurs is empty" });

        if (!mongoose.Types.ObjectId.isValid(joueur.joueurId))
          return res.status(403).json({ message: "the joueurId is invalid" });

        const joueurExists = await Joueur.findOne({
          _id: joueur.joueurId,
          createdBy: club,
        });
        if (!joueurExists) {
          return res.status(404).json({
            error: `Joueur with joueurId '${joueur.joueurId}' does not exist`,
          });
        }

        const uniqueKey = `${joueur.joueurId}-${joueur.minute}`;
        if (uniqueJoueursSet.has(uniqueKey)) {
          return res.status(409).json({
            error: `Duplicate 'minute' value '${joueur.minute}' is not allowed in the joueurs array`,
          });
        }

        uniqueJoueursSet.add(uniqueKey);

        joueurs.push({
          joueurId: joueurExists._id,
          fullName: joueurExists.fullName,
          minute: joueur.minute,
        });
      }
      match.joueurs=joueurs
    } else {
      match.joueurs=match.joueurs
    }

    match.modificationDate = Date();
    match.editedBy = club;

    await match.save();
    club.match = match;
    await club.save();
    if (
      !req.body.goalkeeper &&
      !req.body.myClubResult &&
      !req.body.attacker &&
      !req.body.midfielder &&
      !req.body.defender &&
      !req.body.numberOfGoals &&
      !req.body.hour &&
      !req.body.date &&
      !req.body.stadiumName &&
      !req.body.delayed &&
      !imageFiles &&
      !req.body.titled &&
      !req.body.competition &&
      !req.body.notified &&
      !req.body.nameAdversary &&
      !req.body.resultAdversary &&
      !req.body.displayNotif &&
      !req.body.notifTitle &&
      !req.body.notifBody &&
      !req.body.description&&
      (!req.body.joueurs || req.body.joueurs.length === 0)
    ) {
      return res
        .status(403)
        .json({ error: "please modify at least one field" });
    } else {
      const match1 = await Match.findOne({ _id: match._id }).select("-__v");

      io.emit("matchUpdated", { action: "update", data: match1 });

      res
        .status(201)
        .json({ message: "the match was modified", match: match1 });

        if (match.displayNotif) {
          let notifbody =
            match.myClubName +
            "  " +
            match.myClubResult +
            "--" +
            match.resultAdversary +
            "  " +
            match.nameAdversary;

          const tokens = await FirebaseService.getallToken();
          if (tokens) {
            try {
              for (const token of tokens) {
                if (token.token) {
                  expo.sendPushNotificationsAsync([
                    {
                      to: token.token,
                      title: match.notifTitle || req.body.titled,
                      body: notifbody,
                      data: { url: "matche" },
                    },
                  ]);
                }
              }
            } catch (error) {
              console.log(error);
            }
          }
        }
    }
  } catch (error: any) {
    if (error.name === "ValidationError") {
      // Extracting error messages from Mongoose validation error
      const errorMessages = Object.values(error.errors).map(
        (err: any) =>
          err.path +
          " is not a " +
          err.valueType +
          " , please enter a " +
          err.kind
      );

      // Sending validation error messages to the front end
      res.status(501).json({ error: errorMessages });
    } else {
      // If it's not a validation error, handle other types of errors
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};
