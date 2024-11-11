class CustomError extends Error {
    statusCode: number;
    logs?: { directoryName: string; completeError: string };

    constructor(
        statusCode: number,
        message: string,
        logs?: { directoryName: string; completeError: string | any }
    ) {
        super(message);
        this.statusCode = statusCode;
        this.logs = logs;
    }
}

export default CustomError;
