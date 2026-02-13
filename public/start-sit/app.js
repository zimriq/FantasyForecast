//API const var, auto-detects if running locally or in production
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://fantasyforecast.onrender.com';

const compareBtn = document.getElementById('compareBtn'); 
const player1Input = document.getElementById('player1'); 
const player2Input = document.getElementById('player2'); 
const resultsSection = document.getElementById('results'); 
const resetBtn = document.getElementById('resetBtn'); 

compareBtn.addEventListener('click', async() => {
    const player1 = player1Input.value.trim(); 
    const player2 = player2Input.value.trim(); 

    let players = `${player1},${player2}`; 

    compareBtn.textContent = 'Comparing...'; 
    compareBtn.disabled = true; 

    try{
        const response = await fetch(`${API_URL}/api/compare?players=${encodeURIComponent(players)}`);
        const data = await response.json(); 

        if(response.ok) {
            displayResults(data); 
        } else {
            alert(data.error || 'Failed to compare players'); 
        }
    } catch(error) {
        alert('Network error. Please try again.'); 
        console.error('Error:', error);    
    } finally {
        compareBtn.textContent = 'Compare Players'; 
        compareBtn.disabled = false; 
    }
});

function displayResults(data) {
    let html = `
        <div class="recommendation"> 
            <h3> 🏆 Recommendation: START ${data.recommendation}</h3>
            <p class="reason">${data.reason}</p>
              <br><br>
        </div>
        
        <div class="comparison-cards">
        `;
    
    data.comparison.forEach((player, index) => {
        const isRecommended = player.name === data.recommendation; 
        html+= `
            <div class="player-card ${isRecommended ? 'recommended' : ''}">
                <div class="player-header"> 
                    <h4>${player.name}</h4>
                    ${isRecommended ? '<span class="badge start">START</span>' : '<span class="badge sit">SIT</span>'}
                </div>
                <div class="player-info"> 
                    <p><strong>Position:</strong> ${player.position}</p>
                    <p><strong>Team:</strong> ${player.team}</p>
                    <p><strong>Score:</strong> ${player.score}</p>
                    <p><strong>Recent Avg:</strong> ${player.recentAvg}</p>
                    <p><strong>This Week:</strong> ${player.matchup}</p>
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

    resultsSection.innerHTML = html; 
    resultsSection.classList.add('show'); 

    resetBtn.classList.add('show'); 

    resultsSection.scrollIntoView({ behavior: 'smooth'});
}

resetBtn.addEventListener('click', () => {
    player1Input.value = ""; 
    player2Input.value = ""; 

    resultsSection.innerHTML = ""; 
    resultsSection.classList.remove('show'); 

    resetBtn.classList.remove('show'); 

    player1Input.focus(); 
})