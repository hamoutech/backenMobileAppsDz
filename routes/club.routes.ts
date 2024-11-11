import express from "express";
const router = express.Router();
const clubCon = require("../controlleurs/club.controlleur");
const auth =require("../middleware/auth");
import upload from '../middleware/multer.video.image';

/**
 *  @swagger
 *  /api/club/createClub:
 *    post:
 *      tags:
 *      - Club
 *      description: la création d'un nouveau club par l'admin
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
 *          description: Le compte est crée
 *        '400':
 *          description: le champ est vide ou format non respecté
 *        '401':
 *          description: Club existe déjà
 *        '501':
 *          description: non autoriser
 */
router.post("/createClub",auth, upload.fields([{ name: 'image',maxCount:1 }]),clubCon.register);
/**
 *  @swagger
 *  /api/club/getClubs:
 *    get:
 *      tags:
 *      - Club
 *      description: Affichage des différents clubs
 *      responses:
 *        '200':
 *          description: Successfuly
 */
router.get("/getClubs", clubCon.getClubs);
/**
 *  @swagger
 *  /api/club/getClubById/:id:
 *    get:
 *      tags:
 *      - Club
 *      description: Affichage d'un club byId
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du club (obligatoire)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '403':
 *          description: l'id est invalide
 *        '404':
 *          description: le club n'éxiste pas
 *        '501':
 *          description: non autoriser
 */
router.get("/getClubById/:id", auth, clubCon.getClub);
/**
 *  @swagger
 *  /api/club/deleteClubById/:id:
 *    delete:
 *      tags:
 *      - Club
 *      description: Suppression d'un club
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du club (obligatoire)
 *      responses:
 *        '201':
 *          description: Le club a était supprimer
 *        '404':
 *          description: Le club n'éxiste pas
 *        '403':
 *          description: le id est invalide
 *        '501':
 *          description: non autoriser
 */
router.delete("/deleteClubById/:id", auth, clubCon.deleteClub);
/**
 *  @swagger
 *  /api/club/deleteAll:
 *    delete:
 *      tags:
 *      - Club
 *      description: Suppression de tout les Clubs
 *      responses:
 *        '200':
 *          description: delete all clubs successfully
 *        '501':
 *          description: non autoriser
 */
router.delete("/deleteAll", auth, clubCon.deleteClubs);
/**
 *  @swagger
 *  /api/club/updateClub/:id:
 *    put:
 *      tags:
 *      - Club
 *      description: Modification d'un club
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
 *              createdDate:
 *                type: string
 *              modificationDate:
 *                type: string
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du club (obligatoire)
 *      responses:
 *        '201':
 *          description: Le club a était bien modifier
 *        '404':
 *          description: Le club n'éxiste pas
 *        '401':
 *          description:
 *            -le nom de club existe déjà or
 *            -email existe
 *        '400':
 *          description:
 *            -la discription doit avoir au moins 6 caractères or
 *            -email invalide
 *        '403':
 *          description: 
 *            -le id est invalide or
 *            -veuillez modifier au moins un seul champ
 *        '501':
 *          description: non autoriser
 */
router.put("/updateClub/:id", auth,upload.fields([{ name: 'image',maxCount:1 }]),clubCon.setClub);
/**
 *  @swagger
 *  /api/club/banned/:id:
 *    put:
 *      tags:
 *      - Club
 *      description: Bannir un club
 *      parameters:
 *        - in : body
 *          name: club
 *          schema:
 *            type: object
 *            required:
 *              - argument
 *            properties:
 *              argument:
 *                type: string
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du club (obligatoire)
 *      responses:
 *        '201':
 *          description: Le club a était banni
 *        '404':
 *          description: Club n'éxiste pas
 *        '403':
 *          description: le id est invalide
 *        '400':
 *          description: le champ est vide
 *        '501':
 *          description: non autoriser
 */
router.put("/banned/:id", auth, clubCon.bannirClub);
/**
 *  @swagger
 *  /api/club/validated/:id:
 *    put:
 *      tags:
 *      - Club
 *      description: Valider un club
 *      parameters:
 *        - in : body
 *          name: club
 *          schema:
 *            type: object
 *            required:
 *              - argument
 *            properties:
 *              argument:
 *                type: string
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du club (obligatoire)
 *      responses:
 *        '201':
 *          description: Le club a était validé
 *        '404':
 *          description: Club n'éxiste pas
 *        '403':
 *          description: le id est invalide
 *        '400':
 *          description: le champ est vide
 *        '501':
 *          description: non autoriser
 */
router.put("/validated/:id", auth, clubCon.validerClub);
module.exports = router;