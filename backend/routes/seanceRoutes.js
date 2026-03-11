const express = require("express");
const router = express.Router();

const seanceController = require("../controllers/seanceController");

router.put("/:id", seanceController.updateSeance);

module.exports = router;