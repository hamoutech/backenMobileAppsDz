import { Request } from "express";
import CustomError from "../../exceptions/customException.exception";
import { ClientSession, ObjectId } from "mongoose";
import withTransaction from "../../configuration/database-transactions";

const Agent = require("../../models/agent.model");
const Ticket = require("../../models/ticket.model");
const Match = require("../../models/match.model");


interface ExtendedRequest extends Request {
    auth: { _id: ObjectId },
}

interface ITicket {
    client: null,
    match: {
        matchId: string,
        matchTitle: string,
        matchDescription: string,
        matchStadiumName: string,
        matchCompetition: string,
        matchDate: string,
        matchHour: string,
    },
    seatNumber: string,
    status: string,
    type: string,
    price: string,
    securityToken: null;
    createdAt: string;
    scannedAt: string | null;
    scannedBy: {
        agentId: string,
        agentEmail: string,
        agentFullName: string
    } | null,
}

let globalRequestObject: ExtendedRequest;
let globalAgentObject: typeof Agent | undefined;
let globalMatchObject: typeof Match;
let globalTicketObject: Partial<ITicket> = {};

async function prepareScannedBy() {
    globalTicketObject.scannedBy = {
        agentId: globalAgentObject._id,
        agentEmail: globalAgentObject.email,
        agentFullName: globalAgentObject.fullName,
    }
}

async function preparePrice() {
    globalTicketObject.price = globalRequestObject.body.type == "VIP" ?
        globalMatchObject.seats.vip.price :
        globalMatchObject.seats.standard.price
}

function prepareSeatNumber() {
    globalTicketObject.seatNumber = globalRequestObject.body.type == "VIP" ?
        globalMatchObject.seats.vip.reserved + 1 :
        globalMatchObject.seats.standard.reserved + 1
}

async function prepareMatch(): Promise<typeof Match> {
    let match;

    try {
        match = await Match.findOne({ _id: globalRequestObject.body.matchId });
    } catch (error) {
        throw new CustomError(408, 'Unable to process your request at the moment, please try later', {
            completeError: error,
            directoryName: "matchs",
        });
    }

    globalTicketObject.match = {
        matchId: match._id,
        matchTitle: match.titled,
        matchDescription: match.description,
        matchStadiumName: match.stadiumName,
        matchCompetition: match.competition,
        matchDate: match.date,
        matchHour: match.hour,
    }

    return match;
}


async function prepareTicket() {

    globalTicketObject.client = null;

    globalMatchObject = await prepareMatch();

    prepareSeatNumber();

    globalTicketObject.status = "Used";

    globalTicketObject.type = globalRequestObject.body.type;

    preparePrice();

    globalTicketObject.securityToken = null;

    globalTicketObject.createdAt = new Date().toString();

    globalTicketObject.scannedAt = new Date().toString();

    prepareScannedBy();
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

    return agent;
}

async function updateSeatsInMatchDocument(session: ClientSession) {
    if (globalRequestObject.body.type == "VIP") {

        try {
            await Match.updateOne(
                { _id: globalMatchObject._id },
                { $set: { 'seats.vip.reserved': globalMatchObject.seats.vip.reserved + 1 } },
                { session }
            );
        } catch (error) {
            throw new CustomError(408, 'Unable to process your request at the moment, please try later', {
                completeError: error,
                directoryName: "matchs",
            });
        }

    } else if (globalRequestObject.body.type == "Standard") {

        try {
            await Match.updateOne(
                { _id: globalMatchObject._id },
                { $set: { 'seats.standard.reserved': globalMatchObject.seats.standard.reserved + 1 } },
                { session }
            );
        } catch (error) {
            throw new CustomError(408, 'Unable to process your request at the moment, please try later', {
                completeError: error,
                directoryName: "matchs",
            });
        }
    }
}

async function createTicketByAgent(req: ExtendedRequest) {

    globalRequestObject = req;
    globalTicketObject = {};

    globalAgentObject = await getAuthenticatedAgent();

    await prepareTicket();

    let ticket;

    await withTransaction(async (session) => {

        ticket = new Ticket(globalTicketObject);

        try {
            await ticket.save({ session });
        } catch (error) {
            throw new CustomError(408, 'Unable to process your request at the moment, please try later', {
                completeError: error,
                directoryName: "tickets",
            });
        }

        await updateSeatsInMatchDocument(session);        
    });

    return ticket;

}

export default createTicketByAgent;