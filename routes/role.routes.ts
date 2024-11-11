import express from "express";
const router = express.Router();
const roleCon = require("../controlleurs/role.controlleur");
const clubM = require("../middleware/clubManagment");
/**
 *  @swagger
 *  /api/role/createRole:
 *    post:
 *      tags:
 *      - Role
 *      description: la création d'une nouveau partenaire
 *      parameters:
 *        - in : body
 *          name: role
 *          schema:
 *            type: object
 *            required:
 *              - companyName
 *              - RC
 *              - image
 *              - phoneNumber
 *              - email
 *            properties:
 *              companyName:
 *                type: string
 *              RC:
 *                type: string
 *              image:
 *                type: string
 *              phoneNumber:
 *                type: string
 *              email:
 *                type: string
 *      responses:
 *        '201':
 *          description: The role is created
 *        '400':
 *          description: the field is empty or format is not respected
 *        '401':
 *          description: role already exists
 *        '500':
 *          description: server error
 */
router.post("/createRole", clubM, roleCon.register);
/**
 *  @swagger
 *  /api/role/getAll:
 *    get:
 *      tags:
 *      - Role
 *      description: Affichage des différentes partenaires
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '500':
 *          description: server error
 */
router.get("/getAll", clubM, roleCon.getAll);
/**
 *  @swagger
 *  /api/role/getRoleById/:id:
 *    get:
 *      tags:
 *      - Role
 *      description: Affichage d'une partenaire byId
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du role (obligatoire)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '403':
 *          description: the id is invalid
 *        '404':
 *          description: the role does not exist
 *        '500':
 *          description: server error
 */
router.get("/getRoleById/:id", clubM, roleCon.getRole);
/**
 *  @swagger
 *  /api/role/deleteRoleById/:id:
 *    delete:
 *      tags:
 *      - Role
 *      description: Suppression d'un partenaire byId
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du role (obligatoire)
 *      responses:
 *        '201':
 *          description: The role was deleted
 *        '404':
 *          description: the role does not exist
 *        '403':
 *          description: the id is invalid
 *        '401':
 *          description: you are not allowed to remove a role from another club
 *        '500':
 *          description: server error
 */
router.delete("/deleteRoleById/:id", clubM, roleCon.deleteRole);
module.exports = router;
