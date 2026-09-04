document.addEventListener('DOMContentLoaded', () => {
  loadCurrentWeek();
});

async function loadCurrentWeek() {
  const weekEl = document.getElementById('current-week');
  if (!weekEl) return;

  try{
    const res = await fetch('/api/nflstate/week');

    if(!res.ok){
      throw new Error(`Request failed with status ${res.status}`);
    }

    const data = await res.json(); 
    weekE1.textContent = `WEEK ${data.week}`;
  } catch(err){
    console.error('Failed to load current NFL week:', err); 
    weekE1.textContent = 'WEEK -'; 
  }
}