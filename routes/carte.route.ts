import express from "express";
const router = express.Router();
const carteCon = require("../controlleurs/carte.controlleur");
const clubM =require("../middleware/clubManagment");
import upload from '../middleware/multer.video.image';

/**
 *  @swagger
 *  /api/carte/create:
 *    post:
 *      tags:
 *      - Carte
 *      description: la création d'une nouvelle carte de match
 *      parameters:
 *        - in : body
 *          name: carte
 *          schema:
 *            type: object
 *            required:
 *              - titled
 *              - image
 *              - numberOfMatches
 *              - totalPrice
 *              - description
 *              - duration
 *            properties:
 *              titled:
 *                type: string
 *              image:
 *                type: File
 *              numberOfMatches:
 *                type: number
 *              totalPrice:
 *                type: number
 *              description:
 *                type: string
 *              duration:
 *                type: number
 *      responses:
 *        '201':
 *          description: The carte is created
 *        '400':
 *          description: the field is empty.
 *        '404':
 *          description: Carte with this titled already exists.
 *        '401':
 *          description: Unauthorized
 *        '501':
 *          description: Field type is unexpected
 *        '500':
 *          description: server error
 */
router.post("/create",clubM, upload.fields([{ name: 'image',maxCount:1 }]),carteCon.create);

/**
 * @swagger
 * /api/carte/getAll:
 *   get:
 *     tags:
 *       - Carte
 *     description: Retrieve a list of cards for an authenticated club.
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of cartes
 *       '400':
 *         description: the club does not exist.
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
router.get("/getAll",clubM,carteCon.getAll);

/**
 *  @swagger
 *  /api/carte/getById/:id:
 *    get:
 *      tags:
 *      - Carte
 *      description: Affichage d'une carte byId pour un club authentifier
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du carte (obligatoire)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '403':
 *          description: the id is invalid
 *        '404':
 *          description: the carte does not exist.
 *        '401':
 *          description: Unauthorized
 *        '500':
 *          description: server error
 */
router.get("/getById/:id",clubM, carteCon.getById);

/**
 * @swagger
 * /api/carte/getAllForClient/:clubName:
 *   get:
 *     tags:
 *       - Carte
 *     description: Retrieve a list of cards for a specific club.
 *     parameters:
 *       - in : params
 *         name: clubName
 *         schema:
 *           type: string
 *         description: Le nom du club (obligatoire)
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of cartes
 *       '400':
 *         description: the club does not exist.
 *       '500':
 *         description: Internal server error
 */
router.get("/getAllForClient/:clubName",carteCon.getAllForClient);

/**
 *  @swagger
 *  /api/carte/club/:clubName/getByIdForClient/:carteId:
 *    get:
 *      tags:
 *      - Carte
 *      description: Affichage d'une carte byId
 *      parameters:
 *        - in : params
 *          name: clubName
 *          schema:
 *            type: string
 *          description: Le nom du club (obligatoire)
 *        - in : params
 *          name: carteId
 *          schema:
 *            type: string
 *          description: Id du carte (obligatoire)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '403':
 *          description: the carteId is invalid
 *        '404':
 *          description: the carte does not exist. or the club does not exist.
 *        '500':
 *          description: server error
 */
router.get("/club/:clubName/getByIdForClient/:carteId", carteCon.getByIdForClient);

/**
 *  @swagger
 *  /api/carte/deleteById/:id:
 *    delete:
 *      tags:
 *      - Carte
 *      description: Suppression d'une carte byId
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du carte (obligatoire)
 *      responses:
 *        '201':
 *          description: The carte was deleted
 *        '404':
 *          description: the carte does not exist
 *        '403':
 *          description: the id is invalid
 *        '401':
 *          description: you are not allowed to remove a carte from another club
 *        '500':
 *          description: server error
 */
router.delete("/deleteById/:id", clubM, carteCon.deleteById);

/**
 *  @swagger
 *  /api/carte/update/:id:
 *    put:
 *      tags:
 *      - Carte
 *      description: Modification d'une carte
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du carte (obligatoire)
 *        - in : body
 *          name: carte
 *          schema:
 *            type: object
 *            required:
 *              - titled
 *              - image
 *              - numberOfMatches
 *              - totalPrice
 *              - description
 *              - duration
 *            properties:
 *              titled:
 *                type: string
 *              image:
 *                type: File
 *              numberOfMatches:
 *                type: number
 *              totalPrice:
 *                type: number
 *              description:
 *                type: string
 *              duration:
 *                type: number
 *      responses:
 *        '201':
 *          description: the carte was modified
 *        '401':
 *          description: the id is invalid. or Unauthorized.
 *        '404':
 *          description: the carte does not exist. or This titled already exists.
 *        '403':
 *          description: please modify at least one field
 *        '400':
 *          description: you are not allowed to modify a carte from another club
 *        '501':
 *          description: Field type is unexpected
 *        '500':
 *          description: server error
 */
router.put("/update/:id", clubM, upload.fields([{ name: 'image',maxCount:1 }]),carteCon.update);

module.exports = router;