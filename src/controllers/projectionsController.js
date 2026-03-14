const sleeperService = require('../services/sleeperService');
const {ALLOWED_POSITIONS} = require('../utils/constant');

const getPlayerProjections = async (req, res, next) => {
    try{
        const {player1, player2, season, week} = req.query;

        if(!player1 || !player2) {
        return res.status(400).json({error: 'Both player names are required'});
        }
        if(!season || !week){
            return res.status(400).json({error: 'Season and week are required'})
        }

        const playerList = await sleeperService.getSleeperPlayers();
        const p1 = playerList.find(p => ALLOWED_POSITIONS.includes(p.position) && p.status === "Active" && p.full_name?.toLowerCase() === player1.toLowerCase());
        const p2 = playerList.find(p => ALLOWED_POSITIONS.includes(p.position) && p.status === "Active" && p.full_name?.toLowerCase() === player2.toLowerCase()); 
        if(!p1 || !p2) {
            return res.status(404).json({error: 'One or both players not found'});
        }

        const proj = await sleeperService.getProjections(season, week); 

        const p1Proj = proj.find(p => p.player_id === p1.player_id);
        const p2Proj = proj.find(p => p.player_id === p2.player_id); 

        res.json({
            player1Proj: p1Proj,
            player2Proj: p2Proj
        });
    } catch (err) {
        next(err);
    }
};

const getDefenseMatchups = async (req, res, next) => {
    try{
        const {season, week} = req.query; 
        if(!season || !week){
            return res.status(400).json({error: 'Season and week are required'})
        }

        const defMatchup = await sleeperService.getDefMatchup(season, week); 
        const defTeams = defMatchup.filter(d => isNaN(d.player_id) && !d.player_id.startsWith('TEAM_')); 

        res.json({
            defenseMatchup: defTeams
        });
    } catch (err) {
        next(err); 
    }
}

module.exports = {getPlayerProjections, getDefenseMatchups}; 