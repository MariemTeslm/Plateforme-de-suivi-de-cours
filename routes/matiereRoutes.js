const express = require("express");
const router = express.Router();
const matieresController = require("../controllers/matiereControllers");

router.post("/add", matieresController.addMatiere);
router.get("/all", matieresController.getAllMatieres);
router.put("/update/:id", matieresController.updateMatiere);
router.delete("/delete/:id", matieresController.deleteMatiere);

module.exports = router;