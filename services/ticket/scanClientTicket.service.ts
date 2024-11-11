import { Request } from "express";
import CustomError from "../../exceptions/customException.exception";
import { ObjectId } from "mongoose";
const bcrypt = require("bcrypt");
const Agent = require("../../models/agent.model");
const Ticket = require("../../models/ticket.model");


interface ExtendedRequest extends Request {
    auth: { _id: ObjectId },
}

let globalRequestObject: ExtendedRequest;
let globalAgentObject: typeof Agent | undefined;
let globalTicketObject: typeof Ticket;

async function checkTicketValidity() {

    if (globalTicketObject.status == "Used") {
        throw new CustomError(403, "The ticket is already used");
    }
    else if (globalTicketObject.status == "Expired") {
        throw new CustomError(403, "The ticket is expired");
    }
    else if (globalTicketObject.status == "Abandoned") {
        throw new CustomError(403, "The ticket is abandoned");
    }

    const validTicket = await bcrypt.compare(globalRequestObject.body.securityToken, globalTicketObject.securityToken);
    if (!validTicket) {
        throw new CustomError(403, "Invalid securityToken");
    }
}

async function getTicket() {

    let ticket;

    try {
        ticket = await Ticket.findOne({ _id: globalRequestObject.body.ticketId });
    } catch (error) {
        throw new CustomError(408, 'Unable to process your request at the moment, please try later', {
            completeError: error,
            directoryName: "tickets",
        });
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

    return agent
}

async function scanClientTicket(req: ExtendedRequest) {

    globalRequestObject = req;
    globalAgentObject = await getAuthenticatedAgent();
    globalTicketObject = await getTicket();
    await checkTicketValidity();

    try {
        globalTicketObject = await Ticket.findOneAndUpdate(
            { _id: globalTicketObject._id },
            {
                $set:
                {
                    'status': "Used",
                    'scannedAt': new Date().toString(),
                    'scannedBy': {
                        agentId: globalAgentObject._id,
                        agentEmail: globalAgentObject.email,
                        agentFullName: globalAgentObject.fullName,
                    }
                }
            },
            {
                new: true, // Retourner le document après la mise à jour
            }
        );
    } catch (error) {
        throw new CustomError(408, 'Unable to process your request at the moment, please try later', {
            completeError: error,
            directoryName: "tickets",
        });
    }

    return globalTicketObject;
}

export default scanClientTicket;