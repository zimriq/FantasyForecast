
const nodeCache = require('node-cache'); 
const playerCache = new nodeCache ({
    stdTTL: 3600 }); 
const projectionsCache = new nodeCache ({
    stdTTL: 3600 }); 
const defMatchupCache = new nodeCache ({
    stdTTL: 3600 });
module.exports = { playerCache, projectionsCache, defMatchupCache }; 