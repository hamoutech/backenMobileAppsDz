import express from "express";
const router = express.Router();
const joueurCon = require("../controlleurs/joueur.controlleur");
const clubM =require("../middleware/clubManagment");
import upload from '../middleware/multer.video.image';
/**
 * @swagger
 * /api/joueur/createPlayer:
 *   post:
 *     tags:
 *     - Joueur
 *     description: Create a new player
 *     parameters:
 *       - in : body
 *         name: joueur
 *         schema:
 *           type: object
 *           required:
 *             - fullName
 *             - arabicFullName
 *             - numberPhone
 *             - dateOfBirth
 *             - position
 *             - arabicPosition
 *             - placeOfBirth
 *             - arabicPlaceOfBirth
 *             - image
 *             - video
 *             - numberOfMatches
 *             - numberOfGoals
 *             - numberOfDecisivePasses
 *             - nationality
 *             - arabicNationality
 *             - atTheClubSince
 *             - size
 *             - weight
 *             - strongFoot
 *             - arabicStrongFoot
 *             - description
 *             - arabicDescription
 *             - previousClubName
 *             - arabicPreviousClubName
 *             - previousClubYears
 *             - previousClubNumberOfMatches
 *             - tShirtNumber
 *             - language
 *           properties:
 *             fullName:
 *               type: string
 *             arabicFullName:
 *               type: string
 *             dateOfBirth:
 *               type: string
 *             numberPhone:
 *               type: string
 *             position:
 *               type: string
 *             arabicPosition:
 *               type: string
 *             placeOfBirth:
 *               type: string
 *             arabicPlaceOfBirth:
 *               type: string
 *             image:
 *               type: string
 *             video:
 *               type: string
 *             numberOfMatches:
 *               type: number
 *             numberOfGoals:
 *               type: number
 *             numberOfDecisivePasses:
 *               type: number
 *             nationality:
 *               type: string
 *             arabicNationality:
 *               type: string
 *             atTheClubSince:
 *               type: string
 *             size:
 *               type: string
 *             weight:
 *               type: string
 *             strongFoot:
 *               type: string
 *             arabicStrongFoot:
 *               type: string
 *             description:
 *               type: string
 *             arabicDescription:
 *               type: string
 *             previousClubName:
 *               type: string
 *             arabicPreviousClubName:
 *               type: string 
 *             previousClubYears:
 *               type: string
 *             previousClubNumberOfMatches:
 *               type: number
 *             tShirtNumber:
 *               type: string
 *             language:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: 
 *                   - fr
 *                   - arb
 *     responses:
 *       '201':
 *         description: The account is created
 *       '400':
 *         description: The field is empty or Invalid dateOfBirth
 *       '401':
 *         description: Player already exists
 *       '403':
 *         description: Invalid position. or Invalid arabicPosition. or Invalid language.
 *       '404':
 *         description: Player with this tShirtNumber already exists.
 *       '501':
 *         description: Field type is unexpected or not allow
 *       '500':
 *         description: Server error
 */
router.post("/createPlayer",clubM,upload.fields([{ name: 'image',maxCount:1 }, { name: 'video',maxCount:1 }]),joueurCon.register);
/**
 *  @swagger
 *  /api/joueur/getAll:
 *    get:
 *      tags:
 *      - Joueur
 *      description: Affichage des différents joueurs
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '500':
 *          description: server error
 *        '501':
 *          description: not allow.
 */
router.get("/getAll", clubM,joueurCon.getAll);
/**
 *  @swagger
 *  /api/joueur/getJoueurById/:id:
 *    get:
 *      tags:
 *      - Joueur
 *      description: Affichage d'un joueur byId
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id de joueur (obligatoire)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '403':
 *          description: the id is invalid
 *        '404':
 *          description: the player does not exist
 *        '500':
 *          description: server error
 *        '501':
 *          description: not allow.
 */
router.get("/getJoueurById/:id", clubM, joueurCon.getJoueur);
/**
 *  @swagger
 *  /api/joueur/deleteJoueurById/:id:
 *    delete:
 *      tags:
 *      - Joueur
 *      description: Suppression d'un joueur byId
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id de joueur (obligatoire)
 *      responses:
 *        '201':
 *          description: The player was deleted
 *        '404':
 *          description: the player does not exist
 *        '403':
 *          description: the id is invalid
 *        '401':
 *          description: you are not allowed to remove a player from another club
 *        '500':
 *          description: server error
 *        '501':
 *          description: not allow.
 */
router.delete("/deleteJoueurById/:id", clubM, joueurCon.deleteJoueur);
/**
 *  @swagger
 *  /api/joueur/deleteAll:
 *    delete:
 *      tags:
 *      - Joueur
 *      description: Suppression de tout les joueurs
 *      responses:
 *        '200':
 *          description: all players have been successfully deleted
 *        '500':
 *          description: server error
 *        '501':
 *          description: not allow.
 */
router.delete("/deleteAll", clubM, joueurCon.deleteAll);
/**
 *  @swagger
 *  /api/joueur/updateJoueur/:id:
 *    put:
 *      tags:
 *      - Joueur
 *      description: Modification d'un joueur
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id de joueur (obligatoire)
 *        - in : body
 *          name: joueur
 *          schema:
 *            type: object
 *            required:
 *              - fullName
 *              - arabicFullName
 *              - numberPhone
 *              - dateOfBirth
 *              - position
 *              - arabicPosition
 *              - placeOfBirth
 *              - arabicPlaceOfBirth
 *              - image
 *              - video
 *              - numberOfMatches
 *              - numberOfGoals
 *              - numberOfDecisivePasses
 *              - nationality
 *              - arabicNationality
 *              - atTheClubSince
 *              - size
 *              - weight
 *              - strongFoot
 *              - arabicStrongFoot
 *              - description
 *              - arabicDescription
 *              - previousClubName
 *              - arabicPreviousClubName
 *              - previousClubYears
 *              - previousClubNumberOfMatches
 *              - tShirtNumber
 *              - language
 *            properties:
 *              fullName:
 *                type: string
 *              arabicFullName:
 *                type: string
 *              dateOfBirth:
 *                type: string
 *              numberPhone:
 *                type: string
 *              position:
 *                type: string
 *              arabicPosition:
 *                type: string
 *              placeOfBirth:
 *                type: string
 *              arabicPlaceOfBirth:
 *                type: string
 *              image:
 *                type: string
 *              video:
 *                type: string
 *              numberOfMatches:
 *                type: number
 *              numberOfGoals:
 *                type: number
 *              numberOfDecisivePasses:
 *                type: number
 *              nationality:
 *                type: string
 *              arabicNationality:
 *                type: string
 *              atTheClubSince:
 *                type: string
 *              size:
 *                type: string
 *              weight:
 *                type: string
 *              strongFoot:
 *                type: string
 *              arabicStrongFoot:
 *                type: string
 *              description:
 *                type: string
 *              arabicDescription:
 *                type: string
 *              previousClubName:
 *                type: string
 *              arabicPreviousClubName:
 *                type: string 
 *              previousClubYears:
 *                type: string
 *              previousClubNumberOfMatches:
 *                type: number
 *              tShirtNumber:
 *                type: string
 *              language:
 *                type: array
 *                items:
 *                  type: string
 *                  enum: 
 *                    - fr
 *                    - arb
 *      responses:
 *        '201':
 *          description: the player was modified
 *        '401':
 *          description: the numberPhone already exists
 *        '403':
 *          description: the id is invalid. or Invalid position. or Invalid arabicPosition. or Invalid language.
 *        '404':
 *          description: the player does not exist. or Player with this tShirtNumber already exists.
 *        '406':
 *          description: please modify at least one field
 *        '400':
 *          description: you are not allowed to modify a player from another club. or Invalid dateOfBirth. or the field is empty.
 *        '501':
 *          description: Field type is unexpected or not allow
 *        '500':
 *          description: server error
 */
router.put("/updateJoueur/:id", clubM,upload.fields([{ name: 'image',maxCount:1 }, { name: 'video',maxCount:1 }]),joueurCon.setJoueur);

/**
 *  @swagger
 *  /api/joueur/getAllByPosition:
 *    get:
 *      tags:
 *      - Joueur
 *      description: Affichage des différents joueurs par leurs positions
 *      parameters:
 *        - name: position
 *          in: query
 *          description: Filter players by position (optional), Use this parameter to specify the player's position (e.g., "goalkeeper")
 *          schema:
 *            type: string
 *            enum: ["goalkeeper", "midfielder", "defender", "attacker"]
 *      responses:
 *        '400':
 *          description: Invalid position parameter.
 *        '200':
 *          description: Successfuly
 *        '500':
 *          description: server error
 *        '501':
 *          description: not allow.
 */
router.get("/getAllByPosition", clubM, joueurCon.getAllByPosition);

/**
 *  @swagger
 *  /api/joueur/getAllByFullName:
 *    get:
 *      tags:
 *      - Joueur
 *      description: Affichage des différents joueurs par leurs fullName
 *      parameters:
 *        - name: fullName
 *          in: query
 *          description: Filter players by fullName (optional), Use this parameter to specify the player's fullName
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '500':
 *          description: server error
 */
router.get("/getAllByFullName", clubM, joueurCon.getAllByFullName);

/**
 *  @swagger
 *  /api/joueur/getNumberPlayersByAgeRange:
 *    get:
 *      tags:
 *      - Joueur
 *      description: Affichage du nombre de joueurs par tranche d'âge
 *      parameters:
 *       - name: startingAge
 *         in: query
 *         description: Filter players by starting age (optional).
 *         required: false
 *         schema:
 *           type: integer
 *       - name: finalAge
 *         in: query
 *         description: Filter players by final age (optional).
 *         required: false
 *         schema:
 *           type: integer
 *      responses:
 *        '200':
 *          description: Successful response with number of players
 *        '500':
 *          description: server error
 */
router.get("/getNumberPlayersByAgeRange", clubM, joueurCon.getNumberPlayersByAgeRange);

module.exports = router;
