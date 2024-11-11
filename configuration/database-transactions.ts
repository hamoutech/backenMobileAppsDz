import mongoose, { ClientSession } from "mongoose";

const withTransaction = async (fn: (session: ClientSession) => Promise<void>): Promise<void> => {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();
    try {
        await fn(session);
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}

export default withTransaction;