//import libraries
const express = require('express'); 
const axios = require('axios'); 
const cors = require('cors'); 

//create server
const app = express(); 
const PORT = process.env.PORT || 3000;  //letting render assign dynamic port 

//Helper function to get the week schedule from ESPN
async function getWeekSchedule(week, season = 2025) {
    try{
        const response = await axios.get(
            `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week=${week}&seasontype=2`
        );
        
        const games = response.data.events || []; 
        const schedule = {}; 

        games.forEach(game => {
            // Safety checks
            if (!game.competitions || !game.competitions[0]) return;
            if (!game.competitions[0].competitors) return;
            
            const homeTeam = game.competitions[0].competitors.find(t => t.homeAway === 'home');
            const awayTeam = game.competitions[0].competitors.find(t => t.homeAway === 'away'); 

            if (!homeTeam || !awayTeam) return;
            if (!homeTeam.team || !awayTeam.team) return;

            const homeAbbr = homeTeam.team.abbreviation;
            const awayAbbr = awayTeam.team.abbreviation; 

            schedule[homeAbbr] = awayAbbr; 
            schedule[awayAbbr] = homeAbbr; 
        });

        return schedule; 
    } catch (error) {
        console.error(`Error fetching schedule for week ${week}:`, error.message); 
        return {}; 
    }
}

// Helper function to calculate defense rankings 
async function calculateDefensiveRankings(weeks){
    try{
        const statsPromises = weeks.map(week =>
            axios.get(`https://api.sleeper.app/v1/stats/nfl/regular/2025/${week}`)
        ); 

        //fetching schedule for weeks
        const schedulePromises = weeks.map(week => getWeekSchedule(week)); 

        const [statsResponses, schedules] = await Promise.all([
            Promise.all(statsPromises), 
            Promise.all(schedulePromises)
        ]); 

        const allStats = statsResponses.map(res => res.data); 

        //get all player data 
        const playerResponse = await axios.get(`https://api.sleeper.app/v1/players/nfl`); 
        const allPlayers = playerResponse.data;

        //tracking points allowed by each def
        const defenseStats = {}; 

        //processing each week 
        allStats.forEach((weekStats, weekIndex) => {
            const weekSchedule = schedules[weekIndex]; 

            Object.entries(weekStats).forEach(([playerId, stats]) => {
                const player = allPlayers[playerId]; 
                if(!player|| !player.team) return; 

                const position = player.position; 
                const playerTeam = player.team; 
                const points = stats.pts_ppr || 0; 

                //irrelevant data
                if(!position || !playerTeam || points < 2) return; //ignore backups
                if(['K', 'DEF'].includes(position)) return; //skipping kicker/def

                //find opp from schedule 
                const opponent = weekSchedule[playerTeam]; 
                if(!opponent) return; 

                // initialize defense structure
                if (!defenseStats[opponent]) defenseStats[opponent] = {};
                if (!defenseStats[opponent][position]) defenseStats[opponent][position] = {};
                if (!defenseStats[opponent][position][weeks[weekIndex]]) {
                    defenseStats[opponent][position][weeks[weekIndex]] = 0;
                }

                // ADD player's points to that week’s total
                defenseStats[opponent][position][weeks[weekIndex]] += points;
            });
        });
    //calc avgs and league avgs
    const rankings = {}; 
    const leagueAvg = {}; 
    
    //1, calc league avg per pos
    Object.values(defenseStats).forEach(teamPositions => {
    Object.entries(teamPositions).forEach(([position, weeklyTotals]) => {
        if (!leagueAvg[position]) {
            leagueAvg[position] = [];
        }
        // weeklyTotals is an object → push each week's total
        leagueAvg[position].push(...Object.values(weeklyTotals));
    });
});

    
    //calc league avg
    Object.keys(leagueAvg).forEach(position => {
        const avg = leagueAvg[position].reduce((sum, pts) => sum + pts, 0) / leagueAvg[position].length;
        leagueAvg[position] = Math.round(avg * 10) / 10;
    });

    //2, calc def avg and compare to league 
    Object.entries(defenseStats).forEach(([team, positions]) => {
        rankings[team] = {};
        Object.entries(positions).forEach(([position, weeklyTotals]) => {
            const totals = Object.values(weeklyTotals);
            const avg = totals.reduce((sum, pts) => sum + pts, 0) / totals.length;
            const defAvg = Math.round(avg * 10) / 10;
            const leagueAvgForPos = leagueAvg[position] || avg;

        rankings[team][position] = {
            avg: defAvg,
            difficulty: defAvg < leagueAvgForPos ? 'Tough' : 'Favorable',
            vsLeague: Math.round((defAvg - leagueAvgForPos) * 10) / 10
        };
        });
    });

    return { rankings, leagueAvg };
    } catch (error) {
        console.error('Error calculating defensive rankings: ', error);
        return { rankings: {}, leagueAvg: {} };
    }
}

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
        const response = await axios.get(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard`);
        res.json(response.data);
    } catch(error) {
        res.status(500).json({ error: 'Failed to fetch scores' });
    }
});


//Get player stats by name
app.get('/api/player/:name', async (req, res) => {
    try {
        const playerName = req.params.name;
        
        const response = await axios.get(`https://api.sleeper.app/v1/players/nfl`); 
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
    const playerResponse = await axios.get(`https://api.sleeper.app/v1/players/nfl`);
    const allPlayers = playerResponse.data;
    
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

    //current NFL week 
    const weekResponse = await axios.get(`https://api.sleeper.app/v1/state/nfl`);
    const currentWeek = weekResponse.data.week; 
    console.log('Current NFL Week:', currentWeek);  //debug

    const weeksToAnalyze = 3;
    const pastWeek = currentWeek - 1;
    const lastCompletedWeek = pastWeek >= 1 ? pastWeek : 1;
    const startWeek = Math.max(1, lastCompletedWeek - weeksToAnalyze + 1);

    // Use ALL completed weeks for defensive rankings (Week 1 through last completed week)
    const defenseWeeks = [];
    for (let week = 1; week <= lastCompletedWeek; week++) {
        defenseWeeks.push(week);
    }

    // Calculate defensive rankings and get this week's schedule
    const { rankings: defenseRankings, leagueAvg } = await calculateDefensiveRankings(defenseWeeks);
    const thisWeekSchedule = await getWeekSchedule(currentWeek); // upcoming week schedule

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
    
    // Get matchup info
    const playerTeam = player.team;
    const opponent = thisWeekSchedule[playerTeam];
    const playerPosition = player.position;
    
    let matchupScore = 0;
    let matchupInfo = 'No matchup data';
    
    if (opponent && defenseRankings[opponent] && defenseRankings[opponent][playerPosition]) {
        const defenseVsPosition = defenseRankings[opponent][playerPosition];
        const leagueAvgForPos = leagueAvg[playerPosition] || 0;
        
        // Matchup score: positive = good matchup, negative = bad matchup
        matchupScore = defenseVsPosition.vsLeague;
        matchupInfo = `vs ${opponent} (${defenseVsPosition.difficulty}, ${defenseVsPosition.avg} pts allowed)`;
    }
    
    //calc score with matchup factored in
    let score = recentAvg * 4;  // Recent performance 
    score += matchupScore * 10;  // Matchup difficulty 
    
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
        matchup: matchupInfo, 
        matchupScore: Math.round(matchupScore * 10) / 10, 
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

app.get('/api/test-defense', async (req, res) => {
  try {
    const weekResponse = await axios.get('https://api.sleeper.app/v1/state/nfl');
    const currentWeek = weekResponse.data.week;
    const lastCompletedWeek = Math.max(1, currentWeek - 1);
    
    const weeks = [];
    for (let week = 1; week <= lastCompletedWeek; week++) {
      weeks.push(week);
    }
    
    const { rankings, leagueAvg } = await calculateDefensiveRankings(weeks);
    
    res.json({
      message: 'Defensive rankings calculated',
      currentWeek: currentWeek,
      weeksAnalyzed: weeks.length,
      leagueAverages: leagueAvg,
      sampleTeams: {
        KC: rankings['KC'],
        BUF: rankings['BUF'],
        CIN: rankings['CIN']
      },
      totalTeams: Object.keys(rankings).length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});