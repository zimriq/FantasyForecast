
const nodeCache = require('node-cache'); 
const MAX_KEYS = 500; 
const cache = new NodeCache({ stdTTL: 300});

const safeSet = (key, value) => {
    if(cache.keys(). length >= MAX_KEYS) {
        console.warn('Cache limit reached, skipping cache set for key:', key); 
        return false; 
    }
    return cache.set(key, value); 
};

module.exports = { cache, safeSet }; 