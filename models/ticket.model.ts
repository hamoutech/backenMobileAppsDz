import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({

    client: {
        type: {
            clientId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Client",
                required: true
            },

            clientEmail: {
                type: String,
                required: true,
                match: [
                    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    "Please fill a valid email address",
                ],
            },

            clientPseudo: { type: String, required: true },
        },
        required: false,
        _id: false,
    },

    match: {
        type: {
            matchId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Match",
                required: true
            },

            matchTitle: { type: String, required: true },

            matchDescription: { type: String, required: true },

            matchStadiumName: { type: String, required: true },

            matchCompetition: { type: String, required: true },

            matchDate: { type: String, required: true },

            matchHour: { type: String, required: true },
        },
        _id: false,
    },

    seatNumber: { type: String, required: true },

    status: {
        type: String,
        required: true,
        enum: ['Valid', 'Abandoned', 'Expired', 'Used', 'Fraudulent'],
    },

    type: {
        type: String,
        required: true,
        enum: ['VIP', 'Standard'],
    },

    price: { type: String, required: true },

    securityToken: { type: String, required: false },

    createdAt: { type: String },

    scannedAt: { type: String },

    scannedBy: {
        type: {
            agentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Agent",
                required: true
            },

            agentEmail: {
                type: String,
                required: true,
                match: [
                    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    "Please fill a valid email address",
                ],
            },

            agentFullName: { type: String, required: true },
        },
        required: false,
        _id: false,
    },

});

module.exports = mongoose.model('Ticket', ticketSchema);
