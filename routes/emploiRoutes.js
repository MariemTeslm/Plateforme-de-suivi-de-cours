const express = require("express");
const router = express.Router();

const emploiController = require("../controllers/emploiController");

router.get("/groupe/:id", emploiController.getEmploiGroupe);

module.exports = router;