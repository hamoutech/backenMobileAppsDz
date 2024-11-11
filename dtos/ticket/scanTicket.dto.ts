const Agent = require("../../models/agent.model");
const Ticket = require("../../models/ticket.model");
import CustomError from "../../exceptions/customException.exception";
import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongoose";
import mongoose from "mongoose";

interface ExtendedRequest extends Request {
    auth: { _id: ObjectId },
}

let globalRequestObject: ExtendedRequest;

function securityTokenValidation() {

    if (!('securityToken' in globalRequestObject.body)) {
        throw new CustomError(400, "The securityToken is required");
    }

    if (!globalRequestObject.body.securityToken) {
        throw new CustomError(400, "The securityToken is empty");
    }

    if(globalRequestObject.body.securityToken.length != 64) {
        throw new CustomError(400, "Invalid securityToken");
    }
}

async function ticketIdValidation() {

    if (!('ticketId' in globalRequestObject.body)) {
        throw new CustomError(400, "The ticketId is required");
    }

    if (!globalRequestObject.body.ticketId) {
        throw new CustomError(400, "The ticketId is empty");
    }

    if (!mongoose.Types.ObjectId.isValid(globalRequestObject.body.ticketId)) {
        throw new CustomError(400, "Invalid ticketId");
    }

    let ticket;

    try {
        ticket = await Ticket.findOne({ _id: globalRequestObject.body.ticketId });
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

async function getAuthenticatedAgent() {

    let agent;

    try {
        agent = await Agent.findOne({ _id: globalRequestObject.auth._id });
    } catch (error) {
        throw new CustomError(408, 'Unable to process your request at the moment, please try later', {
            completeError: error,
            directoryName: "agents",
        });
    }

    if (!agent) {
        throw new CustomError(404, "agent not found");
    }

    if(agent.status == "BANNED") {
        throw new CustomError(403, "The agent is banned");
    }
}


async function scanTicketDto(req: ExtendedRequest, res: Response, next: NextFunction) {

    globalRequestObject = req;

    try {

        await getAuthenticatedAgent();

        await ticketIdValidation();

        securityTokenValidation();

        next();

    } catch (validationError) {

        next(validationError);
    }
}

export default scanTicketDto;