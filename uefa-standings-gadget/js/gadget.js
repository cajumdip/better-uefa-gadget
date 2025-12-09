// UEFA Standings Gadget JavaScript

// Configuration
const API_BASE_URL = 'https://api.football-data.org/v4';
const LEAGUE_CODES = {
    'DED': 'Eredivisie',
    'CL': 'Champions League',
    'EL': 'Europa League'
};

const COMPETITION_IDS = {
    'DED': 'DED',    // Eredivisie
    'CL': 'CL',      // Champions League
    'EL': 'EC'       // Europa Conference League (using EC as EL might not be available)
};

let apiKey = '';
let autoRefreshInterval = null;
let currentTab = 'standings';

// Initialize gadget on load
window.onload = function() {
    loadApiKey();
    loadStandings();
};

// Settings Management
function loadApiKey() {
    // Try to load from localStorage (gadget settings)
    if (typeof(Storage) !== "undefined") {
        const savedKey = localStorage.getItem('footballDataApiKey');
        if (savedKey) {
            apiKey = savedKey;
        }
    }
}

function saveSettings() {
    const keyInput = document.getElementById('apiKeyInput');
    const newKey = keyInput.value.trim();
    
    if (newKey) {
        apiKey = newKey;
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem('footballDataApiKey', apiKey);
        }
        alert('Settings saved successfully!');
        closeSettings();
        
        // Reload current view
        if (currentTab === 'standings') {
            loadStandings();
        } else {
            loadLiveScores();
        }
    } else {
        alert('Please enter an API key');
    }
}

function showSettings() {
    document.getElementById('settingsPanel').style.display = 'block';
    document.getElementById('apiKeyInput').value = apiKey;
}

function closeSettings() {
    document.getElementById('settingsPanel').style.display = 'none';
}

// Tab Management
function switchTab(tabName) {
    currentTab = tabName;
    
    // Update tab buttons
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));
    
    if (tabName === 'standings') {
        document.getElementById('standingsTab').classList.add('active');
        loadStandings();
        stopAutoRefresh();
    } else if (tabName === 'live') {
        document.getElementById('liveTab').classList.add('active');
        loadLiveScores();
        startAutoRefresh();
    }
}

// Auto-refresh for live scores
function startAutoRefresh() {
    stopAutoRefresh(); // Clear any existing interval
    autoRefreshInterval = setInterval(() => {
        if (currentTab === 'live') {
            loadLiveScores();
        }
    }, 60000); // Refresh every 60 seconds
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

// API Calls
async function fetchAPI(endpoint) {
    if (!apiKey) {
        throw new Error('API key not configured. Please set your API key in Settings.');
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'X-Auth-Token': apiKey
        }
    });
    
    if (!response.ok) {
        if (response.status === 403) {
            throw new Error('Invalid API key. Please check your settings.');
        } else if (response.status === 429) {
            throw new Error('API rate limit exceeded. Please try again later.');
        }
        throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
}

// Load Standings
async function loadStandings() {
    const container = document.getElementById('standingsContainer');
    const leagueCode = document.getElementById('leagueSelect').value;
    const competitionId = COMPETITION_IDS[leagueCode];
    
    container.innerHTML = '<div class="loading">Loading standings...</div>';
    
    try {
        const data = await fetchAPI(`/competitions/${competitionId}/standings`);
        displayStandings(data, leagueCode);
        updateLastUpdateTime();
    } catch (error) {
        container.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
}

function displayStandings(data, leagueCode) {
    const container = document.getElementById('standingsContainer');
    
    // Get the standings - could be in different formats depending on competition
    let standings = [];
    if (data.standings && data.standings.length > 0) {
        // For league competitions, use the first standings group
        standings = data.standings[0].table || data.standings[0];
    }
    
    if (!standings || standings.length === 0) {
        container.innerHTML = '<div class="no-data">No standings data available for this league.</div>';
        return;
    }
    
    let html = '<table class="standings-table">';
    html += '<thead><tr>';
    html += '<th class="rightborder">Pos</th>';
    html += '<th style="text-align: left;">Team</th>';
    html += '<th>P</th>';
    html += '<th>W</th>';
    html += '<th>D</th>';
    html += '<th>L</th>';
    html += '<th class="rightborder">Pts</th>';
    html += '</tr></thead>';
    html += '<tbody>';
    
    standings.forEach((team, index) => {
        html += '<tr>';
        html += `<td class="rightborder">${team.position || (index + 1)}</td>`;
        html += `<td class="team-name">${team.team.name || team.team.shortName}</td>`;
        html += `<td>${team.playedGames || 0}</td>`;
        html += `<td>${team.won || 0}</td>`;
        html += `<td>${team.draw || 0}</td>`;
        html += `<td>${team.lost || 0}</td>`;
        html += `<td class="rightborder"><strong>${team.points || 0}</strong></td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Load Live Scores
async function loadLiveScores() {
    const container = document.getElementById('liveScoresContainer');
    const leagueCode = document.getElementById('liveLeagueSelect').value;
    const competitionId = COMPETITION_IDS[leagueCode];
    
    container.innerHTML = '<div class="loading">Loading live scores...</div>';
    
    try {
        const data = await fetchAPI(`/competitions/${competitionId}/matches?status=SCHEDULED,LIVE,IN_PLAY,PAUSED,FINISHED`);
        displayLiveScores(data);
        updateLastUpdateTime();
    } catch (error) {
        container.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
}

function displayLiveScores(data) {
    const container = document.getElementById('liveScoresContainer');
    
    if (!data.matches || data.matches.length === 0) {
        container.innerHTML = '<div class="no-data">No matches available for this league.</div>';
        return;
    }
    
    // Sort matches: LIVE first, then by date
    const matches = data.matches.sort((a, b) => {
        const liveStatuses = ['LIVE', 'IN_PLAY', 'PAUSED'];
        const aIsLive = liveStatuses.includes(a.status);
        const bIsLive = liveStatuses.includes(b.status);
        
        if (aIsLive && !bIsLive) return -1;
        if (!aIsLive && bIsLive) return 1;
        
        return new Date(b.utcDate) - new Date(a.utcDate);
    });
    
    // Show only recent matches (last 10)
    const recentMatches = matches.slice(0, 10);
    
    let html = '';
    recentMatches.forEach(match => {
        html += createMatchHTML(match);
    });
    
    container.innerHTML = html;
}

function createMatchHTML(match) {
    const status = getMatchStatus(match);
    const statusClass = getStatusClass(match.status);
    const matchDate = new Date(match.utcDate);
    const dateStr = matchDate.toLocaleDateString() + ' ' + matchDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    let html = '<div class="match-container">';
    html += '<div class="match-header">';
    html += `<span>${dateStr}</span>`;
    html += `<span class="match-status ${statusClass}">${status}</span>`;
    html += '</div>';
    
    html += '<div class="match-teams">';
    html += '<div class="team">';
    html += `<div class="team-name">${match.homeTeam.name || match.homeTeam.shortName}</div>`;
    html += '</div>';
    
    // Score or VS
    if (match.status === 'SCHEDULED' || match.status === 'TIMED') {
        html += '<div class="vs">vs</div>';
    } else {
        html += `<div class="score">${match.score.fullTime.home || 0} - ${match.score.fullTime.away || 0}</div>`;
    }
    
    html += '<div class="team">';
    html += `<div class="team-name">${match.awayTeam.name || match.awayTeam.shortName}</div>`;
    html += '</div>';
    html += '</div>';
    
    html += '</div>';
    return html;
}

function getMatchStatus(match) {
    const statusMap = {
        'SCHEDULED': 'SCHEDULED',
        'TIMED': 'SCHEDULED',
        'IN_PLAY': 'LIVE',
        'PAUSED': 'HALFTIME',
        'FINISHED': 'FINISHED',
        'POSTPONED': 'POSTPONED',
        'SUSPENDED': 'SUSPENDED',
        'CANCELLED': 'CANCELLED'
    };
    
    return statusMap[match.status] || match.status;
}

function getStatusClass(status) {
    if (status === 'IN_PLAY') return 'status-live';
    if (status === 'PAUSED') return 'status-halftime';
    if (status === 'FINISHED') return 'status-finished';
    return 'status-scheduled';
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    document.getElementById('lastUpdate').textContent = `Last updated: ${timeStr}`;
}
