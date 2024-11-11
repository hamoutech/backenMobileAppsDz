const Client = require("../../models/client.model");
const Match = require("../../models/match.model");
import CustomError from "../../exceptions/customException.exception";
import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongoose";
import mongoose from "mongoose";

interface ExtendedRequest extends Request {
    auth: { _id: ObjectId },
}

let globalRequestObject: ExtendedRequest;
let globalMatchObject: typeof Match;

function typeValidation() {

    if (!('type' in globalRequestObject.body)) {
        throw new CustomError(400, "The type is required");
    }

    if (!globalRequestObject.body.type) {
        throw new CustomError(400, "The type is empty");
    }

    const allowedTypes: String[] = ['VIP', 'Standard'];

    if(!allowedTypes.includes(globalRequestObject.body.type)) {
        throw new CustomError(400, "The type is wrong, allowed types are ['VIP', 'Standard']");
    }

}

async function matchValidation() {

    if (!('matchId' in globalRequestObject.body)) {
        throw new CustomError(400, "The matchId is required");
    }

    if (!globalRequestObject.body.matchId) {
        throw new CustomError(400, "The matchId is empty");
    }

    if (!mongoose.Types.ObjectId.isValid(globalRequestObject.body.matchId)) {
        throw new CustomError(400, "Invalid matchId");
    }

    let match;

    try {
        match = await Match.findOne({ _id: globalRequestObject.body.matchId });
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

    if (!client) {
        throw new CustomError(404, "Client not found");
    }

    if(client.status == "BANNED") {
        throw new CustomError(403, "The client is banned");
    }
}

function checkPlacesDisponibility() {
    if(globalRequestObject.body.type == "VIP") {
        if(globalMatchObject.seats.vip.total == globalMatchObject.seats.vip.reserved) {
            throw new CustomError(404, "No VIP seats are available.");
        }
    }

    if(globalRequestObject.body.type == "Standard") {
        if(globalMatchObject.seats.standard.total == globalMatchObject.seats.standard.reserved) {
            throw new CustomError(404, "No Standard seats are available.");
        }
    }
}

async function createTicketByClientDto(req: ExtendedRequest, res: Response, next: NextFunction) {

    globalRequestObject = req;

    try {

        await getAuthenticatedClient();

        globalMatchObject = await matchValidation();

        typeValidation();

        checkPlacesDisponibility();

        next();

    } catch (validationError) {

        next(validationError);
    }
}

export default createTicketByClientDto;