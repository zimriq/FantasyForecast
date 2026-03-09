const axios = require('axios'); 
const { playerCache, projectionsCache, defMatchupCache } = require ('.../utils/cache'); 

async function getSleeperPlayers() {
    const cached = playerCache.get('nfl_players');
    if(cached) return cached; 

    const response = await axios.get('https://api.sleeper.app/v1/players/nfl');
    const players = Object.values(response.data);
    playerCache.set('nfl_players', players); 
    return players;
}

async function getProjections(season, week) {
    const cached = projectionsCache.get('players_proj'); 
    if(cached) return cached; 

    const response = await axios.get('https://api.sleeper.app/v1/projections/nfl/regular/<season>/<week>'); 
    const proj = Object.values(response.data); 
    projectionsCache.set('players_proj', proj); 
    return proj; 
}

async function getDefMatchup() {
    const cached = defMatchupCache.get('defense_matchup'); 
    if(cached) return cached; 

    const response = await axios.get('https://api.sleeper.app/v1/regular/<season>/<week>'); 
    const defM = Object.values(response.data); 
    defMatchupCache.set('defense_matchup', defM);
    return defM;
}

module.exports = { getSleeperPlayers, getProjections, getDefMatchup};