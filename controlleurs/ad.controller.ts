import { Request, Response } from "express";
import { ObjectId } from "mongoose";
const Ad = require("../models/ad.model");
const Club = require("../models/club.model");
import mongoose from "mongoose";
interface k extends Request {
    auth: { _id: ObjectId };
    body: {
        title: string;
        description: string;
        isShown?: boolean;
        video?: string;
        location:number;
        duration:string
    };
}

function isEmpty(field: string | number  | undefined) {
    if (typeof field === 'number') {
        return false;  // Les nombres ne sont jamais "vides"
    }
    return !field || (typeof field === "string" && field.trim() === "");
}

exports.create = async (req: k, res: Response) => {

    const club = await Club.findOne({ _id: req.auth._id })
    if (!club) {
        return res.status(400).json({ error: "club doesn't exist" }); // Add return here
      }


    const totalItems = await Ad.countDocuments({createdBy:club});
    if (totalItems > 4) {
      return res
        .status(404)
        .json({ error: "Not allowed, you cannot create more than 5 ads!" });
    }


    const { title, description, video, isShown,location,duration } = req.body;
    
    const image =
    req.files &&
    (req.files as { [fieldname: string]: Express.Multer.File[] })[
      "image"
    ];
    const fieldsToCheck = [
        { field: title, name: "title" },
        { field: location, name: "location" },
        { field: duration, name: "duration" },
    ];

    for (const fieldInfo of fieldsToCheck) {
        if (typeof fieldInfo.field === "number") {
            if (fieldInfo.field === undefined || fieldInfo.field === null) {
                return res.status(400).json({ error: `${fieldInfo.name} is required` });
            }
        } else if (isEmpty(fieldInfo.field)) {
            return res.status(400).json({ error: `${fieldInfo.name} is required` });
        }
    }


    if(!image)
        return res
    .status(400)
    .json({ error: "the image is empty" });
        

    if (location > 5 || location < 1)
        return res
          .status(401)
          .json({ error: "location must be between 1 and 5!" });

    const dateFormatRegex = /^\d{2}:\d{2}$/;
    if (
      !dateFormatRegex.test(duration)
    ) {
      return res.status(400).json({
        error: `Invalid duration "${duration}" format. Please use HH:MM`,
      });
    }

    const ad = new Ad({
        title:title,
        description:description,
        image:image,
        video:video,
        isShown: isShown || true,
        location:location,
        duration:duration,
        creationDate:Date(),
        createdBy: club,
    });

    if (!club) {
        return res.status(404).json({ error: "Club not found" });
    }
    try {
        await ad.save();

        const [hours, minutes] = duration.split(':').map(Number);
        const durationInMilliseconds = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);

        setTimeout(async () => {
            ad.isShown = false;
            await ad.save();
        }, durationInMilliseconds);

        const adResponse = {
            ...ad.toObject(),
            createdBy: { _id: club._id, name: club.name },
        };
        delete adResponse.__v;
        res.status(201).json(adResponse);
    }  catch (error:any) {
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

exports.getAll = async (req: k, res: Response) => {
    const club = await Club.findOne({ _id: req.auth._id })
    if (!club) {
        return res.status(400).json({ error: "club doesn't exist" }); // Add return here
      }


    const ad = await Ad.find({ createdBy: club._id}).select("-__v");
    res.status(200).json(ad);
};

exports.getById = async (req: k, res: Response) => {
    const club = await Club.findOne({ _id: req.auth._id })
    
    if (!club) {
        return res.status(400).json({ error: "club doesn't exist" }); // Add return here
      }


    const id = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid ID" });
    }
    const ad = await Ad.findOne({_id:id,createdBy: club._id}) .select("-__v");
    if (!id) {
        return res.status(400).json({ error: "Ad ID is required" });
    }
        
        
    if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
    }
    res.status(200).json(ad);
};

exports.getByClubName = async (req: k, res: Response) => {
    if (!req.params.name) {
        return res.status(400).json({ error: "Club name is required" });
    }
    const club = await Club.findOne({ name: req.params.name });
    if (!club) {
        return res.status(404).json({ error: "Club not found" });
    }

    const ad = await Ad.find({ createdBy: club._id })
        .select("-__v");
    res.status(200).json(ad);
};

exports.update = async (req: any, res: Response) => {
    const { title, description, video, isShown,location,duration } = req.body;
   

    const id = req.params.id;

    const club = await Club.findOne({ _id: req.auth._id })
    if (!club) {
        return res.status(404).json({ error: "Club not found" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid ID" });
    }
    if (!id) {
        return res.status(400).json({ error: "Ad ID is required" });
    }

    const ad = await Ad.findOne({_id:id,createdBy: club._id});
    if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
    }

    if (title) {
        ad.title = title;
    } else {
        ad.title = ad.title
    }
    if (description) {
        ad.description = description;
    } else {
        ad.description = ad.description
    }
    if (isShown!==null && isShown!==undefined) {
        ad.isShown = isShown;
    } else {
        ad.isShown = ad.isShown
    }
    const image =
    req.files &&
    (req.files as { [fieldname: string]: Express.Multer.File[] })[
      "image"
    ];
    if (image) {
        ad.image = image;
    } else {
        ad.image = ad.image
    }
    if (video) {
        ad.video = video;
    } else {
        ad.video = ad.video
    }
    if (location!==null && location!==undefined) {
        if (location > 5 || location < 1)
            return res
              .status(401)
              .json({ error: "location must be between 1 and 5!" });

        ad.location = location;
    } else {
        ad.location = ad.location
    }
    if (duration) {
        const dateFormatRegex = /^\d{2}:\d{2}$/;
        if (
          !dateFormatRegex.test(duration)
        ) {
          return res.status(400).json({
            error: `Invalid duration "${duration}" format. Please use HH:MM`,
          });
        }

        ad.duration = duration;
    } else {
        ad.duration = ad.duration
    }
    
    

    ad.modificationDate=Date()
    ad.editedBy= club._id

    try {
        await ad.save();

        const [hours, minutes] = ad.duration.split(':').map(Number);
        const durationInMilliseconds = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);

        setTimeout(async () => {
            ad.isShown = false;
            await ad.save();
        }, durationInMilliseconds);

        if((!title)&&(!description)&&(isShown===null || isShown===undefined)&&
        (!image)&&(!video)&&(location===null ||location===undefined)&&(!duration)) {
          return res.status(406).json({ error: "please modify at least one field" });
        } else {

        const adResponse = ad.toObject();
        delete adResponse.__v;
        res.status(200).json(adResponse);
        }
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

exports.delete = async (req: k, res: Response) => {
    const id = req.params.id;

    const club = await Club.findOne({ _id: req.auth._id })
    if (!club) {
        return res.status(404).json({ error: "Club not found" });
    }


    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid ID" });
    }
    if (!id) {
        return res.status(400).json({ error: "Ad ID is required" });
    }
    const ad = await Ad.findOne({_id:id,createdBy: club._id});
    if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
    }
    await Ad.findOneAndDelete(id);
    res.status(200).json({ _id: id });
};

exports.changeVisibility = async (req: k, res: Response) => {
    const id = req.params.id;


    const club = await Club.findOne({ _id: req.auth._id })
    if (!club) {
        return res.status(404).json({ error: "Club not found" });
    }


    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid ID" });
    }
    if (!id) {
        return res.status(400).json({ error: "Ad ID is required" });
    }
    const ad = await Ad.findOne({_id:id,createdBy: club._id});
    if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
    }

    if (req.body.isShown === undefined) {
        return res.status(400).json({ error: "isShown is required" });
    }

    if (req.body.isShown === ad.isShown) {
        return res.status(400).json({
            error: `Ad is already ${ad.isShown ? "visible" : "hidden"}`,
        });
    }

    ad.isShown = req.body.isShown;

    try {
        await ad.save();
        const adResponse = ad.toObject();
        delete adResponse.__v;
        res.status(200).json(adResponse);
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
};
