import express from "express";
const router = express.Router();
const stadiumCon = require("../controlleurs/stadium.controlleur");
const clubM = require("../middleware/clubManagment");
import upload from "../middleware/multer.video.image";
/**
 *  @swagger
 *  /api/stadium/createStadium:
 *    post:
 *      tags:
 *      - Stadium
 *      description: la création d'un nouveau stade
 *      parameters:
 *        - in : body
 *          name: stadium
 *          schema:
 *            type: object
 *            required:
 *              - stadiumName
 *              - location
 *              - stadiumCapacity
 *              - gps
 *              - stadiumFieldSize
 *              - stadiumImage
 *              - architect
 *              - totalSurface
 *              - builder
 *              - tenant
 *              - description
 *            properties:
 *              location:
 *                type: string
 *              stadiumName:
 *                type: string
 *              stadiumCapacity:
 *                type: string
 *              gps:
 *                type: string
 *              stadiumFieldSize:
 *                type: string
 *              stadiumImage:
 *                type: number
 *              architect:
 *                type: string
 *              totalSurface:
 *                type: string
 *              builder:
 *                type: string
 *              tenant:
 *                type: string
 *              description:
 *                type: string
 *      responses:
 *        '201':
 *          description: The stadium is created
 *        '403':
 *          description: you cannot create a second stadium per club
 *        '400':
 *          description: the field is empty or format is not respected
 *        '401':
 *          description: stadium already exists
 *        '500':
 *          description: server error
 */
router.post(
  "/createStadium",
  clubM,
  upload.fields([{ name: "stadiumImage", maxCount: 1 }]),
  stadiumCon.createStadium
);
/**
 *  @swagger
 *  /api/stadium/getStadium:
 *    get:
 *      tags:
 *      - Stadium
 *      description: Afficher l'historique de mon stade
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '500':
 *          description: server error
 */
router.get("/getStadium", clubM, stadiumCon.getStadium);

/**
 *  @swagger
 *  /api/stadium/updateStadium:
 *    put:
 *      tags:
 *      - Stadium
 *      description: Modification de mon propre stade
 *      parameters:
 *        - in : body
 *          name: stadium
 *          schema:
 *            type: object
 *            required:
 *              - stadiumName
 *              - location
 *              - stadiumCapacity
 *              - gps
 *              - stadiumFieldSize
 *              - stadiumImage
 *              - architect
 *              - totalSurface
 *              - builder
 *              - tenant
 *              - description
 *            properties:
 *              location:
 *                type: string
 *              stadiumName:
 *                type: string
 *              stadiumCapacity:
 *                type: string
 *              gps:
 *                type: string
 *              stadiumFieldSize:
 *                type: string
 *              stadiumImage:
 *                type: number
 *              architect:
 *                type: string
 *              totalSurface:
 *                type: string
 *              builder:
 *                type: string
 *              tenant:
 *                type: string
 *              description:
 *                type: string
 *      responses:
 *        '201':
 *          description: the stadium was modified
 *        '401':
 *          description: the description must have at least 80 characters
 *        '404':
 *          description: The club does not yet have a stadium in its name
 *        '403':
 *          description: please modify at least one field
 *        '400':
 *          description: the stadiumName already exists
 *        '500':
 *          description: server error
 */
router.put(
  "/updateStadium",
  clubM,
  upload.fields([{ name: "stadiumImage", maxCount: 1 }]),
  stadiumCon.updateStadium
);
module.exports = router;
