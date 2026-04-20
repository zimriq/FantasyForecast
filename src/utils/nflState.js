const axios = require('../config/axiosInstance');
const {safeSet, cache } = require('../utils/cache');

async function getCurrentNFLWeek(){
    const cacheKey = 'nfl_state';
    const cached = cache.get(cacheKey);
    if(cached) return cached;

    const url = `https://api.sleeper.app/v1/state/nfl`;
    const response = await axios.get(url); 
    const { season, week, season_type } = response.data;
    const state = { season, week, season_type };

    safeSet(cacheKey, state);
    return state;
}

module.exports = { getCurrentNFLWeek };