import { Request } from "express";
import CustomError from "../../exceptions/customException.exception";
import { ClientSession, ObjectId } from "mongoose";
import { generateToken } from "../../utils/other.utils";
import withTransaction from "../../configuration/database-transactions";
import { sendTicketToClient } from "../../configuration/nodemailer";
const QRCode = require('qrcode');
const bcrypt = require("bcrypt");

const Client = require("../../models/client.model");
const Ticket = require("../../models/ticket.model");
const Match = require("../../models/match.model");


interface ExtendedRequest extends Request {
    auth: { _id: ObjectId },
}

interface ITicket {
    client: {
        clientId: string,
        clientEmail: string,
        clientPseudo: string
    },
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
    securityToken: string;
    createdAt: string;
    scannedAt: string | null;
    scannedBy: {
        agentId: string,
        agentEmail: string,
        agentFullName: string
    } | null,
}

let globalRequestObject: ExtendedRequest;
let globalClientObject: typeof Client | undefined;
let globalMatchObject: typeof Match;
let globalTicketObject: Partial<ITicket> = {};
let securityToken: string;

async function preparePrice() {
    globalTicketObject.price = globalRequestObject.body.type == "VIP" ?
        globalMatchObject.seats.vip.price :
        globalMatchObject.seats.standard.price
}

async function prepareSecurityToken() {
    securityToken = generateToken(32);
    const hashedSecurityToken = await bcrypt.hash(securityToken, 10);
    globalTicketObject.securityToken = hashedSecurityToken;
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

function prepareClient() {
    globalTicketObject.client = {
        clientId: globalClientObject._id,
        clientEmail: globalClientObject.email,
        clientPseudo: globalClientObject.pseudo,
    }
}

async function prepareTicket() {

    prepareClient();

    globalMatchObject = await prepareMatch();

    prepareSeatNumber();

    globalTicketObject.status = "Valid";

    globalTicketObject.type = globalRequestObject.body.type;

    await prepareSecurityToken();

    preparePrice();

    globalTicketObject.createdAt = new Date().toString();

    globalTicketObject.scannedAt = null;

    globalTicketObject.scannedBy = null;
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

async function sendTicket(qrcode: string) {

    const message = {
        match: {
            matchTitle: globalTicketObject.match?.matchTitle,
            matchDescription: globalTicketObject.match?.matchDescription,
            matchStadiumName: globalTicketObject.match?.matchStadiumName,
            matchCompetition: globalTicketObject.match?.matchCompetition,
            matchDate: globalTicketObject.match?.matchDate,
            matchHour: globalTicketObject.match?.matchHour,
        },
        price: globalTicketObject.price,
        seatNumber: globalTicketObject.seatNumber,
        qrcode
    }

    try {

        await sendTicketToClient(globalClientObject.email, message);

    } catch (error) {
        throw new CustomError(500, 'The email was not sent', {
            completeError: error,
            directoryName: "clients",
        });
    }
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

async function createTicketByClient(req: ExtendedRequest) {

    globalRequestObject = req;
    globalTicketObject = {};

    globalClientObject = await getAuthenticatedClient();

    await prepareTicket();

    await withTransaction(async (session) => {

        const ticket = new Ticket(globalTicketObject);

        try {
            await ticket.save({ session });
        } catch (error) {
            throw new CustomError(408, 'Unable to process your request at the moment, please try later', {
                completeError: error,
                directoryName: "tickets",
            });
        }

        await updateSeatsInMatchDocument(session);

        const qrCodeContent = JSON.stringify({ ticketId: ticket._id, securityToken });
        const qrCodeDataUrl = await QRCode.toDataURL(qrCodeContent);

        await sendTicket(qrCodeDataUrl);
    });

}

export default createTicketByClient;