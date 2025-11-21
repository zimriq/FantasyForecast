//import libraries
const express = require('express'); 
const axios = require('axios'); 
const cors = require('cors'); 

//create server
const app = express(); 
const PORT = process.env.PORT || 3000;  //letting render assign dynamic port 


//Middleware
app.use(cors({
    origin: [
        "https://fantasyforecast.vercel.app", //frontend deployment
        "http://localhost:3000"  //local testing
    ], 
    credentials: true
})); 

app.use(express.json()); 

//serve static files from 'public' folder 
app.use(express.static('public')); 

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
    
    //fetching players
    const response = await axios.get('https://api.sleeper.app/v1/players/nfl');
    const allPlayers = response.data;
    
    //finding each player 
    let foundPlayers = [];
    for(let i = 0; i < playerArray.length; i++){
        const currentPlayerName = playerArray[i];

        const matchedPlayer = Object.values(allPlayers).find(p =>
        p.full_name && 
        p.full_name.toLowerCase().includes(currentPlayerName.toLowerCase()) &&
        p.team && p.team !== null &&  // Has a team
        p.active === true  // Is active
     );
        if(matchedPlayer){
        foundPlayers.push(matchedPlayer); 
        }
    }
    
    //checking if all players found
    if(foundPlayers.length !== playerArray.length){
        return res.status(400).json ({ error: 'One or more players not found'});
    }
    
    //calculate scores 


    // Auto-calculate current NFL week
const today = new Date();
const seasonStart = new Date('2025-09-05');
const daysSinceStart = Math.floor((today - seasonStart) / (1000*60*60*24));

// Week since season start (1-based)
let currentWeek = Math.min(Math.floor(daysSinceStart / 7) + 1, 18);

// Determine last completed week
const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
let lastCompletedWeek = currentWeek;

// Week is complete only after Monday
if(dayOfWeek >= 2) { // Tue-Sat
    lastCompletedWeek = currentWeek - 1;
}

// Make sure we don’t go below week 1
lastCompletedWeek = Math.max(1, lastCompletedWeek);

// Last 3 weeks to analyze
const weeksToAnalyze = 3;
const startWeek = Math.max(1, lastCompletedWeek - weeksToAnalyze + 1);

// Logging for debugging
console.log('Today is:', ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dayOfWeek]);
console.log('Current week calculated as:', currentWeek);
console.log('Last completed week:', lastCompletedWeek);
console.log('Analyzing weeks:', startWeek, 'to', lastCompletedWeek);

// Fetch stats for each of the last 3 completed weeks
const statsPromises = [];
for (let week = startWeek; week <= lastCompletedWeek; week++) {
    statsPromises.push(
        axios.get(`https://api.sleeper.app/v1/stats/nfl/regular/2025/${week}`)
    );
}



    
    //calculate scores based on actual fantasy points
    const statsResponses = await Promise.all(statsPromises); 
    const weeklyStats = statsResponses.map(res => res.data); 
    
    const scoredPlayers = foundPlayers.map(player => {
        const playerId = player.player_id; 
        
        //get player's stats from each week
        const playerWeeklyPoints = weeklyStats.map(week => {
        const stats = week[playerId]; 
        return stats ? (stats.pts_ppr || 0) : 0; 
        }).filter(pts => pts > 0); //filter weeks not played

        
        //calc recent avg
        const recentAvg = playerWeeklyPoints.length > 0
        ? playerWeeklyPoints.reduce((sum, pts) => sum + pts, 0) / playerWeeklyPoints.length
        : 0; 
        
        //calc score 
        let score = recentAvg * 5;
        
        // Bonus for consistency
        if (playerWeeklyPoints.length === weeksToAnalyze) {
        score += 10;
        }
        
        // Penalty for inactive
        if(!player.active) {
        score = 0; 
        }
        
        return {
        name: player.full_name, 
        position: player.position, 
        team: player.team || 'Free Agent', 
        score: Math.round(score), 
        recentAvg: Math.round(recentAvg * 10) / 10, 
        gamesPlayed: playerWeeklyPoints.length, 
        weeklyPoints: playerWeeklyPoints, 
        dataStatus: playerWeeklyPoints.length < weeksToAnalyze
            ? 'Limited data - stats may be updating'
            : 'Complete data'
        };
    });
    
    //Step 5 - Determine recommendation
    const sortedPlayers = scoredPlayers.sort((a, b) => b.score - a.score);
    const recommended = sortedPlayers[0];
    
    //Step 6 - Send response 
    res.json({
        recommendation: recommended.name,
        reason: `Averaged ${recommended.recentAvg} fantasy points over last ${weeksToAnalyze} weeks`,
        comparison: sortedPlayers
    });
    
    } catch (error) {
    res.status(500).json({ error: 'Failed to compare players' }); 
    }
    });


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});