import * as FirebaseService from "../middleware/FirebaseService" ;
import Expo from "expo-server-sdk";
import { Request,Response } from "express";

const expo = new Expo();

export const registertokenbyid =async (req:Request,res:Response) => {
    if(!req.body.token) return res.status(400).json({ error: "the token is empty" });
    if(!req.body.id) return res.status(400).json({ error: "the user id  is empty" });
    try {
        const userId = String(req.body.userid);
        const token = String(req.body.token);
        await FirebaseService.saveTokenbyid(userId,token);
        res.status(201).json({message:"token is saved"});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  
}
export const registertoken =async (req:Request,res:Response) => {
    if(!req.body.token) return res.status(400).json({ error: "the token is empty" });
    try {
        const token = String(req.body.token);
        const exist = await FirebaseService.saveToken(token);
        if(exist){ 
            res.status(401).json({message:"token already exist"});
           
        } else{
            res.status(201).json({message:"token is saved"});
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  
}
export const pushnotiftoken =async (req:Request,res:Response) => {
    if(!req.body.token) return res.status(400).json({ error: "the token is empty" });
    if(!req.body.title) return res.status(400).json({ error: "the title is empty" });
    if(!req.body.notifdata) return res.status(400).json({ error: "the notification data is empty" });
    if(!req.body.notifbody) return res.status(400).json({ error: "the notification body is empty" });
    try {
        const token = req.body.token ;
        const notifbody = req.body.notifbody ;
        const title = req.body.title ;
        const notifdata = req.body.notifdata ; 
        expo.sendPushNotificationsAsync([{
         to:token ,
         title: title,
         body: notifbody,
         data:notifdata
        },
    ]);
    res.status(200).json({ message: "The notification is sent" });
    } catch (error:any) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
   

}

export const pushnotif =async (req:Request,res:Response) => {
    if(!req.body.title) return res.status(400).json({ error: "the title is empty" });
    if(!req.body.notifbody) return res.status(400).json({ error: "the notification body is empty" });
    if(!req.body.notifdata) return res.status(400).json({ error: "the notification data is empty" });
    try {
    const tokens = await FirebaseService.getallToken() ;
    if(!tokens) return res.status(401).json({ error: "no User token was found" });
    for(const token of tokens){
        try {
            expo.sendPushNotificationsAsync([{
                to:token.token ,
                title: req.body.title,
                body: req.body.notifbody,
                data: req.body.notifdata
               },
           ]);
        } catch (error) {
            return res.status(401).json({ message: "check you expo notification data " });
        }
       
    }
    res.status(200).json({ message: "Notification has been sent" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const pushnotifID =async (req:Request,res:Response) => {
    if(!req.body.userid) return res.status(400).json({ error: "the userid is empty" });
    if(!req.body.title) return res.status(400).json({ error: "the title is empty" });
    if(!req.body.notifbody) return res.status(400).json({ error: "the notification body is empty" });
    if(!req.body.notifdata) return res.status(400).json({ error: "the notification data is empty" });
    try {
    const {token}= await FirebaseService.getToken(req.body.userid) ;
    if(!token) return res.status(401).json({ error: "User token not found" });
    const notifbody = req.body.notifbody ;
    const title = req.body.title ;
    const notifdata =req.body.notifdata ;
    expo.sendPushNotificationsAsync([{
     to:token ,
     title: title,
     body: notifbody,
     data:notifdata 
    },
]);
res.status(200).json({ message: "Notification has been sent" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    
}