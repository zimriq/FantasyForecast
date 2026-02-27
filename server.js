const express = require('express'); 
const axios = require('axios'); 
const cors = require('cors'); 

const app = express(); 
const PORT = process.env.PORT || 3000;  //letting render assign dynamic port 


app.use(express.json()); 
app.use(express.static('public')); 

//api/scores

//api/player/:name

//api/compare


//api/test-defense


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});