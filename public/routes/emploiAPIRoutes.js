const express = require("express");
const router = express.Router();
const emploiAPIController = require("../controllers/emploiAPIController");

router.get("/groupes", emploiAPIController.getGroupes);
router.get("/professeurs", emploiAPIController.getProfesseurs);
router.get("/data", emploiAPIController.getEmploiData);

module.exports = router;