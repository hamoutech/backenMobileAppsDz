import { Request } from "express";
import CustomError from "../../exceptions/customException.exception";
import { ObjectId } from "mongoose";
const Ticket = require("../../models/ticket.model");


interface ExtendedRequest extends Request {
    auth: { _id: ObjectId },
}

async function getClientTicketById(req: ExtendedRequest) {
    
    let ticket;

    try {
        ticket = await Ticket.findOne({ _id: req.params.ticketId });
    } catch (error) {
        throw new CustomError(408, 'Unable to process your request at the moment, please try later', {
            completeError: error,
            directoryName: "tickets",
        });
    }

    if (!ticket) {
        throw new CustomError(404, "Ticket not found");
    }

    return ticket;

}

export default getClientTicketById;