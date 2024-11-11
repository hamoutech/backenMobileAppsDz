import express from "express";
const router = express.Router();
const liveCon = require("../controlleurs/live.controlleur");
const clubM =require("../middleware/clubManagment");

/**
 *  @swagger
 *  /api/live/createLive:
 *    post:
 *      tags:
 *      - Live
 *      description: la création d'un nouveau live
 *      parameters:
 *        - in : body
 *          name: live
 *          schema:
 *            type: object
 *            required:
 *              - titled
 *              - link
 *              - creationDate
 *              - display
 *              - match 
 *              - description
 *            properties:
 *              titled:
 *                type: string
 *              link:
 *                type: string
 *              creationDate:
 *                type: string
 *              display:
 *                type: Boolean
 *              match:
 *                type: string
 *              description:
 *                type: string
 *      responses:
 *        '201':
 *          description: The live is created
 *        '400':
 *          description: the field is empty
 *        '404':
 *          description: Invalid date
 *        '401':
 *          description: Unauthorized
 *        '501':
 *          description: Field type is unexpected
 *        '500':
 *          description: server error
 */
router.post("/createLive",clubM,liveCon.createLive);

/**
 * @swagger
 * /api/live/getAll:
 *   get:
 *     tags:
 *       - Live
 *     description: Retrieve a list of live based on optional start and end date filters
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: Start date in the format 'YYYY/MM/DD' (optional)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: End date in the format 'YYYY/MM/DD' (optional)
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of live
 *       '400':
 *         description: Invalid endDate or startDate format. Please use YYYY-MM-DD or YYYY/MM/DD
 *       '500':
 *         description: Internal server error
 */
router.get("/getAll",clubM, liveCon.getAll);

/**
 *  @swagger
 *  /api/live/getLiveById/:id:
 *    get:
 *      tags:
 *      - Live
 *      description: Affichage d'un live byId
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du live (obligatoire)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '403':
 *          description: the id is invalid
 *        '404':
 *          description: the live does not exist
 *        '500':
 *          description: server error
 */
router.get("/getLiveById/:id", clubM, liveCon.getLive);

/**
 *  @swagger
 *  /api/live/deleteLiveById/:id:
 *    delete:
 *      tags:
 *      - Live
 *      description: Suppression d'un live byId
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du live (obligatoire)
 *      responses:
 *        '201':
 *          description: The live was deleted
 *        '404':
 *          description: the live does not exist
 *        '403':
 *          description: the id is invalid
 *        '401':
 *          description: you are not allowed to remove a live from another club
 *        '500':
 *          description: server error
 */
router.delete("/deleteLiveById/:id", clubM, liveCon.deleteLive);

/**
 *  @swagger
 *  /api/live/deleteAll:
 *    delete:
 *      tags:
 *      - Live
 *      description: Suppression de tout les live
 *      responses:
 *        '200':
 *          description: all live have been successfully deleted
 *        '500':
 *          description: server error
 */
router.delete("/deleteAll", clubM, liveCon.deleteAll);

/**
 *  @swagger
 *  /api/live/updateLive/:id:
 *    put:
 *      tags:
 *      - Live
 *      description: Modification d'un live
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du live (obligatoire)
 *        - in : body
 *          name: live
 *          schema:
 *            type: object
 *            required:
 *              - titled
 *              - link
 *              - creationDate
 *              - display
 *              - match 
 *              - description 
 *            properties:
 *              titled:
 *                type: string
 *              link:
 *                type: string
 *              creationDate:
 *                type: string
 *              display:
 *                type: Boolean
 *              match:
 *                type: string
 *              description:
 *                type: string
 *      responses:
 *        '201':
 *          description: the live was modified
 *        '401':
 *          description: the id is invalid or Unauthorized
 *        '404':
 *          description: the live does not exist
 *        '403':
 *          description: please modify at least one field
 *        '400':
 *          description: you are not allowed to modify a live from another club
 *        '406':
 *          description: Invalid date format. Please use YYYY-MM-DD or YYYY/MM/DD
 *        '501':
 *          description: Field type is unexpected
 *        '500':
 *          description: server error
 */
router.put("/updateLive/:id", clubM,liveCon.setLive);

module.exports = router;