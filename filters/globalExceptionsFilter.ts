import logErrorToFile from '../logger/errors.logger';
import CustomError from '../exceptions/customException.exception';
import { Request, Response, NextFunction } from "express";

export default async (error: CustomError, request: Request, response: Response, next: NextFunction) => {

    if (error.logs) {
        await logErrorToFile(error.logs.directoryName, error.logs.completeError);
    }

    error.statusCode = error.statusCode || 500;
    return response.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message,
    });
}