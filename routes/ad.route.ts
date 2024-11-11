import express from "express";
const router = express.Router();
const adController = require("../controlleurs/ad.controller");
const authClub = require("../middleware/clubManagment");
import upload from "../middleware/multer.video.image";

/**
 * @swagger
 * /api/ads:
 *   post:
 *     tags:
 *     - Ads
 *     description: Create a new ads
 *     parameters:
 *       - in : body
 *         name: ad
 *         schema:
 *           type: object
 *           required:
 *             - title
 *             - description
 *             - isShown
 *             - image
 *             - video
 *             - location
 *             - duration
 *           properties:
 *             title:
 *               type: string
 *             isShown:
 *               type: boolean
 *             description:
 *               type: string
 *             location:
 *               type: number
 *             duration:
 *               type: string
 *             image:
 *               type: string
 *             video:
 *               type: string
 *     responses:
 *       '201':
 *         description: The ad was successfully created
 *       '400':
 *         description: A required field is missing. or Invalid duration.
 *       '401':
 *         description: location must be between 1 and 5!
 *       '404':
 *         description: Club not found. or Not allowed, you cannot create more than 5 ads!
 *       '501':
 *         description: Field type is unexpected or not allow
 *       '500':
 *         description: Server error
 */
router.post("/", authClub,upload.fields([{ name: 'image',maxCount:1 }]), adController.create);

/**
 * @swagger
 * /api/ads:
 *   get:
 *     tags:
 *       - Ads
 *     summary: Get all ads
 *     description: Get all ads
 *     responses:
 *       200:
 *         description: The list of all ads
 *       501:
 *         description: not allow
 */
router.get("/",authClub ,adController.getAll);

/**
 * @swagger
 * /api/ads/:id:
 *   get:
 *     tags:
 *       - Ads
 *     summary: Get an ad by ID
 *     description: Retrieve a specific ad by its ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the ad to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The ad was successfully retrieved
 *       404:
 *         description: Ad not found
 *       501:
 *         description: not allow
 *       500:
 *         description: Internal server error
 */
router.get("/:id",authClub, adController.getById);

/**
 *  @swagger
 *  /api/ads/club/:name:
 *    get:
 *      tags:
 *      - Ads
 *      summary: Get ads by club name
 *      description: Retrieve ads by the club name.
 *      parameters:
 *        - in: path
 *          name: name
 *          required: true
 *          schema:
 *            type: string
 *          description: The name of the club
 *      responses:
 *        '200':
 *          description: Ads retrieved successfully
 *        '400':
 *          description: Club name is required
 *        '404':
 *          description: Club not found
 *        '500':
 *          description: Internal server error
 */
router.get("/club/:name", adController.getByClubName);

/**
 *  @swagger
 *  /api/ads/:id:
 *    put:
 *      tags:
 *      - Ads
 *      summary: Update an ad
 *      description: Update an existing ad with the given ID. Title and image are required fields.
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: The ID of the ad to update
 *        - in: body
 *          name: ad
 *          schema:
 *            type: formData
 *            required:
 *              - title
 *              - image
 *            properties:
 *              title:
 *                type: string
 *                description: The title of the ad
 *              description:
 *                type: string
 *                description: The description of the ad
 *              image:
 *                type: string
 *                description: The URL or path of the image for the ad
 *              video:
 *                type: string
 *                description: The URL or path of the video for the ad
 *              isShown:
 *                type: boolean
 *                description: Whether the ad is visible or not
 *              location:
 *                type: number
 *                description: The location of the ad
 *              duration:
 *                type: string
 *                description: The duration of the ad
 *      responses:
 *        '200':
 *          description: The ad was successfully updated
 *        '400':
 *          description: Ad ID is required. or invalid id. or Invalid duration.
 *        '401':
 *          description: location must be between 1 and 5!
 *        '406':
 *          description: please modify at least one field.
 *        '404':
 *          description: Ad or Club not found
 *        '500':
 *          description: Internal server error
 *        '501':
 *          description: not allow
 */
router.put("/:id", authClub, upload.fields([{ name: 'image',maxCount:1 }]), adController.update);

/**
 *  @swagger
 *  /api/ads/change-visibility/:id:
 *    patch:
 *      tags:
 *      - Ads
 *      description: Change the visibility of an ad by its ID.
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: The ID of the ad to change visibility
 *        - in: body
 *          name: visibility
 *          schema:
 *            type: object
 *            required:
 *              - isShown
 *            properties:
 *              isShown:
 *                type: boolean
 *                description: Set the visibility of the ad
 *                example: true
 *      responses:
 *        '200':
 *          description: Ad visibility was successfully updated
 *        '400':
 *          description: Ad is already in the requested visibility or ID is missing
 *        '404':
 *          description: Ad not found
 *        '500':
 *          description: Internal server error
 *        '501':
 *          description: not allow
 */
router.patch("/change-visibility/:id", authClub, adController.changeVisibility);

/**
 *  @swagger
 *  /api/ads/:id:
 *    delete:
 *      tags:
 *      - Ads
 *      description: Delete an ad by its ID.
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: The ID of the ad to delete
 *      responses:
 *        '200':
 *          description: Ad was successfully deleted
 *        '400':
 *          description: Invalid ad ID
 *        '404':
 *          description: Ad not found
 *        '500':
 *          description: Internal server error
 *        '501':
 *          description: not allow
 */
router.delete("/:id",authClub,adController.delete);

module.exports = router;
