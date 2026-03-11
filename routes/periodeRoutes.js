const express = require('express');
const router = express.Router();
const periodeController = require('../controllers/periodeControllers');

router.get('/all', periodeController.getAllPeriodes);
router.post('/add', periodeController.addPeriode);
router.put('/update/:id', periodeController.updatePeriode);
router.delete('/delete/:id', periodeController.deletePeriode);

module.exports = router;
