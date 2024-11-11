import CustomError from "../../exceptions/customException.exception";
import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongoose";
import mongoose from "mongoose";

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

async function getTicketByIdDto(req: ExtendedRequest, res: Response, next: NextFunction) {

    globalRequestObject = req;

    try {

        await ticketIdValidation();

        next();

    } catch (validationError) {

        next(validationError);
    }
}

export default getTicketByIdDto;