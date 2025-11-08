//import libraries
const express = require('express'); 
const axios = require('axios'); 
const cors = require('cors'); 

//create server
const app = express(); 
const PORT = 3000; 

//Middleware
app.use(cors()); 
app.use(express.json()); 

//Test route 
app.get('/', (req, res) => {
    res.json({ message: 'NFL Fantasy Helper API is running!' });
});

//Get current NFL scores 
app.get('/api/scores', async (req, res) => {
    try{
        const response = await axios.get('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
        res.json(response.data);
    } catch(error) {
        res.status(500).json({ error: 'Failed to fetch scores' });
    }
});


//Get player stats by name
app.get('/api/player/:name', async (req, res) => {
    try {
        const playerName = req.params.name;
        
        const response = await axios.get('https://api.sleeper.app/v1/players/nfl'); 
        const players = response.data; 

        const matchingPlayers = Object.values(players).filter(p => 
            p.full_name && p.full_name.toLowerCase().includes(playerName.toLowerCase())
        );

        if(matchingPlayers.length > 0){
            res.json(matchingPlayers); 
        } else {
            res.status(404).json({error: 'Player not found' });
        }
        } catch (error) {
            res.status(500).json({error: 'Failed to fetch player data' });
        }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});