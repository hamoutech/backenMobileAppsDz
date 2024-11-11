import express from "express";
const router = express.Router();
const refreshCon = require("../controlleurs/refreshToken.controlleur");
const authClub = require("../middleware/clubManagment");
/**
 * @swagger
 * /api/refresh/refresh:
 *   get:
 *     tags:
 *       - refreshToken
 *     responses:
 *       '200':
 *         description: Successfully refreshed the token 
 *       '400':
 *         description: error 400
 *       '401':
 *         description: no refresh token sent
 *       '403':
 *         description: not allow
 *       '500':
 *         description: Internal server error
 */
router.get("/refreshToken", authClub, refreshCon.refresh);
module.exports = router;
