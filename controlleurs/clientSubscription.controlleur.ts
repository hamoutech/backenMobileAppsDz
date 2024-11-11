import { Request, Response } from "express";
const Club = require("../models/club.model");
const Carte = require("../models/carte.model");
const Client = require("../models/client.model");
const ClientSubscription = require("../models/clientSubscription.model");
import mongoose from "mongoose";
import { ObjectId } from "mongoose";
const cron = require("node-cron");
interface k extends Request {
  auth: { _id: ObjectId };
}

exports.create = async (req: k, res: Response) => {
  if (!req.body.carteId)
    return res.status(400).json({ error: "the carteId is empty" });

  const client = await Client.findOne({ _id: req.auth._id });

  const club = await Club.findOne({ name:client.clubName });

  if (!mongoose.Types.ObjectId.isValid(req.body.carteId))
    return res.status(400).json({ message: "the carteId is invalid" });

  const carte = await Carte.findOne({ _id: req.body.carteId, createdBy: club })
  if (!carte)
    return res.status(404).json({ message: "the carte does not exist" });
  
  try {

    const clientSubscription1 = new ClientSubscription({
      clientId: client._id,
      clientPseudo: client.pseudo,
      carteId: carte._id,
      carteTitled: carte.titled,
      numberOfMatches: carte.numberOfMatches,
      isRenewable: false,
      isActive: false,
      creationDate: new Date(),
      clubName:club.name,
      clubId: club._id,
      createdBy: client,
    });

    await clientSubscription1.save();

    const clientSubscription= await ClientSubscription.findOne({_id:clientSubscription1._id}).select("-__v")

    res.status(201).json({ message: "The client subscription is created", clientSubscription: clientSubscription });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};

exports.getAll = async (req: k, res: Response) => {
    try {
      const club = await Club.findOne({ _id: req.auth._id });

      const clientSubscriptions = await ClientSubscription.find({ clubId: club._id }).select("-__v");
   
      res.status(200).json({clientSubscriptions: clientSubscriptions});
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
    
      const clientSubscription = await ClientSubscription.findOne({ _id: req.params.id, clubId: club._id }).select(
        "-__v"
      );
      if (!clientSubscription)
        return res.status(404).json({ message: "the client subscription does not exist" });

      res.status(200).json({clientSubscription: clientSubscription});
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };

exports.getAllForClient = async (req: k, res: Response) => {
  try {
    const client = await Client.findOne({ _id: req.auth._id });

    const clientSubscriptions = await ClientSubscription.find({ clientId: client._id }).select("-__v");

    res.status(200).json({clientSubscriptions:clientSubscriptions});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};

exports.getByIdForClient = async (req: k, res: Response) => {
  try {
    const client = await Client.findOne({ _id: req.auth._id });

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "the id is invalid" });

    const clientSubscription = await ClientSubscription.findOne({ _id: req.params.id, clientId: client._id }).select(
      "-__v"
    );
    if (!clientSubscription)
      return res.status(404).json({ message: "the client subscription does not exist" });

    res.status(200).json({clientSubscription: clientSubscription});
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};
exports.deleteById = async (req: k, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(403).json({ message: "the id is invalid" });

    const clientSubscription = await ClientSubscription.findOne({ _id: req.params.id });
    if (!clientSubscription)
      return res.status(404).json({ message: "the client subscription does not exist" });

    const club = await Club.findOne({ _id: req.auth._id });

    if (club._id.toString() !== clientSubscription.clubId.toString())
      return res.status(401).json({
        error: "you are not allowed to remove a client subscription from another club",
      });

    await ClientSubscription.findOneAndDelete({ _id: req.params.id });

    res.status(201).json({ message: "The client subscription was deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};

exports.activated = async (req: k, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(401).json({ message: "the id is invalid" });
  
    const clientSubscription = await ClientSubscription.findOne({ _id: req.params.id });
    if (!clientSubscription)
      return res.status(404).json({ message: "the clientSubscription does not exist" });
  
    const club = await Club.findOne({ _id: req.auth._id });
  
    if (club._id.toString() !== clientSubscription.clubId.toString())
      return res.status(400).json({
        error: "you are not allowed to activated a client subscription from another club",
      });
  
   if (clientSubscription.isActive=== true) {
      return res.status(403).json({
          error: "Customer subscription is already activated!",
        });
   }

   const carte= await Carte.findOne({_id: clientSubscription.carteId})

   const duration= carte.duration
   const now = new Date();

   const endDate = new Date(
    now.setDate(now.getDate() + duration)
  );

  const year = endDate.getFullYear();
  const month = endDate.getMonth() + 1;
  const day = endDate.getDate();

   clientSubscription.isActive= true
   clientSubscription.startDate= new Date()
   clientSubscription.endDate= new Date(`${year}/${month}/${day}`);

    await clientSubscription.save();

    const clientSubscription1 = await ClientSubscription.findOne({ _id: clientSubscription._id }).select("-__v");

    res.status(201).json({ message: "the client subscription was activated", clientSubscription: clientSubscription1 });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};

exports.disabled = async (req: k, res: Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(401).json({ message: "the id is invalid" });
    
      const clientSubscription = await ClientSubscription.findOne({ _id: req.params.id });
      if (!clientSubscription)
        return res.status(404).json({ message: "the clientSubscription does not exist" });
    
      const club = await Club.findOne({ _id: req.auth._id });
    
      if (club._id.toString() !== clientSubscription.clubId.toString())
        return res.status(400).json({
          error: "you are not allowed to disabled a client subscription from another club",
        });
    
     if (clientSubscription.isActive=== false) {
        return res.status(403).json({
            error: "Customer subscription is already deactivated!",
          });
     }
  
     clientSubscription.isActive= false
  
      await clientSubscription.save();
  
      const clientSubscription1 = await ClientSubscription.findOne({ _id: clientSubscription._id }).select("-__v");
  
      res.status(201).json({ message: "the client subscription was disabled", clientSubscription: clientSubscription1 });
      
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };
  
exports.renewed = async (req: k, res: Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(401).json({ message: "the id is invalid" });
    
      const clientSubscription = await ClientSubscription.findOne({ _id: req.params.id });
      if (!clientSubscription)
        return res.status(404).json({ message: "the clientSubscription does not exist" });
    
      const club = await Club.findOne({ _id: req.auth._id });
    
      if (club._id.toString() !== clientSubscription.clubId.toString())
        return res.status(400).json({
          error: "you are not allowed to renewed a client subscription from another club",
        });
    
     if (clientSubscription.isRenewable=== true) {
        return res.status(403).json({
            error: "Customer subscription is already renewed!",
          });
     }
  
     clientSubscription.isRenewable= true

      await clientSubscription.save();
  
      const clientSubscription1 = await ClientSubscription.findOne({ _id: clientSubscription._id }).select("-__v");
  
      res.status(201).json({ message: "the client subscription was renewed", clientSubscription: clientSubscription1 });
      
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };

exports.turnOff = async (req: k, res: Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(401).json({ message: "the id is invalid" });
    
      const clientSubscription = await ClientSubscription.findOne({ _id: req.params.id });
      if (!clientSubscription)
        return res.status(404).json({ message: "the clientSubscription does not exist" });
    
      const club = await Club.findOne({ _id: req.auth._id });
    
      if (club._id.toString() !== clientSubscription.clubId.toString())
        return res.status(400).json({
          error: "you are not allowed to turn off a client subscription from another club",
        });
    
     if (clientSubscription.isRenewable=== false) {
        return res.status(403).json({
            error: "Customer subscription is already turn off!",
          });
     }
  
     clientSubscription.isRenewable= false

      await clientSubscription.save();
  
      const clientSubscription1 = await ClientSubscription.findOne({ _id: clientSubscription._id }).select("-__v");
  
      res.status(201).json({ message: "the client subscription was turn off", clientSubscription: clientSubscription1 });
      
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "server error" });
    }
  };

exports.scanCard = async (req: k, res: Response) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
          return res.status(401).json({ message: "the id is invalid" });
      
        const clientSubscription = await ClientSubscription.findOne({ _id: req.params.id});
        if (!clientSubscription)
          return res.status(404).json({ message: "the client subscription does not exist" });
      
        const client = await Client.findOne({ _id: req.auth._id });
      
        if (client._id.toString() !== clientSubscription.clientId.toString())
          return res.status(400).json({
            error: "you are not allowed to scanned a card from another client.",
          });

        if (clientSubscription.numberOfMatches===0) {
            return res.status(403).json({ error: "You cannot scan this card because you have exhausted all possible scans!" });
        }

        if (clientSubscription.isActive !== true) {
            return res.status(406).json({ error: "You cannot scan this card because the card is not activated!" });
        }

        clientSubscription.numberOfMatches = clientSubscription.numberOfMatches - 1

        await clientSubscription.save();

        const clientSubscription1 = await ClientSubscription.findOne({ _id: clientSubscription._id }).select("-__v");
  
        res.status(201).json({ message: "the card was scanned successfully", clientSubscription: clientSubscription1 });
      
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "server error" });
      }
  };

  
const automaticDisabled = async () => {
    try {
      const nowDate = new Date();
  
      const clientSubscription = await ClientSubscription.find({ isActive: true });
  
      const expiredClientSubscriptions = clientSubscription.filter((m: any) => {
        const endDate = new Date(m.endDate);
  
        return endDate <= nowDate;
      });
  
      await Promise.all(
        expiredClientSubscriptions.map(async (clientSubscription: any) => {
          
          await ClientSubscription.updateOne(
            { _id: clientSubscription._id },
            { $set: { isActive: false } }
          );
  
        })
      );
  
      console.log(
        "Client Subscription was disabled successfully."
      );
    } catch (error) {
      console.error(
        "Error disabled client subscription : ",
        error
      );
    }
  };
  
  cron.schedule("0 * * * *", automaticDisabled);
  
  