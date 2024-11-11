import express from "express";
const router = express.Router();
const adminCon = require("../controlleurs/admin.controlleur");
const auth =require("../middleware/auth");

/**
 *  @swagger
 *  /api/admin/createAdmin:
 *    post:
 *      tags:
 *      - Admin
 *      description: l'enregistrement d'un nouveau admin
 *      parameters:
 *        - in : body
 *          name: soccer
 *          schema:
 *            type: object
 *            required:
 *              - lastName
 *              - firstName
 *              - email
 *              - password
 *              - confirmPassword
 *              - phoneNumber
 *            properties:
 *              lastName:
 *                type: string
 *              firstName:
 *                type: string
 *              email:
 *                type: string
 *              password:
 *                type: string
 *              confirmPassword:
 *                type: string
 *              phoneNumber:
 *                type: string
 *      responses:
 *        '201':
 *          description: Le compte est crée
 *        '400':
 *          description: le champ est vide ou format invalide
 *        '401':
 *          description: email existe déjà
 *        '403':
 *          description: non autoriser
 *        '404':
 *          description: le mot de passe et le mot de passe de confirmation sont diffirents
 */
router.post("/createAdmin",auth, adminCon.account);
/**
 *  @swagger
 *  /api/admin/updateMyAccount:
 *    put:
 *      tags:
 *      - Admin
 *      description: Modification de mon compte admin
 *      parameters:
 *        - in : body
 *          name: soccer
 *          schema:
 *            type: object
 *            required:
 *              - lastName
 *              - firstName
 *              - email
 *              - password
 *              - confirmPassword
 *              - phoneNumber
 *            properties:
 *              lastName:
 *                type: string
 *              firstName:
 *                type: string
 *              email:
 *                type: string
 *              password:
 *                type: string
 *              confirmPassword:
 *                type: string
 *              phoneNumber:
 *                type: string
 *      responses:
 *        '201':
 *          description: votre compte a était bien modifier
 *        '401':
 *          description: l'email existe déjà
 *        '400':
 *          description: l'email est invalide
 *        '403':
 *          description: -non autoriser or -veuillez modifier au moins un seul champ
 *        '404':
 *          description: le mot de passe et le mot de passe de confirmation sont diffirents
 */
router.put("/updateMyAccount", auth,adminCon.setAdmin);
module.exports = router;
