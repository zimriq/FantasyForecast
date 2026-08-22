const express = require('express'); 
const router = express.Router();
const projectionsController = require('../controllers/projectionsController');

router.get('/', projectionsController.getPlayers); 

module.exports = router; 