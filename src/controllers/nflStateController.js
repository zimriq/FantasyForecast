const {getCurrentNFLWeek} = require('../utils/nflState'); 

async function getNFLState(req, res, next){
    try{
        const state = await getCurrentNFLWeek(); 
        res.json(state); 
    } catch (err) {
        next(err); 
    }
}

module.exports = { getNFLState };