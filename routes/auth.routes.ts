import express from "express";
const router = express.Router();
const authCon = require("../controlleurs/auth.controlleur");
const auth =require("../middleware/auth");

/**
 *  @swagger
 *  /api/auth/register:
 *    post:
 *      tags:
 *      - Auth
 *      description: l'enregistrement d'un nouveau utilisateur
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
 */
router.post("/register", authCon.register);
/**
 *  @swagger
 *  /api/auth/login:
 *    post:
 *      tags:
 *      - Auth
 *      description: la connexion d'un utilisateur
 *      parameters:
 *        - in : body
 *          name: soccer
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
 *          description: L'utilisateur est bien connecté
 *        '401':
 *          description: erreur de connexion
 *        '404':
 *          description: L'utilisateur n'éxiste pas
 *        '400':
 *          description: le champ est vide
 */
router.post("/login", authCon.login);

/**
 *  @swagger
 *  /api/auth/forget-password:
 *    put:
 *      tags:
 *      - Auth
 *      description: La modification de mot de passe oublié
 *      parameters:
 *        - in: body
 *          name: soccer
 *          schema:
 *            type: object
 *            required:
 *              - email
 *            properties:
 *              email:
 *                type: string
 *      responses:
 *        '200':
 *          description: Le lien de réinitialisation de mot de passe a était envoyer sur votre email
 *        '404':
 *          description: L'utilisateur n'éxiste pas
 *        '400':
 *          description: L'email n'as pas était envoyer
 */
router.put("/forget-password",  authCon.forgetPassword);

/**
 *  @swagger
 *  /api/auth/reset-password:
 *    put:
 *      tags:
 *      - Auth
 *      description: La modification de mot de passe oublié
 *      parameters:
 *        - in: body
 *          name: soccer
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
 *          description: votre mot de passe a était modifier correctement
 *        '403':
 *          description: resetLink est vide
 *        '404':
 *          description: L'utilisateur n'éxiste pas
 *        '400':
 *          description: le nouveau mot de passe et le nouveau mot de passe de confirmation sont diffirents
 *        '401':
 *          description: Le nouveau mot de passe est vide
 */
router.put("/reset-password", authCon.resetPassword);
/**
 *  @swagger
 *  /api/auth/create-code:
 *    post:
 *      tags:
 *      - Auth
 *      description: la creation est l'envoi d'un code de confirmation à la boite email de l'utilisateur
 *      parameters:
 *        - in : body
 *          name: soccer
 *          schema:
 *            type: object
 *            required:
 *              - email
 *            properties:
 *              email:
 *                type: string
 *      responses:
 *        '201':
 *          description: Le code de confirmation a était envoyer sur l'email de l'utilisateur
 *        '404':
 *          description: L'utilisateur n'éxiste pas
 */
router.post("/create-code", authCon.createCode);
/**
 *  @swagger
 *  /api/auth/verifier-email:
 *    post:
 *      tags:
 *      - Auth
 *      description: la vérification de l'email
 *      parameters:
 *        - in : body
 *          name: soccer
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - code
 *            properties:
 *              email:
 *                type: string
 *              code:
 *                type: string
 *      responses:
 *        '200':
 *          description: Votre email est valide
 *        '404':
 *          description: L'utilisateur n'éxiste pas
 *        '403':
 *          description: Le code de confirmation est faux , veuiller cliquer sur renvoyer à nouveau un autre code
 *        '400':
 *          description: Bad request
 */
router.put("/verifier-email",authCon.verifierEmail);
/**
 *  @swagger
 *  /api/auth/getUsers:
 *    get:
 *      tags:
 *      - Auth
 *      description: Affichage des différents utilisateurs
 *      responses:
 *        '200':
 *          description: Successfuly
 */
router.get("/getUsers", authCon.getUsers);
/**
 *  @swagger
 *  /api/auth/getUserById/:id:
 *    get:
 *      tags:
 *      - Auth
 *      description: Affichage d'un utilisateur byId
 *      parameters:
 *        - in : params
 *          name: soccer
 *          schema:
 *            type: object
 *            required:
 *              - id
 *            properties:
 *              id:
 *                type: Integer
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '403':
 *          description: l'id est invalide
 *        '404':
 *          description: l'utilisateur n'éxiste pas
 */
router.get("/getUserById/:id", auth, authCon.getUser);
/**
 *  @swagger
 *  /api/auth/profil:
 *    get:
 *      tags:
 *      - Auth
 *      description: Affichage de mon profil
 *      responses:
 *        '200':
 *          description: Successfuly
 */
router.get("/profil", auth, authCon.profil);
module.exports = router;
