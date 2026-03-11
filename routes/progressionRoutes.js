const express = require('express');
const router = express.Router();
const progressionController = require('../controllers/progressionController');

router.get('/dashboard', progressionController.getDashboard);

module.exports = router;
