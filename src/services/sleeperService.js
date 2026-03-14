const axios = require('axios'); 
const { playerCache, projectionsCache, defMatchupCache } = require ('../utils/cache'); 

async function getSleeperPlayers() {
    const cached = playerCache.get('nfl_players');
    if(cached) return cached; 

    const response = await axios.get('https://api.sleeper.app/v1/players/nfl');
    const players = Object.values(response.data);
    playerCache.set('nfl_players', players); 
    return players;
}

async function getProjections(season, week) {
    const cacheKey = `projections_${season}_${week}`;
    const cached = projectionsCache.get(cacheKey);
    if(cached) return cached;

    const url = `https://api.sleeper.app/v1/projections/nfl/regular/${season}/${week}`;
    const response = await axios.get(url);

    const proj = Object.entries(response.data).map(([id, stats]) => ({
        player_id: id,
        ...stats
    }));
    projectionsCache.set(cacheKey, proj);
    return proj;
}

async function getDefMatchup(season, week) {
    const cacheKey = `defMatchup_${season}_${week}`;
    const cached = defMatchupCache.get(cacheKey);
    if(cached) return cached;

    const url = `https://api.sleeper.app/v1/stats/nfl/regular/${season}/${week}`;
    const response = await axios.get(url);

    const defM = Object.entries(response.data).map(([id, stats]) => ({
        player_id: id,
        ...stats
    }));
    defMatchupCache.set(cacheKey, defM);
    return defM;
}

module.exports = { getSleeperPlayers, getProjections, getDefMatchup};