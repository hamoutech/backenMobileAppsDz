import CustomError from "../../exceptions/customException.exception";
import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongoose";
import mongoose from "mongoose";
const Client = require("../../models/client.model");


interface ExtendedRequest extends Request {
    auth: { _id: ObjectId },
}

let globalRequestObject: ExtendedRequest;

async function ticketIdValidation() {

    if (!('ticketId' in globalRequestObject.params)) {
        throw new CustomError(400, "The ticketId is required");
    }

    if (!globalRequestObject.params.ticketId) {
        throw new CustomError(400, "The ticketId is empty");
    }

    if (!mongoose.Types.ObjectId.isValid(globalRequestObject.params.ticketId)) {
        throw new CustomError(400, "Invalid ticketId");
    }

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

async function abandonTicketByIdDto(req: ExtendedRequest, res: Response, next: NextFunction) {

    globalRequestObject = req;

    try {

        await getAuthenticatedClient();

        await ticketIdValidation();

        next();

    } catch (validationError) {

        next(validationError);
    }
}

export default abandonTicketByIdDto;