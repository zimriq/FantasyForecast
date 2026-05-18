const express = require('express'); 
const router = express.Router(); 
const nflStateController = require('../controllers/nflStateController');

router.get('/week', nflStateController.getNFLState);

module.exports = router; 