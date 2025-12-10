// UEFA Standings Gadget JavaScript - IE7/IE8 Compatible

// Configuration
var API_BASE_URL = 'https://api.football-data.org/v4';
var AUTO_REFRESH_INTERVAL = 60000; // 60 seconds
var MAX_MATCHES_DISPLAY = 10; // Maximum number of matches to display

var LEAGUE_CODES = {
    'DED': 'Eredivisie',
    'CL': 'Champions League',
    'WC': 'FIFA World Cup'
};

var COMPETITION_IDS = {
    'DED': 'DED',    // Eredivisie
    'CL': 'CL',      // Champions League
    'WC': 'WC'       // FIFA World Cup
};

var apiKey = '';
var autoRefreshInterval = null;
var currentTab = 'standings';

// Initialize gadget on load
window.onload = function() {
    loadApiKey();
    loadStandings();
};

// Settings Management
function loadApiKey() {
    // Try to load from localStorage (gadget settings)
    if (typeof(Storage) !== "undefined") {
        var savedKey = localStorage.getItem('footballDataApiKey');
        if (savedKey) {
            apiKey = savedKey;
        }
    }
}

function saveSettings() {
    var keyInput = document.getElementById('apiKeyInput');
    var newKey = keyInput.value;
    if (newKey) {
        newKey = newKey.replace(/^\s+|\s+$/g, ''); // trim
    }
    
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
    var buttons = document.getElementsByTagName('button');
    for (var i = 0; i < buttons.length; i++) {
        var btn = buttons[i];
        if (btn.className.indexOf('tab-button') !== -1) {
            btn.className = btn.className.replace(' active', '').replace('active', '');
        }
    }
    
    // Add active class to clicked button
    if (window.event && window.event.srcElement) {
        var target = window.event.srcElement;
        if (target.className.indexOf('active') === -1) {
            target.className = target.className + ' active';
        }
    }
    
    // Update tab content
    var standingsTab = document.getElementById('standingsTab');
    var liveTab = document.getElementById('liveTab');
    
    if (tabName === 'standings') {
        standingsTab.className = 'tab-content active';
        liveTab.className = 'tab-content';
        loadStandings();
        stopAutoRefresh();
    } else if (tabName === 'live') {
        standingsTab.className = 'tab-content';
        liveTab.className = 'tab-content active';
        loadLiveScores();
        startAutoRefresh();
    }
}

// Auto-refresh for live scores
function startAutoRefresh() {
    stopAutoRefresh(); // Clear any existing interval
    autoRefreshInterval = setInterval(function() {
        if (currentTab === 'live') {
            loadLiveScores();
        }
    }, AUTO_REFRESH_INTERVAL);
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

// API Calls using XMLHttpRequest
function fetchAPI(endpoint, callback, errorCallback) {
    if (!apiKey) {
        errorCallback(new Error('API key not configured. Please set your API key in Settings.'));
        return;
    }
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', API_BASE_URL + endpoint, true);
    xhr.setRequestHeader('X-Auth-Token', apiKey);
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    callback(data);
                } catch (e) {
                    errorCallback(new Error('Failed to parse response'));
                }
            } else if (xhr.status === 403) {
                errorCallback(new Error('Invalid API key. Please check your settings.'));
            } else if (xhr.status === 429) {
                errorCallback(new Error('API rate limit exceeded. Please try again later.'));
            } else {
                errorCallback(new Error('API error: ' + xhr.status));
            }
        }
    };
    
    xhr.send();
}

// Load Standings
function loadStandings() {
    var container = document.getElementById('standingsContainer');
    var leagueCode = document.getElementById('leagueSelect').value;
    var competitionId = COMPETITION_IDS[leagueCode];
    
    container.innerHTML = '<div class="loading">Loading standings...</div>';
    
    fetchAPI('/competitions/' + competitionId + '/standings', 
        function(data) {
            displayStandings(data, leagueCode);
            updateLastUpdateTime();
        },
        function(error) {
            container.innerHTML = '<div class="error">Error: ' + error.message + '</div>';
        }
    );
}

function displayStandings(data, leagueCode) {
    var container = document.getElementById('standingsContainer');
    
    // Get the standings - could be in different formats depending on competition
    var standings = [];
    if (data.standings && data.standings.length > 0) {
        // For league competitions, use the first standings group
        standings = data.standings[0].table || data.standings[0];
    }
    
    if (!standings || standings.length === 0) {
        container.innerHTML = '<div class="no-data">No standings data available for this league.</div>';
        return;
    }
    
    var html = '<table class="standings-table">';
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
    
    for (var i = 0; i < standings.length; i++) {
        var team = standings[i];
        var rowClass = (i % 2 === 1) ? ' class="even"' : '';
        html += '<tr' + rowClass + '>';
        html += '<td class="rightborder">' + (team.position || (i + 1)) + '</td>';
        html += '<td class="team-name">' + (team.team.name || team.team.shortName) + '</td>';
        html += '<td>' + (team.playedGames || 0) + '</td>';
        html += '<td>' + (team.won || 0) + '</td>';
        html += '<td>' + (team.draw || 0) + '</td>';
        html += '<td>' + (team.lost || 0) + '</td>';
        html += '<td class="rightborder"><strong>' + (team.points || 0) + '</strong></td>';
        html += '</tr>';
    }
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Load Live Scores
function loadLiveScores() {
    var container = document.getElementById('liveScoresContainer');
    var leagueCode = document.getElementById('liveLeagueSelect').value;
    var competitionId = COMPETITION_IDS[leagueCode];
    
    container.innerHTML = '<div class="loading">Loading live scores...</div>';
    
    fetchAPI('/competitions/' + competitionId + '/matches?status=SCHEDULED,LIVE,IN_PLAY,PAUSED,FINISHED',
        function(data) {
            displayLiveScores(data);
            updateLastUpdateTime();
        },
        function(error) {
            container.innerHTML = '<div class="error">Error: ' + error.message + '</div>';
        }
    );
}

function displayLiveScores(data) {
    var container = document.getElementById('liveScoresContainer');
    
    if (!data.matches || data.matches.length === 0) {
        container.innerHTML = '<div class="no-data">No matches available for this league.</div>';
        return;
    }
    
    // Sort matches: LIVE first, then by date
    var matches = data.matches.sort(function(a, b) {
        var liveStatuses = ['LIVE', 'IN_PLAY', 'PAUSED'];
        var aIsLive = false;
        var bIsLive = false;
        
        for (var i = 0; i < liveStatuses.length; i++) {
            if (a.status === liveStatuses[i]) aIsLive = true;
            if (b.status === liveStatuses[i]) bIsLive = true;
        }
        
        if (aIsLive && !bIsLive) return -1;
        if (!aIsLive && bIsLive) return 1;
        
        return new Date(b.utcDate) - new Date(a.utcDate);
    });
    
    // Show only recent matches
    var recentMatches = matches.slice(0, MAX_MATCHES_DISPLAY);
    
    var html = '';
    for (var i = 0; i < recentMatches.length; i++) {
        html += createMatchHTML(recentMatches[i]);
    }
    
    container.innerHTML = html;
}

function createMatchHTML(match) {
    var status = getMatchStatus(match);
    var statusClass = getStatusClass(match.status);
    var matchDate = new Date(match.utcDate);
    var dateStr = formatDate(matchDate) + ' ' + formatTime(matchDate);
    
    var html = '<div class="match-container">';
    html += '<div class="match-header">';
    html += '<span class="match-date">' + dateStr + '</span>';
    html += '<span class="match-status-container"><span class="match-status ' + statusClass + '">' + status + '</span></span>';
    html += '<div style="clear: both;"></div>';
    html += '</div>';
    
    html += '<div class="match-teams">';
    html += '<table><tr>';
    html += '<td class="team">';
    html += '<div class="team-name">' + (match.homeTeam.name || match.homeTeam.shortName) + '</div>';
    html += '</td>';
    
    // Score or VS
    if (match.status === 'SCHEDULED' || match.status === 'TIMED') {
        html += '<td class="vs">vs</td>';
    } else {
        var homeScore = match.score.fullTime.home || 0;
        var awayScore = match.score.fullTime.away || 0;
        html += '<td class="score">' + homeScore + ' - ' + awayScore + '</td>';
    }
    
    html += '<td class="team">';
    html += '<div class="team-name">' + (match.awayTeam.name || match.awayTeam.shortName) + '</div>';
    html += '</td>';
    html += '</tr></table>';
    html += '</div>';
    
    html += '</div>';
    return html;
}

function getMatchStatus(match) {
    var statusMap = {
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
    var now = new Date();
    var timeStr = formatTime(now);
    document.getElementById('lastUpdate').textContent = 'Last updated: ' + timeStr;
}

// Helper functions for date/time formatting
function formatDate(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var year = date.getFullYear();
    return month + '/' + day + '/' + year;
}

function formatTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
}
