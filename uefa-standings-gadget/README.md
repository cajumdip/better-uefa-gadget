# UEFA Football Standings Gadget

A retro Windows Sidebar Gadget that displays live UEFA football standings and match scores for **Eredivisie**, **Champions League**, and **Europa League** with an authentic early-2000s web design aesthetic!

![Gadget Preview](https://img.shields.io/badge/Style-Retro%202000s-blue?style=flat-square)
![Windows Sidebar](https://img.shields.io/badge/Platform-Windows%20Sidebar-lightgrey?style=flat-square)

## Features

### 📊 Standings Tab
- View complete league tables with:
  - Position
  - Team name
  - Games played
  - Wins, Draws, Losses
  - Total Points
- Switch between three leagues using dropdown selector
- Classic table-based layout with bordered cells

### ⚽ Live Scores Tab
- Real-time match scores and updates
- Match status indicators:
  - **🔴 LIVE** - Blinking red indicator for ongoing matches
  - **🟠 HALFTIME** - Orange indicator for halftime
  - **⚫ FINISHED** - Grey indicator for completed matches
  - **📅 SCHEDULED** - Upcoming matches
- Auto-refresh every 60 seconds during live matches
- Recent match history

### 🎨 Retro 2000s Design
The gadget features an authentic early-2000s web aesthetic:
- **Color Scheme**: Blue tones (#1E5579, #E6EEF7, #85A0B0)
- **Typography**: Verdana font family (classic!)
- **Visual Effects**:
  - Beveled panels with gradients
  - Table borders in true Web 1.0 style
  - Blinking LIVE indicators
  - Classic scrollbars
  - Retro button styling

## Installation

### Step 1: Get Your Free API Key

1. Visit [football-data.org](https://www.football-data.org)
2. Click **"Register"** to create a free account
3. After registration, go to your account dashboard
4. Copy your **API key** (you'll need this later)

**Note**: The free tier allows 10 requests per minute, which is perfect for this gadget!

### Step 2: Install the Gadget

#### For Windows Vista/7 (Native Support):

1. Download this repository as a ZIP file
2. Extract the `uefa-standings-gadget` folder
3. Compress the `uefa-standings-gadget` folder into a ZIP file
4. Rename the `.zip` extension to `.gadget`
5. Double-click the `.gadget` file to install
6. The gadget will appear in your Windows Sidebar

#### For Windows 10/11 (Requires Gadget Revival):

Windows 10/11 removed native Sidebar support, but you can restore it:

1. Download **8GadgetPack** from [8gadgetpack.net](https://8gadgetpack.net)
2. Install 8GadgetPack on your system
3. Follow the same steps as above to create the `.gadget` file
4. Double-click to install, or:
   - Right-click on desktop
   - Select "Gadgets"
   - Drag the gadget to your desktop

### Step 3: Configure API Key

1. After installation, click the **⚙ Settings** button in the gadget
2. Paste your football-data.org API key
3. Click **Save Settings**
4. The gadget will now fetch live data!

## Usage

### Switching Between Views

- **Standings Tab**: Click the "Standings" tab to view league tables
- **Live Scores Tab**: Click the "Live Scores" tab to see match results
- Use the dropdown menu in each tab to switch between leagues:
  - Eredivisie (Dutch League)
  - Champions League
  - Europa League

### Auto-Refresh

- Standings are loaded when you switch leagues
- Live scores auto-refresh every 60 seconds when the tab is active
- Manual refresh: Switch to another league and back

## File Structure

```
uefa-standings-gadget/
├── gadget.xml          # Gadget manifest configuration
├── main.html           # Main gadget interface
├── css/
│   └── style.css       # Retro 2000s styling
├── js/
│   └── gadget.js       # API integration and functionality
├── images/
│   └── icon.png        # Gadget icon (64x64)
└── README.md           # This file
```

## Technical Details

### API Integration

- **Data Source**: [football-data.org](https://www.football-data.org) API v4
- **Endpoints Used**:
  - `/competitions/{id}/standings` - League tables
  - `/competitions/{id}/matches` - Match results and fixtures
- **Competition IDs**:
  - Eredivisie: `DED`
  - Champions League: `CL`
  - Europa League: `EL`

### Browser Compatibility

The gadget uses standard HTML, CSS, and JavaScript (ES6+):
- Designed for Internet Explorer 8+ (Windows Sidebar engine)
- Uses `localStorage` for settings persistence
- No external dependencies

### Customization

You can customize the gadget by editing:
- **Colors**: Modify CSS color values in `css/style.css`
- **Refresh Rate**: Change `AUTO_REFRESH_INTERVAL` constant in `js/gadget.js`
- **Number of Matches**: Adjust `MAX_MATCHES_DISPLAY` constant in `js/gadget.js`

## Troubleshooting

### "API key not configured" Error
- Click the Settings button (⚙)
- Enter your API key from football-data.org
- Click Save Settings

### "Invalid API key" Error
- Verify your API key at [football-data.org](https://www.football-data.org)
- Make sure you copied the entire key
- Check that your account is active

### "API rate limit exceeded" Error
- The free tier allows 10 requests/minute
- Wait a few minutes before refreshing
- Consider reducing auto-refresh frequency

### No Data Showing
- Check your internet connection
- Verify the league has active data
- Some leagues may be in off-season

### Gadget Won't Install on Windows 10/11
- Install [8GadgetPack](https://8gadgetpack.net) first
- Make sure the folder is properly zipped
- Verify the file extension is `.gadget` (not `.zip`)

## Development

### Testing Locally

1. Extract the gadget folder
2. Open `main.html` in a web browser
3. Open browser developer tools (F12)
4. Configure your API key via Settings
5. Test functionality

### API Documentation

- Full API docs: [football-data.org/documentation](https://www.football-data.org/documentation/quickstart)
- Rate limits: 10 requests/minute (free tier)
- Available competitions: Check API docs for complete list

## Credits

- **Design Inspiration**: Early 2000s web design from LearnWebDesignOnline.com
- **Data Provider**: [football-data.org](https://www.football-data.org)
- **Windows Sidebar**: Microsoft (RIP)

## License

This project is provided as-is for educational and personal use. Please respect the terms of service of football-data.org when using their API.

## Contributing

Feel free to submit issues or pull requests to improve the gadget!

---

**Enjoy your nostalgic trip back to the 2000s while keeping up with modern football! ⚽📺**
