import express from "express";
const router = express.Router();
const matchCon = require("../controlleurs/match.controlleur");
const clubM =require("../middleware/clubManagment");
import upload from '../middleware/multer.video.image';
/**
 *  @swagger
 *  /api/match/createMatch:
 *    post:
 *      tags:
 *      - Match
 *      description: la création d'un nouveau match
 *      parameters:
 *        - in : body
 *          name: match
 *          schema:
 *            type: object
 *            required:
 *              - titled
 *              - stadiumName
 *              - competition
 *              - date
 *              - hour
 *              - numberOfGoals
 *              - goalkeeper
 *              - defender
 *              - midfielder
 *              - attacker
 *              - myClubResult
 *              - nameAdversary
 *              - resultAdversary
 *              - adversaryLogo
 *              - delayed
 *              - notified 
 *              - description
 *              - joueurs
 *              - seats
 *            properties:
 *              titled:
 *                type: string
 *              stadiumName:
 *                type: string
 *              competition:
 *                type: string
 *              date:
 *                type: string
 *              hour:
 *                type: string
 *              numberOfGoals:
 *                type: number
 *              goalkeeper:
 *                type: string
 *              defender:
 *                type: string
 *              midfielder:
 *                type: string
 *              attacker:
 *                type: string
 *              myClubResult:
 *                type: number
 *              nameAdversary:
 *                type: string
 *              resultAdversary:
 *                type: number
 *              adversaryLogo:
 *                type: string
 *              delayed:
 *                type: Boolean
 *              notified:
 *                type: Boolean
 *              description:
 *                type: string
 *              joueurs:
 *                type: array
 *                items:
 *                  type: object
 *                  required:
 *                    - joueurId
 *                    - minute
 *                  properties:
 *                    joueurId:
 *                      type: string
 *                    minute:
 *                      type: string
 *              seats:
 *                type: object
 *                required:
 *                  - vip
 *                  - standard
 *                properties:
 *                  vip:
 *                    type: object
 *                    required:
 *                      - price
 *                      - total
 *                    properties:
 *                      price:
 *                        type: string
 *                      total:
 *                        type: number
 *                      reserved:
 *                        type: number
 *                        default: 0
 *                  standard:
 *                    type: object
 *                    required:
 *                      - price
 *                      - total
 *                    properties:
 *                      price:
 *                        type: string
 *                      total:
 *                        type: number
 *                      reserved:
 *                        type: number
 *                        default: 0
 *      responses:
 *        '201':
 *          description: The match is created
 *        '400':
 *          description: the field is empty or Invalid format
 *        '501':
 *          description: Field type is unexpected or not allow
 *        '404':
 *          description: The player entered does not exist
 *        '403':
 *          description: Invalid joueurId.
 *        '409':
 *          description: joueurs must be an array. or Duplicate 'minute' is not allowed in the joueurs array.
 *        '500':
 *          description: server error
 */
router.post("/createMatch",clubM,upload.fields([{ name: 'adversaryLogo',maxCount:1 }]),matchCon.register);

/**
 * @swagger
 * /api/match/getAll:
 *   get:
 *     tags:
 *       - Match
 *     description: Retrieve a list of matches based on optional start and end date filters and an optional nameAdversary filter
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
 *       - in: query
 *         name: nameAdversary
 *         schema:
 *           type: string
 *         description: Filter with name adversary (optional)
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of matches
 *       '400':
 *         description: Invalid endDate or startDate format. Please use YYYY-MM-DD or YYYY/MM/DD
 *       '500':
 *         description: Internal server error
 */
router.get("/getAll",clubM, matchCon.getAll);

/**
 *  @swagger
 *  /api/match/getNumberMatchsByMonth:
 *    get:
 *      tags:
 *      - Match
 *      description: Affichage du nombre de matchs par mois
 *      parameters:
 *       - name: month
 *         in: query
 *         description: Filter matchs by month (optional).
 *         required: false
 *         schema:
 *           type: string
 *       - name: year
 *         in: query
 *         description: Filter matchs by year (optional).
 *         required: false
 *         schema:
 *           type: string
 *      responses:
 *        '200':
 *          description: Successful response with number of matchs
 *        '500':
 *          description: server error
 */
router.get("/getNumberMatchsByMonth", clubM, matchCon.getNumberMatchsByMonth);

/**
 *  @swagger
 *  /api/match/joueur/:joueurId/getPlayerGoalNumberForClub:
 *    get:
 *      tags:
 *      - Match
 *      description: Affichage du nombre de buts d'un joueur pour un club
 *      parameters:
 *        - in : params
 *          name: joueurId
 *          schema:
 *            type: string
 *          description: Id du joueur (obligatoire)
 *      responses:
 *        '200':
 *          description: Successful response with number of goals per player
 *        '403':
 *          description: the joueurId is invalid
 *        '404':
 *          description: the player does not exist
 *        '500':
 *          description: server error
 */
router.get("/joueur/:joueurId/getPlayerGoalNumberForClub", clubM, matchCon.getPlayerGoalNumberForClub);

/**
 *  @swagger
 *  /api/match/getAllClubScorers:
 *    get:
 *      tags:
 *      - Match
 *      description: Affichage des buteurs(fullName + nombre de buts pour chaque joueurs) pour un club
 *      responses:
 *        '200':
 *          description: Successful response with list of scorers
 *        '404':
 *          description: No players found for this club
 *        '500':
 *          description: server error
 */
router.get("/getAllClubScorers", clubM, matchCon.getAllClubScorers);

/**
 *  @swagger
 *  /api/match/getMatchById/:id:
 *    get:
 *      tags:
 *      - Match
 *      description: Affichage d'un match byId
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du match (obligatoire)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '403':
 *          description: the id is invalid
 *        '404':
 *          description: the match does not exist
 *        '500':
 *          description: server error
 */
router.get("/getMatchById/:id", clubM, matchCon.getMatch);
/**
 *  @swagger
 *  /api/match/deleteMatchById/:id:
 *    delete:
 *      tags:
 *      - Match
 *      description: Suppression d'un match byId
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du match (obligatoire)
 *      responses:
 *        '201':
 *          description: The match was deleted
 *        '404':
 *          description: the match does not exist
 *        '403':
 *          description: the id is invalid
 *        '401':
 *          description: you are not allowed to remove a match from another club
 *        '500':
 *          description: server error
 */
router.delete("/deleteMatchById/:id", clubM,  matchCon.deleteMatch);
/**
 *  @swagger
 *  /api/match/deleteAll:
 *    delete:
 *      tags:
 *      - Match
 *      description: Suppression de tout les matchs
 *      responses:
 *        '200':
 *          description: all matchs have been successfully deleted
 *        '500':
 *          description: server error
 */
router.delete("/deleteAll", clubM, matchCon.deleteAll);
/**
 *  @swagger
 *  /api/match/updateMatch/:id:
 *    put:
 *      tags:
 *      - Match
 *      description: Modification d'un match
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du match (obligatoire)
 *        - in : body
 *          name: match
 *          schema:
 *            type: object
 *            required:
 *              - titled
 *              - stadiumName
 *              - competition
 *              - date
 *              - hour
 *              - numberOfGoals
 *              - goalkeeper
 *              - defender
 *              - midfielder
 *              - attacker
 *              - myClubResult
 *              - nameAdversary
 *              - resultAdversary
 *              - adversaryLogo
 *              - notified
 *              - description
 *              - joueurs
 *            properties:
 *              titled:
 *                type: string
 *              stadiumName:
 *                type: string
 *              competition:
 *                type: string
 *              date:
 *                type: string
 *              hour:
 *                type: string
 *              numberOfGoals:
 *                type: number
 *              goalkeeper:
 *                type: string
 *              defender:
 *                type: string
 *              midfielder:
 *                type: string
 *              attacker:
 *                type: string
 *              myClubResult:
 *                type: number
 *              nameAdversary:
 *                type: string
 *              resultAdversary:
 *                type: number
 *              adversaryLogo:
 *                type: string
 *              delayed:
 *                type: Boolean
 *              notified:
 *                type: Boolean
 *              description:
 *                type: string
 *              joueurs:
 *                type: array
 *                items:
 *                  type: object
 *                  required:
 *                    - joueurId
 *                    - minute
 *                  properties:
 *                    joueurId:
 *                      type: string
 *                    minute:
 *                      type: string
 *      responses:
 *        '201':
 *          description: the match was modified
 *        '401':
 *          description: the id is invalid
 *        '404':
 *          description: the match does not exist. or The player entered does not exist.
 *        '403':
 *          description: please modify at least one field. or Invalid joueurId.
 *        '400':
 *          description: you are not allowed to modify a match from another club
 *        '406':
 *          description: Invalid date format. Please use YYYY-MM-DD or YYYY/MM/DD
 *        '409':
 *          description: joueurs must be an array. or Duplicate 'minute' is not allowed in the joueurs array.
 *        '501':
 *          description: Field type is unexpected
 *        '500':
 *          description: server error
 */
router.put("/updateMatch/:id", clubM,upload.fields([{ name: 'adversaryLogo',maxCount:1 }]),matchCon.setMatch);
module.exports = router;