import express from "express";
const router = express.Router();
const partnerCon = require("../controlleurs/partner.controlleur");
const clubM = require("../middleware/clubManagment");
import upload from "../middleware/multer.video.image";
/**
 *  @swagger
 *  /api/partner/createPartner:
 *    post:
 *      tags:
 *      - Partner
 *      description: la création d'une nouveau partenaire
 *      parameters:
 *        - in : body
 *          name: partner
 *          schema:
 *            type: object
 *            required:
 *              - companyName
 *              - RC
 *              - description
 *              - image
 *              - phoneNumber
 *              - email
 *            properties:
 *              companyName:
 *                type: string
 *              RC:
 *                type: string
 *              description:
 *                type: string
 *              image:
 *                type: string
 *              phoneNumber:
 *                type: string
 *              email:
 *                type: string
 *      responses:
 *        '201':
 *          description: The partner is created
 *        '400':
 *          description: the field is empty or format is not respected
 *        '401':
 *          description: partner already exists
 *        '500':
 *          description: server error
 */
router.post("/createPartner",clubM,upload.fields([{ name: "image", maxCount: 1 }]),partnerCon.create);

/**
 *  @swagger
 *  /api/partner/club/:clubName/register:
 *    post:
 *      tags:
 *      - Partner
 *      description: l'inscription d'un nouvel partenaire
 *      parameters:
 *        - in : params
 *          name: clubName
 *          schema:
 *            type: string
 *          description: Nom du club (obligatoire)
 *        - in : body
 *          name: partner
 *          schema:
 *            type: object
 *            required:
 *              - companyName
 *              - RC
 *              - description
 *              - image
 *              - phoneNumber
 *              - email
 *            properties:
 *              companyName:
 *                type: string
 *              RC:
 *                type: string
 *              description:
 *                type: string
 *              image:
 *                type: string
 *              phoneNumber:
 *                type: string
 *              email:
 *                type: string
 *      responses:
 *        '201':
 *          description: The partner is created
 *        '400':
 *          description: the field is empty. or format is not respected.
 *        '404':
 *          description: the club does not exist.
 *        '401':
 *          description: partner already exists.
 *        '500':
 *          description: server error
 */
router.post("/club/:clubName/register",upload.fields([{ name: "image", maxCount: 1 }]),partnerCon.register);

/**
 *  @swagger
 *  /api/partner/getAll:
 *    get:
 *      tags:
 *      - Partner
 *      description: Affichage des différentes partenaires d'un club
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '500':
 *          description: server error
 */
router.get("/getAll", clubM, partnerCon.getAll);
/**
 *  @swagger
 *  /api/partner/getPartnerById/:id:
 *    get:
 *      tags:
 *      - Partner
 *      description: Affichage d'un partenaire byId d'un club
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du partner (obligatoire)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '403':
 *          description: the id is invalid
 *        '404':
 *          description: the partner does not exist
 *        '500':
 *          description: server error
 */
router.get("/getPartnerById/:id", clubM, partnerCon.getPartner);
/**
 *  @swagger
 *  /api/partner/deletePartnerById/:id:
 *    delete:
 *      tags:
 *      - Partner
 *      description: Suppression d'un partenaire byId
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du partner (obligatoire)
 *      responses:
 *        '201':
 *          description: The partner was deleted
 *        '404':
 *          description: the partner does not exist
 *        '403':
 *          description: the id is invalid
 *        '401':
 *          description: you are not allowed to remove a partner from another club
 *        '500':
 *          description: server error
 */
router.delete("/deletePartnerById/:id", clubM, partnerCon.deletePartner);
/**
 *  @swagger
 *  /api/partner/deleteAll:
 *    delete:
 *      tags:
 *      - Partner
 *      description: Suppression de toutes les partenaires
 *      responses:
 *        '200':
 *          description: all partner have been successfully deleted
 *        '500':
 *          description: server error
 */
router.delete("/deleteAll", clubM, partnerCon.deleteAll);
/**
 *  @swagger
 *  /api/partner/updatePartner/:id:
 *    put:
 *      tags:
 *      - Partner
 *      description: Modification d'un partenaire
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du partner (obligatoire)
 *        - in : body
 *          name: partner
 *          schema:
 *            type: object
 *            required:
 *              - companyName
 *              - RC
 *              - description
 *              - image
 *              - phoneNumber
 *              - email
 *            properties:
 *              companyName:
 *                type: string
 *              RC:
 *                type: string
 *              description:
 *                type: string
 *              image:
 *                type: string
 *              phoneNumber:
 *                type: string
 *              email:
 *                type: string
 *      responses:
 *        '201':
 *          description: the partner was modified
 *        '400':
 *          description: the companyName already exists
 *        '403':
 *          description:
 *            -the id is invalid or
 *            -please modify at least one field
 *        '404':
 *          description: the partner does not exist
 *        '406':
 *          description: you are not allowed to modify a partner from another club
 *        '500':
 *          description: server error
 */
router.put( "/updatePartner/:id",clubM,upload.fields([{ name: "image", maxCount: 1 }]),partnerCon.setPartner);

/**
 *  @swagger
 *  /api/partner/refused/:id:
 *    put:
 *      tags:
 *      - Partner
 *      description: Refuser un partner
 *      parameters:
 *        - in : body
 *          name: partner
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
 *          description: Id du partner (obligatoire)
 *      responses:
 *        '201':
 *          description: Le partner a était refusé
 *        '404':
 *          description: partner n'éxiste pas
 *        '403':
 *          description: le id est invalide
 *        '400':
 *          description: le champ est vide
 *        '501':
 *          description: non autoriser
 */
router.put("/refused/:id", clubM, partnerCon.refuserPartner);

/**
 *  @swagger
 *  /api/partner/validated/:id:
 *    put:
 *      tags:
 *      - Partner
 *      description: Valider un partner
 *      parameters:
 *        - in : body
 *          name: partner
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
 *          description: Id du partner (obligatoire)
 *      responses:
 *        '201':
 *          description: Le partner a était validé
 *        '404':
 *          description: partner n'éxiste pas
 *        '403':
 *          description: le id est invalide
 *        '400':
 *          description: le champ est vide
 *        '501':
 *          description: non autoriser
 */
router.put("/validated/:id", clubM, partnerCon.validerPartner);

module.exports = router;