const jwt = require("jsonwebtoken");
const Agent = require("../models/agent.model");
import CustomError from "../exceptions/customException.exception";
const SECRET_TOKEN = process.env.SECRET_TOKEN;
import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongoose";

interface e extends Request {
    cookies: { refresh_token: string };
    auth: object;
    _id: ObjectId;
}

async function checkAgent(agentId: ObjectId) {
    let agent;

    try {
        agent = await Agent.findOne({ _id: agentId });
    } catch (error) {
        throw new CustomError(408, 'Unable to process your request at the moment, please try later', {
            completeError: error,
            directoryName: "agents",
        });
    }

    if (!agent) {
        throw new CustomError(403, "Only agents can perform this action");
    }

    if (agent.status == "BANNED") {
        throw new CustomError(403, "The agent is banned");
    }
}

module.exports = async (req: e, res: Response, next: NextFunction) => {
    const token = req.header("Authorization") || req.header("authorization");
    const isRefresh = req.header("RefreshT") || req.header("refresht");
    if (!token || !token.startsWith("Bearer ")) {
        return next(new CustomError(403, "Unauthorized"));
    }

    const bearerToken = token.substring(7);
    try {
        let decodeToken = await jwt.verify(bearerToken, SECRET_TOKEN);

        try {
            await checkAgent(decodeToken.id);
        } catch (error) {
            return next(error);
        }

        req.auth = { _id: decodeToken.id };
        next();

    } catch (error) {
        if (isRefresh) {
            return next(new CustomError(403, JSON.stringify({ error: "not allow.", rtChecked: true })));
        } else {
            return next(new CustomError(403, "not allow."));
        }
    }
};
