const sleeperService = require('../services/sleeperService');
const {ALLOWED_POSITIONS, ALLOWED_FIELD_MAP} = require('../utils/constant');

const getPlayerProjections = async (req, res, next) => {
    try{
        const {player1, player2, season, week} = req.query;

        if(!player1 || !player2) {
        return res.status(400).json({error: 'Both player names are required'});
        }
        if(!season || !week){
            return res.status(400).json({error: 'Season and week are required'})
        }

        const seasonInt = parseInt(season); 
        const weekInt = parseInt(week); 
        if(isNaN(seasonInt) || isNaN(weekInt)){
        return res.status(400).json({ error: 'Season and week must be numbers' });
        } 
        if(weekInt < 1 || weekInt > 18) {
        return res.status(400).json({ error: 'Week must be between 1 and 18'});
        }
        if(seasonInt < 2020 || seasonInt > new Date().getFullYear()){
        return res.status(400).json({ error: 'Season is out of valid range' });
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
        if(!p1Proj || !p2Proj) { return res.status(404).json({ error: 'Projections not found for one or both players' })};

        const matchups = await sleeperService.getESPNMatchups(season, week); 
        const p1Opp = matchups[p1.team]; 
        const p2Opp = matchups[p2.team]; 
        if(!p1Opp || !p2Opp) { return res.status(404).json({ error: 'Matchup not found for one or both players' })};

        const resolvedWeek = weekInt === 0 ? 1: weekInt; 
        const defStats = await sleeperService.getDefMatchup(seasonInt, resolvedWeek); 
        const defTeams = defStats.filter(d => isNaN(d.player_id) && !d.player_id.startsWith('TEAM_')); 
        const p1Defense = defTeams.find(d => d.player_id === p1Opp);
        const p2Defense = defTeams.find(d => d.player_id === p2Opp);

        const hasDefensiveData = !!(p1Defense && p2Defense); 
        const p1Pos = p1.position; 
        const p2Pos = p2.position; 
        const p1FanPtsAllow = p1Defense?.[ALLOWED_FIELD_MAP[p1Pos]] ?? 0;
        const p2FanPtsAllow = p2Defense?.[ALLOWED_FIELD_MAP[p2Pos]] ?? 0;

        const p1FinalScore = (p1Proj.pts_ppr ?? 0) * 0.6 + (p1FanPtsAllow * 0.4); 
        const p2FinalScore = (p2Proj.pts_ppr ?? 0) * 0.6 + (p2FanPtsAllow * 0.4); 
        const recommendation = p1FinalScore > p2FinalScore 
        ? `START ${player1}, SIT ${player2}`
        : `START ${player2}, SIT ${player1}`;


        res.json({
            player1Proj: p1Proj,
            player2Proj: p2Proj,
            p1Defense, 
            p2Defense,
            recommendation,
            scoringMethod: hasDefensiveData ? 'projection + defensive matchup' : 'projection only'
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