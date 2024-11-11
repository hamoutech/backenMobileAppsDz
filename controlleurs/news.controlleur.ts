import { Request, Response } from "express";
const Club = require("../models/club.model");
const News = require("../models/news.model");
import mongoose from "mongoose";
import { ObjectId } from "mongoose";
import * as FirebaseService from "../middleware/FirebaseService";
import Expo from "expo-server-sdk";
const { io } = require("../index");

const expo = new Expo();
interface k extends Request {
  auth: { _id: ObjectId };
}
exports.register = async (req: any, res: Response) => {
  const {
    articleTitle,
    articleTitleArab,
    description,
    description_arab,
    createdDate,
  } = req.body;

  if (!articleTitle||!description) {
    return res
      .status(400)
      .json({ error: "The articleTitle or description are empty" });
 
  }

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
      return res.status(400).json({ error: "Invalid JSON format for 'language'" });
    }
  }

  if (!validateLanguageInput(language)) {
    return res.status(400).json({
      message: "Invalid language input. Allowed values: 'fr', 'arb'.",
    });
  }
    
  if (!Array.isArray(language) || language.length === 0) {
    return res.status(400).json({ error: "The language array is empty or invalid" });
  }
  let news;
  // Validate titles and descriptions for each selected language
  for (const lang of language) {
    if (lang === "fr") {
      if (!articleTitle) {
        return res
          .status(400)
          .json({ error: "The French articleTitle is empty" });
      }
      news = await News.findOne({ articleTitle });
      if (news) {
        return res.status(401).json({ error: "News already exists" });
      }
      if (!description) {
        return res
          .status(400)
          .json({ error: "The French description is empty" });
      }
      if (description.length < 6) {
        return res.status(400).json({
          error: "The French description must have at least 6 characters",
        });
      }
    } else if (lang === "arb") {
      if (!articleTitleArab) {
        return res
          .status(400)
          .json({ error: "The Arabic articleTitle is empty" });
      }
      news = await News.findOne({ articleTitleArab });
      if (news) {
        return res.status(401).json({ error: "News already exists" });
      }
      if (!description_arab) {
        return res
          .status(400)
          .json({ error: "The Arabic description is empty" });
      }
      if (description_arab.length < 6) {
        return res.status(400).json({
          error: "The Arabic description must have at least 6 characters",
        });
      }
    }
  }

  if (createdDate) {
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
    const dateFormatRegex1 = /^\d{4}\/\d{2}\/\d{2}$/;
    if (
      !dateFormatRegex.test(createdDate) &&
      !dateFormatRegex1.test(createdDate)
    ) {
      return res.status(400).json({
        error: `Invalid date '${createdDate}' format. Please use YYYY-MM-DD or YYYY/MM/DD`,
      });
    }

    const [year, month, day] = createdDate.split("/").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  const now = new Date();
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

  const hours = localNow.getUTCHours();
  const minutes = localNow.getUTCMinutes();
  const seconds = localNow.getUTCSeconds();
  const milliseconds = localNow.getUTCMilliseconds();

  date.setUTCHours(hours, minutes, seconds, milliseconds);

  if (date.toDateString() === localNow.toDateString()) {
    date.setUTCMinutes(minutes + 2);
  }

  if (date < now) {
    return res.status(404).json({
      error: "The createdDate cannot be in the past.",
    });
  }
  }

  try {
    const club = await Club.findOne({ _id: req.auth._id }).populate("news");

    const imageFiles =
      req.files &&
      (req.files as { [fieldname: string]: Express.Multer.File[] })["image"];

    const news1 = new News({
      language,
      articleTitle,
      articleTitleArab,
      description_arab,
      description,
      displayNotif: req.body.displayNotif,
      notifTitle: req.body.notifTitle,
      notifBody: req.body.notifBody,
      image: imageFiles,
      video: req.body.video,
      link: req.body.link,
      createdDate: createdDate? new Date(createdDate): new Date(),
      createdBy: club,
    });

    if (createdDate) {
  
    const [year, month, day] = createdDate.split("/").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
  
    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  
    const hours = localNow.getUTCHours();
    const minutes = localNow.getUTCMinutes();
    const seconds = localNow.getUTCSeconds();
    const milliseconds = localNow.getUTCMilliseconds();
  
    date.setUTCHours(hours, minutes, seconds, milliseconds);
  
    if (date.toDateString() === localNow.toDateString()) {
      news1.status="Validated"
    }else{
      news1.status="Future"
    }
    }else {
      news1.status="Validated"
    }

    await news1.save();
    club.news = news1;
    await club.save();

    const newNews = await News.findOne({ _id: news1._id }).select("-__v");

    res.status(201).json({ message: "The news is created", news: newNews });

    io.emit("newsUpdated", { action: "create", data: newNews });

    const tokens = await FirebaseService.getallToken();
    if (tokens) {
      if (news1.displayNotif) {
        let notifbody = articleTitle;
        if (news1.notifBody !== undefined) {
          notifbody = news1.notifBody;
        }
        try {
          for (const token of tokens) {
            if (token.token) {
              expo.sendPushNotificationsAsync([
                {
                  to: token.token,
                  title: news1.notifTitle,
                  data: { url: "news" },
                },
              ]);
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};

exports.getAll = async (req: k, res: Response) => {
  try {
    const club = await Club.findOne({ _id: req.auth._id });
    const news = await News.find({ createdBy: club }).select("-__v");

    res.status(200).json(news);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
exports.getNews = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "the id is invalid" });

    let news = await News.findOne({ _id: req.params.id })
      .select("-__v")
      .populate("createdBy", "-password -__v")
      .populate("editedBy", "-password -__v");
    if (!news)
      return res.status(404).json({ message: "the news does not exist" });
    res.status(200).json(news);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
exports.deleteNews = async (req: k, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "the id is invalid" });
    const news = await News.findOne({ _id: req.params.id });
    if (!news)
      return res.status(404).json({ message: "the news does not exist" });
    const club = await Club.findOne({ _id: req.auth._id });
    if (club._id.toString() !== news.createdBy.toString())
      return res.status(401).json({
        error: "you are not allowed to remove a news from another club",
      });
    await News.findOneAndDelete({ _id: req.params.id });

    io.emit("newsUpdated", { action: "delete", id: req.params.id });

    res.status(201).json({ message: "The news was deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
exports.deleteAll = async (req: k, res: Response) => {
  try {
    const club = await Club.findOne({ _id: req.auth._id });
    await News.deleteMany({ createdBy: club });

    io.emit("newsUpdated", { action: "deleteAll", clubName: club.name });

    return res.status(200).json({
      msg: "all " + club.name + " news have been successfully deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
exports.setNews = async (req: any, res: Response) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(403).json({ message: "the id is invalid" });

  const news = await News.findOne({ _id: req.params.id });
  if (!news)
    return res.status(404).json({ message: "the news does not exist" });

  const club = await Club.findOne({ _id: req.auth._id });
  if (club._id.toString() !== news.createdBy.toString())
    return res.status(406).json({
      error: "you are not allowed to modify a news from another club",
    });
  console.log(req.body);
  const {
    articleTitle,
    articleTitleArab,
    description,
    description_arab,
    createdDate,
    modificationDate,
    displayNotif,
    notifTitle,
    notifBody,
    link,
  } = req.body;

  if (req.body.language) {

    let language = req.body.language;

  if (typeof language === "string") {
    try {
      language = JSON.parse(language);  // Conversion en tableau
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON format for 'language'" });
    }
  }

  if (!validateLanguageInput(language)) {
    return res.status(400).json({
      message: "Invalid language input. Allowed values: 'fr', 'arb'.",
    });
  }
    
  if (!Array.isArray(language) || language.length === 0) {
    return res.status(400).json({ error: "The language array is empty or invalid" });
  }

  for (const lang of language) {
    if (lang === "fr") {
      if (!articleTitle) {
        return res
          .status(400)
          .json({ error: "The French articleTitle is empty" });
      }
      if (!description) {
        return res
          .status(400)
          .json({ error: "The French description is empty" });
      }
      if (description.length < 6) {
        return res.status(400).json({
          error: "The French description must have at least 6 characters",
        });
      }
    } else if (lang === "arb") {
      if (!articleTitleArab) {
        return res
          .status(400)
          .json({ error: "The Arabic articleTitle is empty" });
      }
      if (!description_arab) {
        return res
          .status(400)
          .json({ error: "The Arabic description is empty" });
      }
      if (description_arab.length < 6) {
        return res.status(400).json({
          error: "The Arabic description must have at least 6 characters",
        });
      }
    }
  }

  news.language=language
}

  try {
    const imageFiles =
      req.files &&
      (req.files as { [fieldname: string]: Express.Multer.File[] })["image"];
    if (imageFiles) {
      news.image = imageFiles;
    }

    if (createdDate) {
      const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
      const dateFormatRegex1 = /^\d{4}\/\d{2}\/\d{2}$/;
      if (
        !dateFormatRegex.test(createdDate) &&
        !dateFormatRegex1.test(createdDate)
      ) {
        return res.status(400).json({
          error: `Invalid date '${createdDate}' format. Please use YYYY-MM-DD or YYYY/MM/DD`,
        });
      }
  
    const [year, month, day] = createdDate.split("/").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
  
    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  
    const hours = localNow.getUTCHours();
    const minutes = localNow.getUTCMinutes();
    const seconds = localNow.getUTCSeconds();
    const milliseconds = localNow.getUTCMilliseconds();
  
    date.setUTCHours(hours, minutes, seconds, milliseconds);
  
    if (date.toDateString() === localNow.toDateString()) {
      date.setUTCMinutes(minutes + 2);
    }
  
    if (date < now) {
      return res.status(404).json({
        error: "The createdDate cannot be in the past.",
      });
    }

    const date1 = new Date(Date.UTC(year, month - 1, day));

    date1.setUTCHours(hours, minutes, seconds, milliseconds);

    if (date1.toDateString() === localNow.toDateString()) {
      news.status="Validated"
    }else{
      news.status="Future"
    }

      news.createdDate = new Date(createdDate);
    }

    if (modificationDate) {
      const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
      const dateFormatRegex1 = /^\d{4}\/\d{2}\/\d{2}$/;
      if (
        !dateFormatRegex.test(modificationDate) &&
        !dateFormatRegex1.test(modificationDate)
      ) {
        return res.status(400).json({
          error: `Invalid date '${modificationDate}' format. Please use YYYY-MM-DD or YYYY/MM/DD`,
        });
      }
  
      news.modificationDate = new Date(modificationDate);
    }

    if (req.body.video) {
      news.video = req.body.video;
    } else {
      news.video = news.video;
    }

    if (description) {
      if (description.length < 6) {
        return res.status(401).json({
          error: "The French description must have at least 6 characters",
        });
      }
      news.description = description;
    }

    if (description_arab) {
      if (description_arab.length < 6) {
        return res.status(401).json({
          error: "The Arabic description must have at least 6 characters",
        });
      }
      news.description_arab = description_arab;
    }

    if (articleTitleArab !== undefined) {
      if (articleTitleArab !== news.articleTitleArab) {
        const existingNews = await News.findOne({
          articleTitleArab,
        });
        if (existingNews) {
          return res
            .status(400)
            .json({ error: "The articleTitleArab already exists" });
        }
      news.articleTitleArab = articleTitleArab;
      }
    }

    if (displayNotif !== undefined) {
      news.displayNotif = displayNotif;
    }
    if (link !== undefined) {
      news.link = link;
    }

    if (notifTitle !== undefined) {
      news.notifTitle = notifTitle;
    }

    if (notifBody !== undefined) {
      news.notifBody = notifBody;
    }

    if (articleTitle) {
      if (articleTitle !== news.articleTitle) {
        const existingNews = await News.findOne({
          articleTitle,
        });
        if (existingNews) {
          return res
            .status(400)
            .json({ error: "The articleTitle already exists" });
        }
        news.articleTitle = articleTitle;
      }
    }

    news.editedBy = club;

    await news.save();
    club.news = news;
    await club.save();

    if (
      !articleTitle &&
      !articleTitleArab &&
      !description &&
      !description_arab &&
      !createdDate &&
      !modificationDate &&
      !displayNotif &&
      !notifTitle &&
      !notifBody &&
      !imageFiles &&
      !req.body.video &&
      !link
    ) {
      return res
        .status(403)
        .json({ error: "Please modify at least one field" });
    } else {
      const updatedNews = await News.findOne({ _id: news._id }).select("-__v");

      io.emit("newsUpdated", { action: "update", data: updatedNews });

      res
        .status(201)
        .json({ message: "The news was modified", news: updatedNews });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

const allowedLanguages = ["fr", "arb"]; 

function validateLanguageInput(languages:any) {
  return Array.isArray(languages) && languages.every(lang => allowedLanguages.includes(lang));
}
