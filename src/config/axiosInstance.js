const axios = require('axios'); 

const axiosInstance = axios.create({
    timeout: 5000,
});

module.exports = axiosInstance; 