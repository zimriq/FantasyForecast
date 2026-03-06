const express = require('express'); 
const axios = require('axios'); 
const cors = require('cors'); 
const NodeCache = require('node-cache'); 
const playerCache = new NodeCache({ stdTTL: 3600 });

const app = express(); 
const PORT = process.env.PORT || 3000;  //letting render assign dynamic port 

app.use(cors());
app.use(express.json()); 
app.use(express.static('public')); 

//helper functs
async function getSleeperPlayers() {
    const cached = playerCache.get('nfl_players');
    if(cached) return cached; 

    const response = await axios.get('https://api.sleeper.app/v1/players/nfl');
    const players = Object.values(response.data);
    playerCache.set('nfl_players', players); 
    return players;
}

//api/compare
const ALLOWED_POSITIONS = ['QB', 'RB', 'WR', 'TE'];
app.get('/api/compare', async (req, res) => {
    const {player1, player2} = req.query;
    if(!player1 || !player2) {
        return res.status(400).json({error: 'Both player names are required'});
    }

    try{
        const players = await getSleeperPlayers(); 
        const p1 = players.find(p => ALLOWED_POSITIONS.includes(p.position) && p.status === "Active" && p.full_name?.toLowerCase() === player1.toLowerCase());
        const p2 = players.find(p => ALLOWED_POSITIONS.includes(p.position) && p.status === "Active" && p.full_name?.toLowerCase() === player2.toLowerCase()); 

        if(!p1 || !p2) {
            return res.status(404).json({error: 'One or both players were not found'});
        }
        return res.json({ player1: p1, player2: p2 });
    } catch(error) {
        console.error('Sleeper API error:', error.message);
        return res.status(502).json({error: 'Failed to fetch player data from upstream service.'});
    }
});

//api/matchup
app.get('/api/matchup', async (req, res) => {
    try{


    }catch(error) {
        console.error('')
    }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});