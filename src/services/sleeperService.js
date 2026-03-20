const axios = require('axios'); 
const { playerCache, projectionsCache, defMatchupCache, getESPNMatchupsCache } = require('../utils/cache'); 

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

async function getESPNMatchups(season, week) {
    const cacheKey = `getESPNMatchups_${season}_${week}`; 
    const cached = getESPNMatchupsCache.get(cacheKey); 
    if(cached) return cached; 

    const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week=${week}&seasontype=2&year=${season}`;
    const response = await axios.get(url); 

    const events = response.data.events;
    const matchups = {}; 
    events.forEach(event => {
        const competitors = event.competitions[0].competitors;
        const team1 = competitors[0].team.abbreviation; 
        const team2 = competitors[1].team.abbreviation; 
        matchups[team1] = team2; 
        matchups[team2] = team1; 
    });

    getESPNMatchupsCache.set(cacheKey, matchups);
    return matchups;
}

module.exports = { getSleeperPlayers, getProjections, getDefMatchup, getESPNMatchups };