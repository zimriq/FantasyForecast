const axios = require('axios'); 
const nodeCache = require('node-cache'); 
const playerCache = new nodeCache ({
    stdTTL: 3600 }); 

module.exports = { playerCache }; 