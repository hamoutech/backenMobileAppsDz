import express from "express";
const router = express.Router();
const clubCon = require("../controlleurs/clubManagment.controlleur");
const authClub =require("../middleware/clubManagment");
import upload from '../middleware/multer.video.image';

/**
 *  @swagger
 *  /api/clubManagement/register:
 *    post:
 *      tags:
 *      - ClubMangement
 *      description: l'enregistrement d'un nouveau club
 *      parameters:
 *        - in : body
 *          name: club
 *          schema:
 *            type: object
 *            required:
 *              - name
 *              - headName
 *              - email
 *              - description
 *              - image
 *              - phoneNumber
 *              - address
 *              - password
 *              - createdDate
 *            properties:
 *              name:
 *                type: string
 *              headName:
 *                type: string
 *              email:
 *                type: string
 *              description:
 *                type: string
 *              image:
 *                type: string
 *              phoneNumber:
 *                type: string
 *              address:
 *                type: string
 *              password:
 *                type: string
 *              createdDate:
 *                type: string
 *      responses:
 *        '201':
 *          description: The account is created
 *        '400':
 *          description: the field is empty or format is not respected
 *        '401':
 *          description: Club already exists
 *        '500':
 *          description: erreur de serveur
 */
router.post("/register", upload.fields([{ name: 'image',maxCount:1 }]),clubCon.register);
/**
 *  @swagger
 *  /api/clubManagement/login:
 *    post:
 *      tags:
 *      - ClubMangement
 *      description: la connexion d'un club
 *      parameters:
 *        - in : body
 *          name: club
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *      responses:
 *        '200':
 *          description: The club is connected
 *        '401':
 *          description: Connexion error
 *        '404':
 *          description: The club does not exist
 *        '400':
 *          description: the field is empty
 *        '501':
 *          description: Please wait for validation from administrators.
 *        '500':
 *          description: erreur de serveur
 */
router.post("/login", clubCon.login);
/**
 *  @swagger
 *  /api/clubManagement/profil:
 *    get:
 *      tags:
 *      - ClubMangement
 *      description: Affichage de mon profil club
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '500':
 *          description: erreur de serveur
 *        '501':
 *          description: not allow.
 */
router.get("/profil", authClub, clubCon.profil);
/**
 *  @swagger
 *  /api/clubManagement/editeMyAccount:
 *    put:
 *      tags:
 *      - ClubMangement
 *      description: Modification de mon compte club
 *      parameters:
 *        - in : body
 *          name: club
 *          schema:
 *            type: object
 *            required:
 *              - name
 *              - headName
 *              - email
 *              - description
 *              - address
 *              - phoneNumber
 *              - image
 *              - password
 *              - createdDate
 *              - modificationDate
 *            properties:
 *              name:
 *                type: string
 *              headName:
 *                type: string
 *              email:
 *                type: string
 *              description:
 *                type: string
 *              address:
 *                type: string
 *              phoneNumber:
 *                type: string
 *              image:
 *                type: string
 *              password:
 *                type: string
 *              createdDate:
 *                type: string
 *              modificationDate:
 *                type: string
 *      responses:
 *        '201':
 *          description: your account has been modified
 *        '401':
 *          description: 
 *            -the email already exists or
 *            -the name already exists
 *        '400':
 *          description: invalid email
 *        '403':
 *          description: 
 *            -the description must have at least 6 characters or
 *            -please modify at least one field
 *        '404':
 *          description: the password must contain at least one capital letter and a minimum length of 6 characters
 *        '500':
 *          description: erreur de serveur
 *        '501':
 *          description: not allow.
 */
router.put("/editeMyAccount", authClub,upload.fields([{ name: 'image',maxCount:1 }]),clubCon.editeMyAccount);

module.exports = router;