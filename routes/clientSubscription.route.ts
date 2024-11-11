import express from "express";
const router = express.Router();
const clientSubscriptionCon = require("../controlleurs/clientSubscription.controlleur");
const clubM =require("../middleware/clubManagment");
const clientAuth =require("../middleware/clientAuth");

/**
 *  @swagger
 *  /api/clientSubscription/create:
 *    post:
 *      tags:
 *      - Client Subscription
 *      description: la création d'un nouvel abonnement pour une carte d'un match
 *      parameters:
 *        - in : body
 *          name: clientSubscription
 *          schema:
 *            type: object
 *            required:
 *              - carteId
 *            properties:
 *              carteId:
 *                type: string
 *      responses:
 *        '201':
 *          description: The Client Subscription is created
 *        '400':
 *          description: the field is empty. or the carteId is invalid.
 *        '404':
 *          description: the carte does not exist.
 *        '401':
 *          description: Unauthorized
 *        '500':
 *          description: server error
 */
router.post("/create", clientAuth ,clientSubscriptionCon.create);

/**
 * @swagger
 * /api/clientSubscription/getAll:
 *   get:
 *     tags:
 *       - Client Subscription
 *     description: Retrieve a list of client subscriptions for an authenticated club.
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of client subscriptions
 *       '400':
 *         description: the club does not exist.
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
router.get("/getAll",clubM,clientSubscriptionCon.getAll);

/**
 *  @swagger
 *  /api/clientSubscription/getById/:id:
 *    get:
 *      tags:
 *      - Client Subscription
 *      description: Affichage d'un abonnement byId pour un club authentifié
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du clientSubscription (obligatoire)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '403':
 *          description: the id is invalid
 *        '404':
 *          description: the client subscription does not exist.
 *        '401':
 *          description: Unauthorized
 *        '500':
 *          description: server error
 */
router.get("/getById/:id",clubM, clientSubscriptionCon.getById);

/**
 * @swagger
 * /api/clientSubscription/getAllForClient:
 *   get:
 *     tags:
 *       - Client Subscription
 *     description: Retrieve a list of subscriptions for an authenticated client.
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of client subscriptions
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
router.get("/getAllForClient", clientAuth, clientSubscriptionCon.getAllForClient);

/**
 *  @swagger
 *  /api/clientSubscription/getByIdForClient/:id:
 *    get:
 *      tags:
 *      - Client Subscription
 *      description: Affichage d'un abonnement pour un client byId
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du client subscription (obligatoire)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '403':
 *          description: the id is invalid
 *        '404':
 *          description: the client subscription does not exist.
 *        '401':
 *          description: Unauthorized
 *        '500':
 *          description: server error
 */
router.get("/getByIdForClient/:id", clientAuth, clientSubscriptionCon.getByIdForClient);

/**
 *  @swagger
 *  /api/clientSubscription/deleteById/:id:
 *    delete:
 *      tags:
 *      - Client Subscription
 *      description: Suppression d'un abonnement pour un client byId
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du client subscription (obligatoire)
 *      responses:
 *        '201':
 *          description: The client subscription was deleted
 *        '404':
 *          description: the client subscription does not exist
 *        '403':
 *          description: the id is invalid
 *        '401':
 *          description: you are not allowed to remove a client subscription from another club. or Unauthorized.
 *        '500':
 *          description: server error
 */
router.delete("/deleteById/:id", clubM, clientSubscriptionCon.deleteById);

/**
 *  @swagger
 *  /api/clientSubscription/activated/:id:
 *    put:
 *      tags:
 *      - Client Subscription
 *      description: Activer un abonnement pour un client
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du clientSubscription (obligatoire)
 *      responses:
 *        '201':
 *          description: the client subscription was activated
 *        '401':
 *          description: the id is invalid. or Unauthorized.
 *        '404':
 *          description: the client subscription does not exist.
 *        '403':
 *          description: Customer subscription is already activated!
 *        '400':
 *          description: you are not allowed to activated a client subscription from another club
 *        '500':
 *          description: server error
 */
router.put("/activated/:id", clubM,clientSubscriptionCon.activated);

/**
 *  @swagger
 *  /api/clientSubscription/disabled/:id:
 *    put:
 *      tags:
 *      - Client Subscription
 *      description: Désactiver un abonnement pour un client
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du clientSubscription (obligatoire)
 *      responses:
 *        '201':
 *          description: the client subscription was disabled
 *        '401':
 *          description: the id is invalid. or Unauthorized.
 *        '404':
 *          description: the client subscription does not exist.
 *        '403':
 *          description: Customer subscription is already deactivated!
 *        '400':
 *          description: you are not allowed to disabled a client subscription from another club
 *        '500':
 *          description: server error
 */
router.put("/disabled/:id", clubM,clientSubscriptionCon.disabled);

/**
 *  @swagger
 *  /api/clientSubscription/renewed/:id:
 *    put:
 *      tags:
 *      - Client Subscription
 *      description: Renouveler un abonnement pour un client
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du clientSubscription (obligatoire)
 *      responses:
 *        '201':
 *          description: the client subscription was renewed
 *        '401':
 *          description: the id is invalid. or Unauthorized.
 *        '404':
 *          description: the client subscription does not exist.
 *        '403':
 *          description: Customer subscription is already renewed!
 *        '400':
 *          description: you are not allowed to renewed a client subscription from another club
 *        '500':
 *          description: server error
 */
router.put("/renewed/:id", clubM,clientSubscriptionCon.renewed);

/**
 *  @swagger
 *  /api/clientSubscription/turnOff/:id:
 *    put:
 *      tags:
 *      - Client Subscription
 *      description: éteindre un abonnement pour un client
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du clientSubscription (obligatoire)
 *      responses:
 *        '201':
 *          description: the client subscription was turn off
 *        '401':
 *          description: the id is invalid. or Unauthorized.
 *        '404':
 *          description: the client subscription does not exist.
 *        '403':
 *          description: Customer subscription is already turn off!
 *        '400':
 *          description: you are not allowed to turn off a client subscription from another club
 *        '500':
 *          description: server error
 */
router.put("/turnOff/:id", clubM,clientSubscriptionCon.turnOff);

/**
 *  @swagger
 *  /api/clientSubscription/scan-card/:id:
 *    put:
 *      tags:
 *      - Client Subscription
 *      description: Scanné une carte d'abonnement par un client
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du clientSubscription (obligatoire)
 *      responses:
 *        '201':
 *          description: the card was scanned successfully
 *        '401':
 *          description: the id is invalid. or Unauthorized.
 *        '404':
 *          description: the client subscription does not exist.
 *        '403':
 *          description: You cannot scan this card because you have exhausted all possible scans!
 *        '406':
 *          description: You cannot scan this card because the card is not activated!
 *        '400':
 *          description: you are not allowed to scanned a card from another client.
 *        '500':
 *          description: server error
 */
router.put("/scan-card/:id", clientAuth,clientSubscriptionCon.scanCard);

module.exports = router;