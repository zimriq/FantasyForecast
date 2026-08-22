//API const var, auto-detects if running locally or in production
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://fantasyforecast.onrender.com';

const compareBtn = document.getElementById('compareBtn'); 
const player1Input = document.getElementById('player1'); 
const player2Input = document.getElementById('player2'); 
const resultsSection = document.getElementById('results'); 
const resetBtn = document.getElementById('resetBtn'); 

//change
compareBtn.addEventListener('click', async() => {
    const player1 = player1Input.value.trim(); 
    const player2 = player2Input.value.trim(); 
    compareBtn.textContent = 'Comparing...'; 
    compareBtn.disabled = true; 

    try{
        const stateResponse = await fetch(`${API_URL}/api/nflstate/week`);
        const stateData = await stateResponse.json(); 
        const { season, week } = stateData; 

        console.log('season:', season, 'week:', week);
        const response = await fetch(`${API_URL}/api/projections/players?player1=${encodeURIComponent(player1)}&player2=${encodeURIComponent(player2)}&season=${season}&week=${week}`);
        const data = await response.json();

        if(response.ok){
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

//keep
function displayResults(data) {
    
    const player1Name = player1Input.value.trim(); 
    const player2Name = player2Input.value.trim(); 
    const p1Pts = (data.player1Proj.pts_ppr ?? 0).toFixed(2); 
    const p2Pts = (data.player2Proj.pts_ppr ?? 0).toFixed(2); 

    const p1Recommended = data.recommendation.includes(`START ${player1Name}`);
    const p2Recommended = !p1Recommended;

    let html = `
        <div class="recommendation">
            <h3>Recommendation: ${data.recommendation}</h3>
            <p class="reason">Scoring method: ${data.scoringMethod}</p>
            <br>
        </div>
        <div class="comparison-cards">
            <div class="player-card ${p1Recommended ? 'recommended' : ''}">
                <div class="player-header">
                    <h4>${player1Name}</h4>
                    ${p1Recommended ? '<span class="badge start">START</span>' : '<span class="badge sit">SIT</span>'}
                </div>
                <div class="player-info">
                    <p><strong>Projected Points (PPR):</strong> ${p1Pts}</p>
                </div>
            </div>
            <div class="player-card ${p2Recommended ? 'recommended' : ''}">
                <div class="player-header">
                    <h4>${player2Name}</h4>
                    ${p2Recommended ? '<span class="badge start">START</span>' : '<span class="badge sit">SIT</span>'}
                </div>
                <div class="player-info">
                    <p><strong>Projected Points (PPR):</strong> ${p2Pts}</p>
                </div>
            </div>
        </div>
    `;

    resultsSection.innerHTML = html; 
    resultsSection.classList.add('show'); 
    resetBtn.classList.add('show'); 
    resultsSection.scrollIntoView({behavior: 'smooth'});
}

resetBtn.addEventListener('click', () => {
    player1Input.value = ""; 
    player2Input.value = ""; 

    resultsSection.innerHTML = ""; 
    resultsSection.classList.remove('show'); 

    resetBtn.classList.remove('show'); 

    player1Input.focus(); 
})