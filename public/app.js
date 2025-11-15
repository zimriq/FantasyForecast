//Get references to HTML elements
const compareBtn = document.getElementById('compareBtn'); 
const player1Input = document.getElementById('player1'); 
const player2Input = document.getElementById('player2'); 
const resultSection = document.getElementById('results'); 

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
    let players = `${player1}, ${player2}`; 

    //show loading state
    compareBtn.textContent = 'Comparing...'; 
    compareBtn.disabled = true; 

    try{
        //call API
        const response = await fetch(`/api/compare?players=${encodeURIComponenet(players)}`);
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
    } finally {
        //reset button 
        compareBtn.textContent = 'Compare Player'; 
        compareBtn.disabled = false; 
    }
});

//Function to display results 
function displayResults(data) {

    console.log('Results:', data); 
}