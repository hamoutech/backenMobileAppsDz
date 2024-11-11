import express from "express";
const router = express.Router();
const notifcontrolleur = require("../controlleurs/PushNotif.controlleur") ;



/**
 *  @swagger
 *  /api/notif/savetoken:
 *    post:
 *      tags:
 *      - notification
 *      description: enregistrer un nouveau expotoken 
 *      parameters:
 *        - in : body
 *          name: notification
 *          schema:
 *            type: object
 *            required:
 *              - token
 *            properties:
 *              token:
 *                type: string
 *            example:
 *             token: ExponentPushToken[fBfMYGHOAdyOYU2OgSlZiI]
 *      responses:
 *        '201':
 *          description: The notification is saved
 *        '400':
 *          description: the field is empty or format is not respected
 *        '401':
 *          description: the token exist already
 *        '500':
 *          description: server error
 */
router.post("/savetoken",notifcontrolleur.registertoken);
/**
 *  @swagger
 *  /api/notif/savetokenbyid:
 *    post:
 *      tags:
 *      - notification
 *      description: enregistrer un nouveau user avec userid et expotoken 
 *      parameters:
 *        - in : body
 *          name: notification
 *          schema:
 *            type: object
 *            required:
 *              - token
 *              - userid
 *            properties:
 *              token:
 *                type: string
 *              userid:
 *                type: string
 *            example:
 *             token: ExponentPushToken[fBfMYGHOAdyOYU2OgSlZiI]
 *             userid : "0002"
 *      responses:
 *        '201':
 *          description: The notification is saved
 *        '400':
 *          description: the field is empty or format is not respected
 *        '500':
 *          description: server error
 */
router.post("/savetokenbyid",notifcontrolleur.registertokenbyid);
/**
 *  @swagger
 *  /api/notif/pushnotif/id:
 *    post:
 *      tags:
 *      - notification
 *      description: Envoyer une nouvelle notification avec userid ,pour le moment il faut ajoute un url dans data pour "url":"matche"(!le continue de data must be in json format) redirect vers screen team et toute autre valeur redirect ver home news
 *      parameters:
 *        - in : body
 *          name: notification
 *          schema:
 *            type: object
 *            required:
 *              - userid
 *              - title
 *              - notifbody
 *              - notifdata
 *            properties:
 *              userid:
 *                type: string
 *              title:
 *                type: string
 *              notifbody:
 *                type: string
 *              notifdata:
 *                type: object
 *            example:
 *             title: test title
 *             userid: "0001"
 *             notifbody: jsk-mca 0-0
 *             notifdata: {"url":"matche"}
 *      responses:
 *        '200':
 *          description: The notification is sent
 *        '400':
 *          description: the field is empty or format is not respected
 *        '401':
 *          description: uesr token not found
 *        '500':
 *          description: server error
 */
router.post("/pushnotif/id",notifcontrolleur.pushnotifID);
/**
 *  @swagger
 *  /api/notif/pushnotif/token:
 *    post:
 *      tags:
 *      - notification
 *      description: Envoyer une nouvelle notification avec token ,pour le moment il faut ajoute un url dans data pour "url":"matche"(!le continue de data must be in json format)  redirect vers screen team et toute autre valeur redirect ver home news
 *      parameters:
 *        - in : body
 *          name: notification
 *          schema:
 *            type: object
 *            required:
 *              - token
 *              - title
 *              - notifbody
 *              - notifdata
 *            properties:
 *              token:
 *                type: string
 *              title:
 *                type: string
 *              notifbody:
 *                type: string
 *              notifdata:
 *                type: object
 *            example:
 *             title: test title
 *             token: ExponentPushToken[fBfMYGHOAdyOYU2OgSlZiI]
 *             notifbody: jsk-mca 0-0
 *             notifdata: {"url":"matche"}
 *      responses:
 *        '200':
 *          description: The notification is sent
 *        '400':
 *          description: the field is empty or format is not respected
 *        '500':
 *          description: server error
 */

router.post("/pushnotif/token",notifcontrolleur.pushnotiftoken);

/**
 *  @swagger
 *  /api/notif/pushnotif:
 *    post:
 *      tags:
 *      - notification
 *      description: Envoyer une nouvelle notification vers tous les  tokens ,pour le moment il faut ajoute un url dans data pour "url":"matche"(!le continue de data must be in json format)  redirect vers screen team et toute autre valeur redirect ver home news
 *      parameters:
 *        - in : body
 *          name: notification
 *          schema:
 *            type: object
 *            required:
 *              - title
 *              - notifbody
 *              - notifdata
 *            properties:
 *              title:
 *                type: string
 *              notifbody:
 *                type: string
 *              notifdata:
 *                type: object
 *            example:
 *             title: test title
 *             notifbody: jsk-mca 0-0
 *             notifdata: {"url":"matche"}
 *      responses:
 *        '200':
 *          description: The notification is sent
 *        '400':
 *          description: the field is empty or format is not respected
 *        '401':
 *          description: no token was found to push the notification
 *        '500':
 *          description: server error
 */
router.post("/pushnotif",notifcontrolleur.pushnotif);

module.exports = router;