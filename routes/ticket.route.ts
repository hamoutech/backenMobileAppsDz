import express from "express";
const router = express.Router();
const clientAuth = require("../middleware/clientAuth");
const agentAuth = require("../middleware/agentAuth");
const clubOrAgentAuth = require("../middleware/clubOrAgentAuth");
const createTicketByClientDto = require("../dtos/ticket/createTicketByClient.dto").default;
const createTicketByAgentDto = require("../dtos/ticket/createTicketByAgent.dto").default;
const getTicketByIdDto = require("../dtos/ticket/getTicketById.dto").default;
const getTicketsByMatchIdDto = require("../dtos/ticket/getTicketsByMatchId.dto").default;
const abandonTicketByIdDto = require("../dtos/ticket/abandonTicketById.dto").default;
const scanTicketDto = require("../dtos/ticket/scanTicket.dto").default;
const ticketCon = require("../controlleurs/ticket.controlleur");

/**
 *  @swagger
 *  /api/ticket/client/create:
 *    post:
 *      tags:
 *      - Ticket
 *      description: Création d'un nouveau ticket de la part d'un client
 *      parameters:
 *        - in : body
 *          name: Ticket
 *          schema:
 *            type: object
 *            required:
 *              - matchId
 *              - type
 *            properties:
 *              matchId:
 *                type: string
 *              type:
 *                type: string
 *                enum:
 *                  - VIP
 *                  - Standard
 *      responses:
 *        '200':
 *          description: The ticket is created and sent to client email
 *        '400':
 *         description: |
 *           Bad Request. 
 *           - The field is required.
 *           - The field is empty.
 *           - The type is wrong, allowed types are ['VIP', 'Standard'].
 *           - Invalid matchId.
 *        '403':
 *         description: |
 *           Unauthorized. 
 *           - The client is banned.
 *        '404':
 *         description: |
 *           Not found. 
 *           - Match not found.
 *           - Client not found.
 *           - No VIP seats are available.
 *           - No Standard seats are available.
 *        '408':
 *          description: Unable to process your request at the moment, please try later
 *        '500':
 *          description: |
 *            Internal Server Error.
 *            - Internal Server Error.
 *            - The email was not sent
 */
router.post("/client/create", clientAuth, createTicketByClientDto, ticketCon.createByClient);

/**
 *  @swagger
 *  /api/ticket/agent/create:
 *    post:
 *      tags:
 *      - Ticket
 *      description: Création d'un nouveau ticket de la part d'un agent
 *      parameters:
 *        - in : body
 *          name: Ticket
 *          schema:
 *            type: object
 *            required:
 *              - matchId
 *              - type
 *            properties:
 *              matchId:
 *                type: string
 *              type:
 *                type: string
 *                enum:
 *                  - VIP
 *                  - Standard
 *      responses:
 *        '200':
 *          description: The ticket is created. with object that contains ticket data
 *        '400':
 *         description: |
 *           Bad Request. 
 *           - The field is required.
 *           - The field is empty.
 *           - The type is wrong, allowed types are ['VIP', 'Standard'].
 *           - Invalid matchId.
 *        '403':
 *         description: |
 *           Unauthorized. 
 *           - Only agents can perform this action.
 *           - The Agent is banned.
 *        '404':
 *         description: |
 *           Not found. 
 *           - Match not found.
 *           - Agent not found.
 *           - No VIP seats are available.
 *           - No Standard seats are available.
 *        '408':
 *          description: Unable to process your request at the moment, please try later
 *        '500':
 *          description: |
 *            Internal Server Error.
 *            - Internal Server Error.
 */
router.post("/agent/create", agentAuth, createTicketByAgentDto, ticketCon.createByAgent);

/**
 *  @swagger
 *  /api/ticket/scan-ticket:
 *    post:
 *      tags:
 *      - Ticket
 *      description: Le scan d'un ticket le jour de match
 *      parameters:
 *        - in : body
 *          name: Ticket
 *          schema:
 *            type: object
 *            required:
 *              - ticketId
 *              - securityToken
 *            properties:
 *              ticketId:
 *                type: string
 *              securityToken:
 *                type: string
 *      responses:
 *        '200':
 *          description: The ticket is valid. with object that contains updated ticket data
 *        '400':
 *         description: |
 *           Bad Request. 
 *           - The field is required.
 *           - The field is empty.
 *           - Invalid ticketId.
 *           - Invalid SecurityToken.
 *        '403':
 *         description: |
 *           Unauthorized. 
 *           - Only agents can perform this action.
 *           - The Agent is banned.
 *           - The ticket is already used.
 *           - The ticket is expired.
 *           - Invalid securityToken.
 *        '404':
 *         description: |
 *           Not found. 
 *           - Ticket not found.
 *           - Agent not found.
 *        '408':
 *          description: Unable to process your request at the moment, please try later
 *        '500':
 *          description: |
 *            Internal Server Error.
 *            - Internal Server Error.
 */
router.post("/scan-ticket", agentAuth, scanTicketDto, ticketCon.scanTicket);

/**
 *  @swagger
 *  /api/ticket/get-by-id/:ticketId:
 *    get:
 *      tags:
 *      - Ticket
 *      description: Affichage d'un ticket byId
 *      parameters:
 *        - in : params
 *          name: ticketId
 *          schema:
 *            type: string
 *          description: Id du ticket (obligatoire)
 *      responses:
 *        '200':
 *          description: object that contains ticket data
 *        '400':
 *         description: |
 *           Bad Request. 
 *           - The field is required.
 *           - The field is empty.
 *           - Invalid ticketId.
 *        '403':
 *         description: |
 *           Unauthorized. 
 *           - Only club and agents can perform this action.
 *           - The club is banned.
 *           - The agent is banned.
 *        '404':
 *         description: |
 *           Not found. 
 *           - Ticket not found.
 *        '408':
 *          description: Unable to process your request at the moment, please try later
 *        '500':
 *          description: |
 *            Internal Server Error.
 *            - Internal Server Error.
 */
router.get("/get-by-id/:ticketId", clubOrAgentAuth, getTicketByIdDto, ticketCon.getTicketById);

/**
 *  @swagger
 *  /api/ticket/get-by-match/:matchId:
 *    get:
 *      tags:
 *      - Ticket
 *      description: Get tickets list by matchId with optional pagination.
 *      parameters:
 *        - name: matchId
 *          in : params
 *          schema:
 *            type: string
 *          description: Id du match (obligatoire)
 *        - name: page
 *          in: query
 *          description: The page number for pagination (default is 1).
 *          required: false
 *          schema:
 *            type: integer
 *        - name: limit
 *          in: query
 *          description: The number of items per page (default is 20).
 *          required: false
 *          schema:
 *            type: integer
 *      responses:
 *        '200':
 *          description: paginated tickets data by match id
 *        '400':
 *         description: |
 *           Bad Request. 
 *           - The field is required.
 *           - The field is empty.
 *           - Invalid matchId.
 *        '403':
 *         description: |
 *           Unauthorized. 
 *           - Only club and agents can perform this action.
 *           - The club is banned.
 *           - The agent is banned.
 *        '404':
 *         description: |
 *           Not found. 
 *           - match not found.
 *        '408':
 *          description: Unable to process your request at the moment, please try later
 *        '500':
 *          description: |
 *            Internal Server Error.
 *            - Internal Server Error.
 */
router.get("/get-by-match/:matchId", clubOrAgentAuth, getTicketsByMatchIdDto, ticketCon.getTicketsByMatchId);

/**
 *  @swagger
 *  /api/ticket/abandon-by-id/:ticketId:
 *    get:
 *      tags:
 *      - Ticket
 *      description: L'abandon d'un ticket byId
 *      parameters:
 *        - in : params
 *          name: ticketId
 *          schema:
 *            type: string
 *          description: Id du ticket (obligatoire)
 *      responses:
 *        '200':
 *          description: The ticket is abandoned successfully.
 *        '400':
 *         description: |
 *           Bad Request. 
 *           - The field is required.
 *           - The field is empty.
 *           - Invalid ticketId.
 *           - Ticket already abandoned.
 *        '403':
 *         description: |
 *           Unauthorized. 
 *           - The client is banned.
 *           - Clients are allowed to delete only their own tickets.
 *           - Ticket already used.
 *           - Ticket is expired.
 *        '404':
 *         description: |
 *           Not found. 
 *           - Client not found.
 *           - Ticket not found.
 *           - Match not found.
 *        '408':
 *          description: Unable to process your request at the moment, please try later
 *        '500':
 *          description: |
 *            Internal Server Error.
 *            - Internal Server Error.
 */
router.delete("/abandon-by-id/:ticketId", clientAuth, abandonTicketByIdDto, ticketCon.abandonTicketById);

module.exports = router;
