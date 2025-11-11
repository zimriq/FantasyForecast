# 🏈 NFL Fantasy Helper

A comprehensive full-stack fantasy football toolkit that provides data-driven insights and recommendations to help fantasy managers dominate their leagues. Built with real-time NFL data and performance analytics.

---

## ✅ Current Features

### **Player Analysis Tools**
- **Player Comparison** — Compare 2+ NFL players side-by-side with detailed stats  
- **Start/Sit Recommendations** — Get data-driven recommendations based on recent performance  
- **Player Search** — Search for any active NFL player and view their complete profile  
- **Performance Tracking** — View player stats including PPR fantasy points and weekly performance  

### **Live Data & Information**
- **Real Performance Data** — Uses actual fantasy points from recent games (last 3 weeks)  
- **Live NFL Scores** — View current NFL game scores and real-time information  
- **Automatic Week Detection** — App automatically updates for the current NFL week  

---

## 🛠️ Technologies Used

### Backend
- **Node.js** — JavaScript runtime environment  
- **Express.js** — Web application framework  
- **Axios** — HTTP client for API requests  

### Frontend
- **HTML5** — Structure  
- **CSS3** — Styling  
- **JavaScript (Vanilla)** — Client-side logic  

### APIs
- **Sleeper API** — NFL player data and weekly fantasy statistics  
- **ESPN API** — Live NFL scores and game information  

---

## 📊 How It Works

### Algorithm Logic

The Start/Sit recommendation is calculated based on:

#### **Recent Performance (Primary Factor)**
- Averages fantasy points (PPR scoring) over the last 3 weeks  
- Weighted heavily (**5× multiplier**) in the scoring algorithm    

#### **Active Status**
- Players must be on an active NFL roster  
- Free agents and inactive players automatically excluded  

**Scoring Formula:**
- score = (recentAvg × 5)

---

### 🔮 Future Enhancements

**Planned features for future releases:**
- Matchup Analysis — Factor in opponent defensive rankings
- Season Averages — Include full season performance in calculations
- Top Performers — Display weekly top performers by position
- Injury Tracker — Real-time injury updates and impact analysis
- Trade Analyzer — Evaluate trade proposals and fairness
- Weather Conditions — Include weather data for game-day decisions

