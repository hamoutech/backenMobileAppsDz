import express from "express";
const router = express.Router();
const messageCon = require("../controlleurs/message.controlleur");
const clubM = require("../middleware/clubManagment");

/**
 *  @swagger
 *  /api/message/createMessage/:clubName:
 *    post:
 *      tags:
 *      - Message
 *      description: l'envoi d'un nouveau message d'un fan pour un club
 *      parameters:
 *        - in: query
 *          name: clubName
 *          schema:
 *            type: string
 *          description: Nom du club (obligatoire)
 *        - in : body
 *          name: message
 *          schema:
 *            type: object
 *            required:
 *              - lastName
 *              - firstName
 *              - email
 *              - phoneNumber
 *              - message
 *              - clubName
 *            properties:
 *              lastName:
 *                type: string
 *              firstName:
 *                type: string
 *              email:
 *                type: string
 *              phoneNumber:
 *                type: string
 *              message:
 *                type: string
 *              clubName:
 *                type: string
 *      responses:
 *        '201':
 *          description: The message has been sent
 *        '400':
 *          description: the field is empty or incorrect format
 *        '404':
 *          description: the club does not exist
 *        '401':
 *          description: you can't send a message to two different clubs
 *        '500':
 *          description: Server Error
 */
router.post("/createMessage/:clubName", messageCon.createMessage);

/**
 * @swagger
 * /api/message/getAllMessages:
 *   get:
 *     tags:
 *       - Message
 *     description: Affichage des différents messages de fans d'un club avec pagination facultative et filtration par createdDate facultative.
 *     parameters:
 *       - name: page
 *         in: query
 *         description: The page number for pagination (default is 1).
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: The number of items per page (default is 0, meaning no pagination).
 *         required: false
 *         schema:
 *           type: integer
 *       - name: createdDate
 *         in: query
 *         description: Filter message by created date (optional) / format:"DD/MM/YYYY"
 *         required: false
 *         schema:
 *           type: string
 *           format: date   # Assuming createdDate is in "DD/MM/YYYY" format
 *     responses:
 *       '200':
 *         description: Successful response with a list of message.
 *       '400':
 *         description: Invalid createdDate format. Please use DD/MM/YYYY
 *       '500':
 *         description: Server error.
 */
router.get("/getAllMessages", clubM, messageCon.getAllMessages);

/**
 *  @swagger
 *  /api/message/getMessageById/:id:
 *    get:
 *      tags:
 *      - Message
 *      description: Affichage d'un message byId
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du message (obligatoire)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '403':
 *          description: the id is invalid
 *        '404':
 *          description: the message does not exist
 *        '500':
 *          description: server error
 */
router.get("/getMessageById/:id", clubM, messageCon.getMessage);

/**
 *  @swagger
 *  /api/message/deleteMessageById/:id:
 *    delete:
 *      tags:
 *      - Message
 *      description: Suppression d'un message byId
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du message (obligatoire)
 *      responses:
 *        '201':
 *          description: The message was deleted
 *        '404':
 *          description: the message does not exist
 *        '403':
 *          description: the id is invalid
 *        '401':
 *          description: you are not allowed to remove a message from another club
 *        '500':
 *          description: server error
 */
router.delete("/deleteMessageById/:id", clubM, messageCon.deleteMessage);

module.exports = router;