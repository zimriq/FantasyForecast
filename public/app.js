//Get references to HTML elements
const compareBtn = document.getElementById('compareBtn'); 
const player1Input = document.getElementById('player1'); 
const player2Input = document.getElementById('player2'); 
const resultsSection = document.getElementById('results'); 

//Listen for button click 
compareBtn.addEventListener('click', async() => {
    //get player names
    const player1 = player1Input.value.trim(); 
    const player2 = player2Input.value.trim(); 

    //validation - need at least 2 players
    if(!player1 || !player2) {
        alert('Please enter at least 2 player names'); 
        return; 
    }

    //building player string 
    let players = `${player1},${player2}`; 

    //show loading state
    compareBtn.textContent = 'Comparing...'; 
    compareBtn.disabled = true; 

    try{
        //call API
        const response = await fetch(`/api/compare?players=${encodeURIComponent(players)}`);
        const data = await response.json(); 

        if(response.ok) {
            //good - Displays results
            displayResults(data); 
        } else {
            //error from API
            alert(data.error || 'Failed to compare players'); 
        }
    } catch(error) {
        alert('Network error. Please try again.'); 
        console.error('Error:', error);     //adding to see actual error
    } finally {
        //reset button 
        compareBtn.textContent = 'Compare Players'; 
        compareBtn.disabled = false; 
    }
});

//Function to display results 
function displayResults(data) {
    //building html for results 
    let html = `
        <div class="recommendation"> 
            <h3 🏆 Recommendation: START ${data.recommendation}</h3>
            <p class="reason">${data.reason}</p>
        </div>
        
        <div class="comparison-cards">
        `;
    
    //add card for each player
    data.comparison.forEach((player, index) => {
        const isRecommended = player.name === data.recommendation; 
        html+= `
            <div class="player-card ${isRecommended ? 'recommended' : ''}">
                <div class="player-header"> 
                    <h4>${player.name}</h4>
                    ${isRecommended ? '<span class="badge start">START</span>' : '<span class="badge sit">SIT</span>'}
                </div>
                <div class="player-info"> 
                    <p><strong>Position:</strong? ${player.position}</p>
                    <p><strong>Team:</strong> ${player.team}</p>
                    <p><strong>Score:</strong> ${player.score}</p>
                    <p></strong>Recent Avg:</strong> ${player.recentAvg}</p>
                    <p><strong>Games Played:</strong> ${player.gamesPlayed}/3</p>
                    <p class="data-status">${player.dataStatus}</p>
                </div>
                <div class="weekly-points">
                    <p><strong>Last 3 Weeks:</strong></p>
                    <p>${player.weeklyPoints.join(', ')} pts</p>
                </div>
            </div>
        `;
    });

    html += `</div>`;

    //inserting results into section to show it
    resultsSection.innerHTML = html; 
    resultsSection.classList.add('show'); 

    //scroll to results smoothly
    resultsSection.scrollIntoView({ behavior: 'smooth'});
}