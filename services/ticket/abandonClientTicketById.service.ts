import { Request } from "express";
import CustomError from "../../exceptions/customException.exception";
import { ClientSession, ObjectId } from "mongoose";
import withTransaction from "../../configuration/database-transactions";
const Ticket = require("../../models/ticket.model");
const Client = require("../../models/client.model");
const Match = require("../../models/match.model");

interface ExtendedRequest extends Request {
    auth: { _id: ObjectId },
}

let globalRequestObject: ExtendedRequest;
let globalClientObject: typeof Client;
let globalTicketObject: typeof Ticket;
let globalMatchObject: typeof Match;

async function updateSeatsInMatchDocument(session: ClientSession) {
    if (globalTicketObject.type == "VIP") {

        try {
            await Match.updateOne(
                { _id: globalMatchObject._id },
                { $set: { 'seats.vip.reserved': globalMatchObject.seats.vip.reserved - 1 } },
                { session }
            );
        } catch (error) {
            throw new CustomError(408, 'Unable to process your request at the moment, please try later', {
                completeError: error,
                directoryName: "matchs",
            });
        }

    } else if (globalTicketObject.type == "Standard") {

        try {
            await Match.updateOne(
                { _id: globalMatchObject._id },
                { $set: { 'seats.standard.reserved': globalMatchObject.seats.standard.reserved - 1 } },
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

async function markTicketAsAbandoned(session: ClientSession) {
    try {
        await Ticket.updateOne(
            { _id: globalTicketObject._id },
            { $set: { 'status': "Abandoned", seatNumber: null } },
            { session }
        );
    } catch (error) {
        throw new CustomError(408, 'Unable to process your request at the moment, please try later', {
            completeError: error,
            directoryName: "tickets",
        });
    }
}

async function getMatch() {
    let match;

    try {
        match = await Match.findOne({ _id: globalTicketObject.match.matchId });
    } catch (error) {
        throw new CustomError(408, 'Unable to process your request at the moment, please try later', {
            completeError: error,
            directoryName: "matchs",
        });
    }

    if (!match) {
        throw new CustomError(404, "Match not found");
    }

    return match;
}

async function getTicket() {

    let ticket;

    try {
        ticket = await Ticket.findOne({ _id: globalRequestObject.params.ticketId });
    } catch (error) {
        throw new CustomError(408, 'Unable to process your request at the moment, please try later', {
            completeError: error,
            directoryName: "tickets",
        });
    }

    if (!ticket) {
        throw new CustomError(404, "Ticket not found");
    }

    if (ticket.client) {
        if (ticket.client.clientId.toString() != globalClientObject._id.toString()) {
            throw new CustomError(403, "Clients are allowed to delete only their own tickets.");
        }
    }
    else {
        throw new CustomError(403, "Clients are allowed to delete only their own tickets.");
    }

    if (ticket.status == "Used") {
        throw new CustomError(403, "Ticket already used");
    }

    if (ticket.status == "Expired") {
        throw new CustomError(403, "Ticket is expired");
    }

    if (ticket.status == "Abandoned") {
        throw new CustomError(400, "Ticket already abandoned");
    }

    return ticket;
}

async function getAuthenticatedClient() {

    let client;

    try {
        client = await Client.findOne({ _id: globalRequestObject.auth._id });
    } catch (error) {
        throw new CustomError(408, 'Unable to process your request at the moment, please try later', {
            completeError: error,
            directoryName: "clients",
        });
    }

    return client;
}

async function abandonClientTicketById(req: ExtendedRequest) {

    globalRequestObject = req;
    globalClientObject = await getAuthenticatedClient();
    globalTicketObject = await getTicket();
    globalMatchObject = await getMatch();

    await withTransaction(async (session) => {

        await markTicketAsAbandoned(session);

        await updateSeatsInMatchDocument(session);
    });

}

export default abandonClientTicketById;