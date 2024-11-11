import express from "express";
const router = express.Router();
const agentCon = require("../controlleurs/agent.controlleur");
const clientAuth =require("../middleware/clientAuth");
const clubM =require("../middleware/clubManagment");
import upload from '../middleware/multer.video.image';

/**
 *  @swagger
 *  /api/agent/create:
 *    post:
 *      tags:
 *      - Agent
 *      description: la création d'un nouveau compte agent
 *      parameters:
 *        - in : body
 *          name: agent
 *          schema:
 *            type: object
 *            required:
 *              - fullName
 *              - birthDate
 *              - identityCardNumber
 *              - email
 *              - password
 *              - confirmPassword
 *              - phoneNumber
 *              - image
 *              - handicap
 *            properties:
 *              fullName:
 *                type: string
 *              birthDate:
 *                type: string
 *              identityCardNumber:
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
 *              handicap:
 *                type: Boolean
 *      responses:
 *        '201':
 *          description: The agent account is created
 *        '400':
 *          description: the field is empty. or incorrect format.
 *        '401':
 *          description: Agent with this email already exists. or Agent with this phoneNumber already exists. or Unauthorized.
 *        '404':
 *          description: the password and the confirmation password are different
 *        '500':
 *          description: Server Error
 *        '501':
 *          description: Field type is unexpected
 */
router.post("/create",clubM,upload.fields([{ name: 'image',maxCount:1 }]),agentCon.create);

/**
 *  @swagger
 *  /api/agent/login:
 *    post:
 *      tags:
 *      - Agent
 *      description: la connexion d'un agent
 *      parameters:
 *        - in : body
 *          name: agent
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *              - phoneNumber
 *              - clubName
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *              phoneNumber:
 *                type: string
 *              clubName:
 *                type: string
 *      responses:
 *        '200':
 *          description: the agent is well connected
 *        '401':
 *          description: Incorrect password
 *        '404':
 *          description: The agent does not exist
 *        '400':
 *          description: the field is empty
 *        '403':
 *          description: You are not authorized, please contact the club administrators!
 *        '500':
 *          description: Server Error
 */
router.post("/login", agentCon.login);

/**
 *  @swagger
 *  /api/agent/forget-password:
 *    put:
 *      tags:
 *      - Agent
 *      description: L'envoi de lien de réinitialisation pour le mot de passe oublié
 *      parameters:
 *        - in: body
 *          name: agent
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
 *          description: The agent does not exist.
 *        '400':
 *          description: The field is empty. or The email was not sent.
 *        '500':
 *          description: Server Error
 */
router.put("/forget-password",  agentCon.forgetPassword);

/**
 *  @swagger
 *  /api/agent/reset-password:
 *    put:
 *      tags:
 *      - Agent
 *      description: La modification de mot de passe oublié
 *      parameters:
 *        - in: body
 *          name: agent
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
 *          description: Your password was changed correctly
 *        '404':
 *          description: The agent does not exist
 *        '400':
 *          description: the new password and the new confirmation password are different
 *        '401':
 *          description: The field is empty
 *        '500':
 *          description: Server Error
 */
router.put("/reset-password", agentCon.resetPassword);

/**
 *  @swagger
 *  /api/agent/profil:
 *    get:
 *      tags:
 *      - Agent
 *      description: Affichage de mon profil
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '500':
 *          description: Server Error
 *        '401':
 *          description: Unauthorized
 */
router.get("/profil", clientAuth, agentCon.profil);


/**
 * @swagger
 * /api/agent/getAll:
 *   get:
 *     tags:
 *       - Agent
 *     description: Retrieve a list of agents for an authenticated club.
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of agents
 *       '400':
 *         description: the club does not exist.
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
router.get("/getAll",clubM,agentCon.getAll);

/**
 *  @swagger
 *  /api/agent/getById/:id:
 *    get:
 *      tags:
 *      - Agent
 *      description: Affichage d'un agent byId pour un club authentifié
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du agent (obligatoire)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '403':
 *          description: the id is invalid
 *        '404':
 *          description: the agent does not exist.
 *        '401':
 *          description: Unauthorized
 *        '500':
 *          description: server error
 */
router.get("/getById/:id",clubM, agentCon.getById);

/**
 *  @swagger
 *  /api/agent/deleteById/:id:
 *    delete:
 *      tags:
 *      - Agent
 *      description: Suppression d'un agent
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du agent (obligatoire)
 *      responses:
 *        '201':
 *          description: The agent was deleted
 *        '404':
 *          description: the agent does not exist
 *        '403':
 *          description: Invalid id.
 *        '401':
 *          description: Unauthorized.
 *        '400':
 *          description: you are not allowed to remove a agent from another club.
 *        '500':
 *          description: server error
 */
router.delete("/deleteById/:id", clubM, agentCon.deleteById);

/**
 *  @swagger
 *  /api/agent/editeMyProfil:
 *    put:
 *      tags:
 *      - Agent
 *      description: Modification de mon profil agent
 *      parameters:
 *        - in : body
 *          name: agent
 *          schema:
 *            type: object
 *            required:
 *              - fullName
 *              - birthDate
 *              - identityCardNumber
 *              - email
 *              - password
 *              - confirmPassword
 *              - phoneNumber
 *              - image
 *            properties:
 *              fullName:
 *                type: string
 *              birthDate:
 *                type: string
 *              identityCardNumber:
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
 *      responses:
 *        '201':
 *          description: Your account has been modified
 *        '400':
 *          description: the password must have at least 6 characters. or Invalid birthDate format.
 *        '404':
 *          description: the new password and the new confirmation password are different
 *        '403':
 *          description: please modify at least one field.
 *        '401':
 *          description: Unauthorized. or This email already exists. or This phoneNumber already exists.
 *        '500':
 *          description: Server Error
 */
router.put("/editeMyProfil", clientAuth,upload.fields([{ name: 'image',maxCount:1 }]),agentCon.editeMyProfil);

/**
 *  @swagger
 *  /api/agent/banned/:id:
 *    put:
 *      tags:
 *      - Agent
 *      description: Bannir un agent
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du agent (obligatoire)
 *        - in : body
 *          name: agent
 *          schema:
 *            type: object
 *            required:
 *              - argument
 *            properties:
 *              argument:
 *                type: string
 *      responses:
 *        '201':
 *          description: the agent account is banned.
 *        '404':
 *          description: the agent does not exist
 *        '403':
 *          description: Invalid id.
 *        '401':
 *          description: Unauthorized. or you are not allowed to banned an agent from another club.
 *        '406':
 *          description: Agent account is already banned!
 *        '400':
 *          description: The argument is empty.
 *        '500':
 *          description: Server Error
 */
router.put("/banned/:id", clubM, agentCon.banned);

/**
 *  @swagger
 *  /api/agent/validated/:id:
 *    put:
 *      tags:
 *      - Agent
 *      description: Valider un agent
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du agent (obligatoire)
 *      responses:
 *        '201':
 *          description: Agent account is validated.
 *        '404':
 *          description: the agent does not exist
 *        '403':
 *          description: Invalid id.
 *        '401':
 *          description: Unauthorized
 *        '400':
 *          description: you are not allowed to validated an agent from another club
 *        '406':
 *          description: Agent account is already validated!
 *        '500':
 *          description: Server Error
 */
router.put("/validated/:id", clubM, agentCon.validated);

module.exports = router;
