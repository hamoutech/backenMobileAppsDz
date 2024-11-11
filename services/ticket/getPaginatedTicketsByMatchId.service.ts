import { Request } from "express";
import CustomError from "../../exceptions/customException.exception";
import { ObjectId } from "mongoose";
const Ticket = require("../../models/ticket.model");
const Match = require("../../models/match.model");


interface ExtendedRequest extends Request {
    auth: { _id: ObjectId },
}

let globalRequestObject: ExtendedRequest;

async function getMatch() {

    let match;

    try {
        match = await Match.findOne({ _id: globalRequestObject.params.matchId });
    } catch (error) {
        throw new CustomError(408, 'Unable to process your request at the moment, please try later', {
            completeError: error,
            directoryName: "matchs",
        });
    }

    if (!match) {
        throw new CustomError(404, "Match not found");
    }

}

async function getPaginatedTicketsByMatchId(req: ExtendedRequest) {

    globalRequestObject = req;

    await getMatch();

    const page = parseInt(req.query.page?.toString() ?? '1', 10);
    const limit = parseInt(req.query.limit?.toString() ?? '20', 10);

    const skip = (page - 1) * limit;

    let ticketsByMatch;

    try {
        ticketsByMatch = await Ticket.find({ 'match.matchId': req.params.matchId }).skip(skip).limit(limit);
    } catch (error) {
        throw new CustomError(408, 'Unable to process your request at the moment, please try later', {
            completeError: error,
            directoryName: "tickets",
        });
    }


    let totalItems;

    try {
        totalItems = await Ticket.countDocuments({ 'match.matchId': req.params.matchId });
    } catch (error) {
        throw new CustomError(408, 'Unable to process your request at the moment, please try later', {
            completeError: error,
            directoryName: "tickets",
        });
    }

    const totalPages = Math.ceil(totalItems / limit);

    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}/get-all`;

    const links = {
        next: nextPage ? `${baseUrl}?page=${nextPage}&limit=${limit}` : null,
        prev: prevPage ? `${baseUrl}?page=${prevPage}&limit=${limit}` : null
    };


    return {
        data: ticketsByMatch,
        totalItems,
        totalPages,
        currentPage: page,
        perPage: limit,
        next: links.next,
        prev: links.prev
    };

}

export default getPaginatedTicketsByMatchId;