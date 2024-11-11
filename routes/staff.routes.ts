import express from "express";
const router = express.Router();
const staffCon = require("../controlleurs/staff.controlleur");
const clubM =require("../middleware/clubManagment");

/**
 *  @swagger
 *  /api/staff/createStaff:
 *    post:
 *      tags:
 *      - Staff
 *      description: la création d'un nouveau membre de staff
 *      parameters:
 *        - in : body
 *          name: staff
 *          schema:
 *            type: object
 *            required:
 *              - fullName
 *              - email
 *              - numberPhone
 *              - type
 *              - job
 *            properties:
 *              fullName:
 *                type: string
 *              email:
 *                type: string
 *              numberPhone:
 *                type: string
 *              type:
 *                type: string
 *              job:
 *                type: string
 *      responses:
 *        '201':
 *          description: The account is created
 *        '400':
 *          description: the field is empty or format is not respected
 *        '401':
 *          description: staff member already exists
 *        '403':
 *          description: Invalid type(staff type)
 *        '500':
 *          description: server error
 */
router.post("/createStaff",clubM, staffCon.register);
/**
 *  @swagger
 *  /api/staff/getAll:
 *    get:
 *      tags:
 *      - Staff
 *      description: Affichage des différents membres de staff
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '500':
 *          description: server error
 */
router.get("/getAll", clubM,staffCon.getAll);
/**
 *  @swagger
 *  /api/staff/getStaffById/:id:
 *    get:
 *      tags:
 *      - Staff
 *      description: Affichage d'un membre de staff byId
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
router.get("/getStaffById/:id", clubM, staffCon.getMember);
/**
 *  @swagger
 *  /api/staff/deleteStaffById/:id:
 *    delete:
 *      tags:
 *      - Staff
 *      description: Suppression d'un membre de staff
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du staff (obligatoire)
 *      responses:
 *        '201':
 *          description: The staff member was deleted
 *        '404':
 *          description: the staff member does not exist
 *        '403':
 *          description: the id is invalid
 *        '401':
 *          description: you are not allowed to remove a staff from another club
 *        '500':
 *          description: server error
 */
router.delete("/deleteStaffById/:id", clubM, staffCon.deleteMember);
/**
 *  @swagger
 *  /api/staff/deleteAll:
 *    delete:
 *      tags:
 *      - Staff
 *      description: Suppression de tout les membres de staff
 *      responses:
 *        '200':
 *          description: all staff members have been successfully deleted
 *        '500':
 *          description: server error
 */
router.delete("/deleteAll", clubM, staffCon.deleteAll);
/**
 *  @swagger
 *  /api/staff/updateStaff/:id:
 *    put:
 *      tags:
 *      - Staff
 *      description: Modification d'un membre de staff
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du staff (obligatoire)
 *        - in : body
 *          name: staff
 *          schema:
 *            type: object
 *            required:
 *              - fullName
 *              - email
 *              - numberPhone
 *              - type
 *              - job
 *            properties:
 *              fullName:
 *                type: string
 *              email:
 *                type: string
 *              numberPhone:
 *                type: string
 *              type:
 *                type: string
 *              job:
 *                type: string
 *      responses:
 *        '201':
 *          description: the staff member was modified
 *        '401':
 *          description: the email already exists
 *        '403':
 *          description: 
 *            -the id is invalid or
 *            -please modify at least one field
 *        '400':
 *          description: invalid email or Invalid type
 *        '404':
 *          description: the staff member does not exist 
 *        '406':
 *          description: you are not allowed to modify a staff from another club
 *        '500':
 *          description: server error
 */
router.put("/updateStaff/:id", clubM,staffCon.setMember);

/**
 *  @swagger
 *  /api/staff/getAllByFullName:
 *    get:
 *      tags:
 *      - Staff
 *      description: Affichage des différents membres de staff par leurs fullName
 *      parameters:
 *        - name: fullName
 *          in: query
 *          description: Filter staff by fullName (optional), Use this parameter to specify the staff's fullName
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '500':
 *          description: server error
 */
router.get("/getAllByFullName", clubM, staffCon.getAllByFullName);

module.exports = router;