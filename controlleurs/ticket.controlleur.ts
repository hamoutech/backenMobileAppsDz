import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongoose";
import createTicketByClient from "../services/ticket/createTicketByClient.service";
import createTicketByAgent from "../services/ticket/createTicketByAgent.service";
import scanClientTicket from "../services/ticket/scanClientTicket.service";
import getClientTicketById from "../services/ticket/getClientTicketById.service";
import getPaginatedTicketsByMatchId from "../services/ticket/getPaginatedTicketsByMatchId.service";
import abandonClientTicketById from "../services/ticket/abandonClientTicketById.service";

interface ExtendedRequest extends Request {
    auth: { _id: ObjectId },
}

exports.createByClient = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {

        await createTicketByClient(req);

        return res.status(200).json({
            message: "The ticket is created and sent to client email",
        });
    } catch (error) {
        next(error);
    }
};


exports.createByAgent = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {

        const ticket = await createTicketByAgent(req);

        return res.status(200).json({
            message: "The ticket is created",
            ticket
        });
    } catch (error) {
        next(error);
    }
};


exports.scanTicket = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {

        const ticket = await scanClientTicket(req);

        return res.status(200).json({
            message: "The ticket is valid",
            ticket
        });
    } catch (error) {
        next(error);
    }
};


exports.getTicketById = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {

        const ticket = await getClientTicketById(req);

        return res.status(200).json({
            ticket
        });
    } catch (error) {
        next(error);
    }
};


exports.getTicketsByMatchId = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {

        const ticketsByMatch = await getPaginatedTicketsByMatchId(req);

        return res.status(200).json(ticketsByMatch);
    } catch (error) {
        next(error);
    }
};


exports.abandonTicketById = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {

        await abandonClientTicketById(req);

        return res.status(200).json({
            message: "The ticket is abandoned successfully",
        });
    } catch (error) {
        next(error);
    }
};


