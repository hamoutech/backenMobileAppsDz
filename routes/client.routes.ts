import express from "express";
const router = express.Router();
const clientCon = require("../controlleurs/client.controlleur");
const clientAuth =require("../middleware/clientAuth");
const clubM =require("../middleware/clubManagment");
import upload from '../middleware/multer.video.image';

/**
 *  @swagger
 *  /api/client/account:
 *    post:
 *      tags:
 *      - Client
 *      description: la création d'un nouveau compte client
 *      parameters:
 *        - in : body
 *          name: client
 *          schema:
 *            type: object
 *            required:
 *              - pseudo
 *              - email
 *              - password
 *              - confirmPassword
 *              - phoneNumber
 *              - image
 *              - clubName
 *            properties:
 *              pseudo:
 *                type: string
 *              image:
 *                type: string
 *              email:
 *                type: string
 *              password:
 *                type: string
 *              confirmPassword:
 *                type: string
 *              phoneNumber:
 *                type: string
 *              clubName:
 *                type: string
 *      responses:
 *        '201':
 *          description: The account is created
 *        '400':
 *          description: the field is empty. or incorrect format. or the club does not exist.
 *        '401':
 *          description: Client with this email already exists. or Client with this pseudo already exists.
 *        '404':
 *          description: the password and the confirmation password are different
 *        '500':
 *          description: Server Error
 */
router.post("/account",upload.fields([{ name: 'image',maxCount:1 }]),clientCon.account);

/**
 *  @swagger
 *  /api/client/login:
 *    post:
 *      tags:
 *      - Client
 *      description: la connexion d'un client
 *      parameters:
 *        - in : body
 *          name: client
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *              - pseudo
 *              - clubName
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *              pseudo:
 *                type: string
 *              clubName:
 *                type: string
 *      responses:
 *        '200':
 *          description: the client is well connected
 *        '401':
 *          description: incorrect password
 *        '404':
 *          description: The client does not exist
 *        '400':
 *          description: the field is empty
 *        '403':
 *          description: You are not authorized, please contact the club administrators!
 *        '500':
 *          description: Server Error
 */
router.post("/login", clientCon.login);

/**
 *  @swagger
 *  /api/client/forget-password:
 *    put:
 *      tags:
 *      - Client
 *      description: L'envoi de lien de réinitialisation pour le mot de passe oublié
 *      parameters:
 *        - in: body
 *          name: client
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - clubName
 *            properties:
 *              email:
 *                type: string
 *              clubName:
 *                type: string
 *      responses:
 *        '200':
 *          description: The password reset link was sent to your email
 *        '404':
 *          description: The client does not exist
 *        '400':
 *          description: The field is empty. or The email was not sent.
 *        '500':
 *          description: Server Error
 */
router.put("/forget-password",  clientCon.forgetPassword);

/**
 *  @swagger
 *  /api/client/reset-password:
 *    put:
 *      tags:
 *      - Client
 *      description: La modification de mot de passe oublié
 *      parameters:
 *        - in: body
 *          name: client
 *          schema:
 *            type: object
 *            required:
 *              - resetLink
 *              - password
 *              - confirmPassword
 *            properties:
 *              resetLink:
 *                type: string
 *              password:
 *                type: string
 *              confirmPassword:
 *                type: string
 *      responses:
 *        '201':
 *          description: your password was changed correctly
 *        '404':
 *          description: The client does not exist
 *        '400':
 *          description: the new password and the new confirmation password are different
 *        '401':
 *          description: The field is empty
 *        '500':
 *          description: Server Error
 */
router.put("/reset-password", clientCon.resetPassword);

/**
 *  @swagger
 *  /api/client/profil:
 *    get:
 *      tags:
 *      - Client
 *      description: Affichage de mon profil
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '500':
 *          description: Server Error
 *        '403':
 *          description: not allow.
 */
router.get("/profil", clientAuth, clientCon.profil);


/**
 * @swagger
 * /api/client/getAll:
 *   get:
 *     tags:
 *       - Client
 *     description: Retrieve a list of clients for an authenticated club.
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of clients
 *       '400':
 *         description: the club does not exist.
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
router.get("/getAll",clubM,clientCon.getAll);

/**
 *  @swagger
 *  /api/client/getById/:id:
 *    get:
 *      tags:
 *      - Client
 *      description: Affichage d'un client byId pour un club authentifié
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du client (obligatoire)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '403':
 *          description: the id is invalid
 *        '404':
 *          description: the client does not exist.
 *        '401':
 *          description: Unauthorized
 *        '500':
 *          description: server error
 */
router.get("/getById/:id",clubM, clientCon.getById);

/**
 *  @swagger
 *  /api/client/deleteById/:id:
 *    delete:
 *      tags:
 *      - Client
 *      description: Suppression d'un client
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du client (obligatoire)
 *      responses:
 *        '201':
 *          description: The client was deleted
 *        '404':
 *          description: the client does not exist
 *        '403':
 *          description: Invalid id.
 *        '401':
 *          description: Unauthorized
 *        '400':
 *          description: you are not allowed to remove a client from another club.
 *        '500':
 *          description: server error
 */
router.delete("/deleteById/:id", clubM, clientCon.deleteById);

/**
 *  @swagger
 *  /api/client/editeMyProfil:
 *    put:
 *      tags:
 *      - Client
 *      description: Modification de mon profil client
 *      parameters:
 *        - in : body
 *          name: client
 *          schema:
 *            type: object
 *            required:
 *              - password
 *              - confirmPassword
 *              - phoneNumber
 *              - image
 *            properties:
 *              phoneNumber:
 *                type: string
 *              image:
 *                type: string
 *              password:
 *                type: string
 *              confirmPassword:
 *                type: string
 *      responses:
 *        '201':
 *          description: your account has been modified
 *        '400':
 *          description: the password must have at least 6 characters
 *        '404':
 *          description: the new password and the new confirmation password are different
 *        '403':
 *          description: please modify at least one field. or not allow.
 *        '500':
 *          description: Server Error
 */
router.put("/editeMyProfil", clientAuth,upload.fields([{ name: 'image',maxCount:1 }]),clientCon.editeMyProfil);

/**
 *  @swagger
 *  /api/client/banned/:id:
 *    put:
 *      tags:
 *      - Client
 *      description: Bannir un client
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du client (obligatoire)
 *        - in : body
 *          name: client
 *          schema:
 *            type: object
 *            required:
 *              - argument
 *            properties:
 *              argument:
 *                type: string
 *      responses:
 *        '201':
 *          description: the client account is banned.
 *        '404':
 *          description: the client does not exist
 *        '403':
 *          description: Invalid id.
 *        '401':
 *          description: Unauthorized. or you are not allowed to banned a client from another club.
 *        '406':
 *          description: Client account is already banned!
 *        '400':
 *          description: The argument is empty.
 *        '500':
 *          description: Server Error
 */
router.put("/banned/:id", clubM, clientCon.banned);

/**
 *  @swagger
 *  /api/client/validated/:id:
 *    put:
 *      tags:
 *      - Client
 *      description: Valider un client
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du client (obligatoire)
 *      responses:
 *        '201':
 *          description: Client account is validated.
 *        '404':
 *          description: the client does not exist
 *        '403':
 *          description: Invalid id.
 *        '401':
 *          description: Unauthorized
 *        '400':
 *          description: you are not allowed to validated a client from another club
 *        '406':
 *          description: Client account is already validated!
 *        '500':
 *          description: Server Error
 */
router.put("/validated/:id", clubM, clientCon.validated);

/**
 *  @swagger
 *  /api/client/getPlayers/:name:
 *    get:
 *      tags:
 *      - Client
 *      description: Affichage des différents joueurs d'un seul club
 *      parameters:
 *        - in : params
 *          name: name
 *          schema:
 *            type: string
 *          description: Nom du club (obligatoire)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '401':
 *          description: the club does not exist
 *        '500':
 *          description: server error
 */
router.get("/getPlayers/:name",clientCon.getPlayers);

/**
 *  @swagger
 *  /api/client/getPlayersByPosition:
 *    get:
 *      tags:
 *      - Client
 *      description: Affichage des différents joueurs d'un seul club avec filtrage par position
 *      parameters:
 *        - in: query
 *          name: name
 *          schema:
 *            type: string
 *          description: Nom du club (obligatoire)
 *        - in: query
 *          name: position
 *          schema:
 *            type: string
 *            enum: ["goalkeeper", "midfielder", "defender", "attacker"]
 *          description: Position des joueurs (facultatif)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '400':
 *          description: Invalid position parameter.
 *        '401':
 *          description: the club does not exist
 *        '500':
 *          description: server error
 */
router.get("/getPlayersByPosition", clientCon.getPlayersByPosition);

/**
 *  @swagger
 *  /api/client/getPlayersByFullName:
 *    get:
 *      tags:
 *      - Client
 *      description: Affichage des différents joueurs d'un seul club avec filtrage par fullName
 *      parameters:
 *        - in: query
 *          name: name
 *          schema:
 *            type: string
 *          description: Nom du club (obligatoire)
 *        - in: query
 *          name: fullName
 *          schema:
 *            type: string
 *          description: Le fullName des joueurs (facultatif)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '401':
 *          description: the club does not exist
 *        '500':
 *          description: server error
 */
router.get("/getPlayersByFullName", clientCon.getPlayersByFullName);

/**
 *  @swagger
 *  /api/client/getPlayerById/:id:
 *    get:
 *      tags:
 *      - Client
 *      description: Affichage d'un joueur byId d'un seul club
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
 */
router.get("/getPlayerById/:id",  clientCon.getPlayerById);
/**
 *  @swagger
 *  /api/client/getMatchs/:name:
 *    get:
 *      tags:
 *      - Client
 *      description: Affichage des différents matchs d'un seul club avec des filtres de date de début et de fin facultatifs et une filtration par nameAdversary facultatif
 *      parameters:
 *        - in : params
 *          name: name
 *          schema:
 *            type: string
 *          description: Nom du club (obligatoire)
 *        - in: query
 *          name: startDate
 *          schema:
 *            type: string
 *          description: Start date in the format 'YYYY/MM/DD' (optional)
 *        - in: query
 *          name: endDate
 *          schema:
 *            type: string
 *          description: End date in the format 'YYYY/MM/DD' (optional)
 *        - in: query
 *          name: nameAdversary
 *          schema:
 *            type: string
 *          description: Filter with name adversary (optional)
 *      responses:
 *        '200':
 *          description: Successfully retrieved the list of matches
 *        '400':
 *          description: Invalid endDate or startDate format. Please use YYYY-MM-DD or YYYY/MM/DD
 *        '500':
 *          description: server error
 *        '401':
 *          description: the club does not exist
 */
router.get("/getMatchs/:name", clientCon.getMatchs);
/**
 *  @swagger
 *  /api/client/getMatchById/:id:
 *    get:
 *      tags:
 *      - Client
 *      description: Affichage d'un match byId d'un seul club
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
router.get("/getMatchById/:id", clientCon.getMatchById);
/**
 *  @swagger
 *  /api/client/getNews/:name:
 *    get:
 *      tags:
 *      - Client
 *      description: Affichage des différentes actualités d'un seul club
 *      parameters:
 *        - in : params
 *          name: name
 *          schema:
 *            type: string
 *          description: Nom du club (obligatoire)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '500':
 *          description: server error
 *        '401':
 *          description: the club does not exist
 */
router.get("/getNews/:name",clientCon.getNews);
/**
 *  @swagger
 *  /api/client/getNewsById/:id:
 *    get:
 *      tags:
 *      - Client
 *      description: Affichage d'une actualité byId d'un seul club
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du news (obligatoire)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '403':
 *          description: the id is invalid
 *        '404':
 *          description: the news does not exist
 *        '500':
 *          description: server error
 */
router.get("/getNewsById/:id", clientCon.getNewsById);
/**
 *  @swagger
 *  /api/client/getStaff/:name:
 *    get:
 *      tags:
 *      - Client
 *      description: Affichage des différents membres de staff d'un seul club
 *      parameters:
 *        - in : params
 *          name: name
 *          schema:
 *            type: string
 *          description: Nom du club (obligatoire)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '500':
 *          description: server error
 *        '401':
 *          description: the club does not exist
 */
router.get("/getStaff/:name",clientCon.getStaff);

/**
 *  @swagger
 *  /api/client/getStaffByFullName:
 *    get:
 *      tags:
 *      - Client
 *      description: Affichage des différents membres de staff d'un seul club avec filtrage par fullName
 *      parameters:
 *        - in: query
 *          name: name
 *          schema:
 *            type: string
 *          description: Nom du club (obligatoire)
 *        - in: query
 *          name: fullName
 *          schema:
 *            type: string
 *          description: Le fullName des membres de staff (facultatif)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '401':
 *          description: the club does not exist
 *        '500':
 *          description: server error
 */
router.get("/getStaffByFullName", clientCon.getStaffByFullName);

/**
 *  @swagger
 *  /api/client/getStaffById/:id:
 *    get:
 *      tags:
 *      - Client
 *      description: Affichage d'un membre de staff byId d'un seul club
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du staff (obligatoire)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '403':
 *          description: the id is invalid
 *        '404':
 *          description: the staff member does not exist
 *        '500':
 *          description: server error
 */
router.get("/getStaffById/:id", clientCon.getStaffById);

/**
 *  @swagger
 *  /api/client/getStadium/:name:
 *    get:
 *      tags:
 *      - Client
 *      description: Afficher l'historique de stade d'un club précis
 *      parameters:
 *        - in : params
 *          name: name
 *          schema:
 *            type: string
 *          description: Nom du club (obligatoire)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '500':
 *          description: server error
 *        '401':
 *          description: the club does not exist
 */
router.get("/getStadium/:name",clientCon.getStadium);

/**
 *  @swagger
 *  /api/client/getLive/:name:
 *    get:
 *      tags:
 *      - Client
 *      description: Affichage des différents live d'un seul club avec des filtres de date de début et de fin facultatifs 
 *      parameters:
 *        - in : params
 *          name: name
 *          schema:
 *            type: string
 *          description: Nom du club (obligatoire)
 *        - in: query
 *          name: startDate
 *          schema:
 *            type: string
 *          description: Start date in the format 'YYYY/MM/DD' (optional)
 *        - in: query
 *          name: endDate
 *          schema:
 *            type: string
 *          description: End date in the format 'YYYY/MM/DD' (optional)
 *      responses:
 *        '200':
 *          description: Successfully retrieved the list of live
 *        '400':
 *          description: Invalid endDate or startDate format. Please use YYYY-MM-DD or YYYY/MM/DD
 *        '500':
 *          description: server error
 *        '401':
 *          description: the club does not exist
 */
router.get("/getLive/:name", clientCon.getLive);

/**
 *  @swagger
 *  /api/client/getLiveById/:id:
 *    get:
 *      tags:
 *      - Client
 *      description: Affichage d'un live byId d'un seul club
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
router.get("/getLiveById/:id", clientCon.getLiveById);

/**
 *  @swagger
 *  /api/client/club/:clubName/joueur/:joueurId/getPlayerGoalNumberForClub:
 *    get:
 *      tags:
 *      - Client
 *      description: Affichage du nombre de buts d'un joueur pour un club
 *      parameters:
 *        - in : params
 *          name: joueurId
 *          schema:
 *            type: string
 *          description: Id du joueur (obligatoire)
 *        - in : params
 *          name: clubName
 *          schema:
 *            type: string
 *          description: Nom du club (obligatoire)
 *      responses:
 *        '200':
 *          description: Successful response with number of goals per player
 *        '403':
 *          description: the joueurId is invalid.
 *        '404':
 *          description: the player does not exist. or the club does not exist.
 *        '500':
 *          description: server error
 */
router.get("/club/:clubName/joueur/:joueurId/getPlayerGoalNumberForClub",  clientCon.getPlayerGoalNumberForClub);

/**
 *  @swagger
 *  /api/client/club/:clubName/getAllClubScorers:
 *    get:
 *      tags:
 *      - Client
 *      description: Affichage des buteurs(fullName + nombre de buts pour chaque joueurs) pour un club
 *      parameters:
 *        - in : params
 *          name: clubName
 *          schema:
 *            type: string
 *          description: Nom du club (obligatoire)
 *      responses:
 *        '200':
 *          description: Successful response with list of scorers
 *        '404':
 *          description: No players found for this club. or the club does not exist.
 *        '500':
 *          description: server error
 */
router.get("/club/:clubName/getAllClubScorers", clientCon.getAllClubScorers);

/**
 *  @swagger
 *  /api/client/club/:clubName/getAllPartner:
 *    get:
 *      tags:
 *      - Client
 *      description: Affichage des partenaires d'un club
 *      parameters:
 *        - in : params
 *          name: clubName
 *          schema:
 *            type: string
 *          description: nom du club (obligatoire)
 *      responses:
 *        '200':
 *          description: Successful response with list of partners
 *        '404':
 *          description: the club does not exist.
 *        '500':
 *          description: server error
 */
router.get("/club/:clubName/getAllPartner", clientCon.getAllPartner);

module.exports = router;
