import express from "express";
const router = express.Router();
const newsCon = require("../controlleurs/news.controlleur");
const clubM = require("../middleware/clubManagment");
import upload from "../middleware/multer.video.image";
/**
 *  @swagger
 *  /api/news/createNews:
 *    post:
 *      tags:
 *      - News
 *      description: la création d'une nouvelle actualité
 *      parameters:
 *        - in : body
 *          name: news
 *          schema:
 *            type: object
 *            required:
 *              - articleTitle
 *              - articleTitleArab
 *              - image
 *              - video
 *              - link
 *              - description
 *              - description_arab
 *              - createdDate
 *              - notifBody
 *              - notifTitle
 *              - displayNotif
 *              - language
 *            properties:
 *              articleTitle:
 *                type: string
 *              description:
 *                type: string
 *              image:
 *                type: string
 *              video:
 *                type: string
 *              link:
 *                type: string
 *              createdDate:
 *                type: string
 *              notifBody:
 *                type: string
 *              displayNotif:
 *                type: boolean
 *              notifTitle:
 *                type: string
 *              language:
 *                type: array
 *                items:
 *                  type: string
 *                  enum: 
 *                    - fr
 *                    - arb
 *      responses:
 *        '201':
 *          description: The news is created
 *        '400':
 *          description: the field is empty or format is not respected. or Invalid language.
 *        '401':
 *          description: news already exists
 *        '404':
 *          description: Mismatched language. or The createdDate cannot be in the past.
 *        '500':
 *          description: server error
 */
router.post(
  "/createNews",
  clubM,
  upload.fields([{ name: "image", maxCount: 1 }]),
  newsCon.register
);
/**
 *  @swagger
 *  /api/news/getAll:
 *    get:
 *      tags:
 *      - News
 *      description: Affichage des différentes actualités
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '500':
 *          description: server error
 */
router.get("/getAll", clubM, newsCon.getAll);
/**
 *  @swagger
 *  /api/news/getNewsById/:id:
 *    get:
 *      tags:
 *      - News
 *      description: Affichage d'une actualité byId
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du news (obligatoire)
 *      responses:
 *        '200':
 *          description: Successfuly
 *        '403':
 *          description: the id is invalid
 *        '404':
 *          description: the news does not exist
 *        '500':
 *          description: server error
 */
router.get("/getNewsById/:id", clubM, newsCon.getNews);
/**
 *  @swagger
 *  /api/news/deleteNewsById/:id:
 *    delete:
 *      tags:
 *      - News
 *      description: Suppression d'une actualité byId
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du news (obligatoire)
 *      responses:
 *        '201':
 *          description: The news was deleted
 *        '404':
 *          description: the news does not exist
 *        '403':
 *          description: the id is invalid
 *        '401':
 *          description: you are not allowed to remove a news from another club
 *        '500':
 *          description: server error
 */
router.delete("/deleteNewsById/:id", clubM, newsCon.deleteNews);
/**
 *  @swagger
 *  /api/news/deleteAll:
 *    delete:
 *      tags:
 *      - News
 *      description: Suppression de toutes les actualités
 *      responses:
 *        '200':
 *          description: all news have been successfully deleted
 *        '500':
 *          description: server error
 */
router.delete("/deleteAll", clubM, newsCon.deleteAll);
/**
 *  @swagger
 *  /api/news/updateNews/:id:
 *    put:
 *      tags:
 *      - News
 *      description: Modification d'une actualité
 *      parameters:
 *        - in : params
 *          name: id
 *          schema:
 *            type: string
 *          description: Id du news (obligatoire)
 *        - in : body
 *          name: news
 *          schema:
 *            type: object
 *            required:
 *              - articleTitle
 *              - articleTitleArab
 *              - description
 *              - description_arab
 *              - image
 *              - video
 *              - link
 *              - notifBody
 *              - notifTitle
 *              - displayNotif
 *              - createdDate
 *              - modificationDate
 *              - language
 *            properties:
 *              articleTitle:
 *                type: string
 *              description:
 *                type: string
 *              image:
 *                type: string
 *              video:
 *                type: string
 *              link:
 *                type: string
 *              createdDate:
 *                type: string
 *              modificationDate:
 *                type: string
 *              notifBody:
 *                type: string
 *              displayNotif:
 *                type: boolean
 *              notifTitle:
 *                type: string
 *              language:
 *                type: array
 *                items:
 *                  type: string
 *                  enum: 
 *                    - fr
 *                    - arb
 *      responses:
 *        '201':
 *          description: the news was modified
 *        '400':
 *          description: the articleTitle already exists. or Invalid date format. or Invalid language. or the field is empty.
 *        '403':
 *          description:
 *            -the id is invalid or
 *            -please modify at least one field
 *        '401':
 *          description: the description must have at least 6 characters
 *        '404':
 *          description: the news does not exist. or The createdDate cannot be in the past.
 *        '406':
 *          description: you are not allowed to modify a news from another club
 *        '500':
 *          description: server error
 */
router.put(
  "/updateNews/:id",
  clubM,
  upload.fields([{ name: "image", maxCount: 1 }]),
  newsCon.setNews
);
module.exports = router;
