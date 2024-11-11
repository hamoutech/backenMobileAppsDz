import express from "express";
const router = express.Router();
const adminCon = require("../controlleurs/admin.controlleur");
const clubM = require("../middleware/clubManagment");

router.post("/createAdmin", adminCon.account);
router.get("/getAll", clubM, adminCon.getAll);
router.put("/updateMyAdmin", adminCon.setAdmin);

router.delete("/deleteAdmin/:id", adminCon.deleteadmin);
module.exports = router;
