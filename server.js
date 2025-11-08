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


//Start/Sit Recommendation
app.get('/api/compare', async (req, res) => {
    try {
    //getting players from query params
    const playerNames = req.query.players; 

    //handling player names properly
    if(!playerNames){
        return res.status(400).json ({ error: 'Please provide player names'});
    }

    const playerArray = playerNames.split(',').map(name => name.trim()); 

    if(playerArray.length < 2){
        return res.status(400).json({ error: 'Please provide at least 2 players to compare'});
    }

    //fetching players: 
    const response = await axios.get('https://api.sleeper.app/v1/players/nfl');
    const allPlayers = response.data;


    //finding each player 
    let foundPlayers = []; //empty array

    for(let i = 0; i < playerArray.length; i++){
        const currentPlayerName = playerArray[i];

        const matchedPlayer = Object.values(allPlayers).find(p =>
            p.full_name && p.full_name.toLowerCase().includes(currentPlayerName.toLowerCase())
        );

        if(matchedPlayer){  //adding to array 
            foundPlayers.push(matchedPlayer); 
        }
    }
    
    //checking if all players found
    if(foundPlayers.length !== playerArray.length){
        return res.status(400).json ({ error: 'One or more players not found'});
    }

    //TODO: step 4 - calculate scores 
    //TODO: step 5 - Determine recommendation
    //TODO: step 6 - Send response 
    
    } catch (error) {
        res.status(500).json({ error: 'Failed to compare players' }); 
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});