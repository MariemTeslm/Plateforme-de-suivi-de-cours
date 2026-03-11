const express = require('express');
const router = express.Router();
const semaineCtrl = require('../controllers/semaineControllers');

router.get('/all', semaineCtrl.getAllWeeks);
router.get('/active', semaineCtrl.getActiveWeek);
router.post('/add', semaineCtrl.addWeek);
router.put('/activate/:id', semaineCtrl.activateWeek);
router.delete('/delete/:id', semaineCtrl.deleteWeek);

module.exports = router;
