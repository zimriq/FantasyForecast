const express = require('express'); 
const router = express.Router();
const projectionsController = require('../controllers/projectionsController');

router.get('/players', projectionsController.getPlayerProjections); 

router.get('/defense', projectionsController.getDefenseMatchup); 

module.exports = router; 