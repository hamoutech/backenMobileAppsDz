import CustomError from "../../exceptions/customException.exception";
import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongoose";
import mongoose from "mongoose";

interface ExtendedRequest extends Request {
    auth: { _id: ObjectId },
}

let globalRequestObject: ExtendedRequest;

async function matchIdValidation() {

    if (!('matchId' in globalRequestObject.params)) {
        throw new CustomError(400, "The matchId is required");
    }

    if (!globalRequestObject.params.matchId) {
        throw new CustomError(400, "The matchId is empty");
    }

    if (!mongoose.Types.ObjectId.isValid(globalRequestObject.params.matchId)) {
        throw new CustomError(400, "Invalid matchId");
    }

}

async function getTicketsByMatchIdDto(req: ExtendedRequest, res: Response, next: NextFunction) {

    globalRequestObject = req;

    try {

        await matchIdValidation();

        next();

    } catch (validationError) {

        next(validationError);
    }
}

export default getTicketsByMatchIdDto;