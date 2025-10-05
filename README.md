# Website Time Tracker Chrome Extension

A comprehensive Chrome extension that tracks time spent on different websites and provides detailed productivity analytics. The extension helps users understand their browsing habits and improve their online productivity.

## Features

### 🕒 Time Tracking
- **Automatic Tracking**: Monitors time spent on each website automatically
- **Real-time Updates**: Updates statistics in real-time as you browse
- **Inactivity Detection**: Pauses tracking when you're away from the computer
- **Tab Switching**: Accurately tracks time when switching between tabs

### 📊 Productivity Analytics
- **Website Classification**: Automatically categorizes websites as productive, unproductive, or neutral
- **Productivity Score**: Calculates daily productivity percentage based on time spent on productive vs unproductive sites
- **Visual Dashboard**: Beautiful charts and graphs showing your browsing patterns
- **Weekly Reports**: Comprehensive weekly productivity reports with insights

### 🎯 Customization
- **Custom Categories**: Add or remove websites from productive/unproductive lists
- **Settings Panel**: Configure notifications, daily goals, and tracking preferences
- **Data Export**: Export your data for backup or analysis
- **Privacy Focused**: All data stored locally in your browser

### 📱 User Interface
- **Popup Interface**: Quick overview of today's statistics
- **Analytics Dashboard**: Detailed charts and reports
- **Settings Page**: Easy configuration of all options
- **Responsive Design**: Works on all screen sizes

## Installation

### Method 1: Load as Unpacked Extension (Development)

1. **Download the Extension**
   - Download all the extension files to a folder on your computer

2. **Open Chrome Extensions Page**
   - Open Chrome and navigate to `chrome://extensions/`
   - Or go to Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

5. **Pin the Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Website Time Tracker" and click the pin icon

### Method 2: Package and Install

1. **Package the Extension**
   - In Chrome Extensions page, click "Pack extension"
   - Select the extension folder
   - This will create a `.crx` file

2. **Install the Package**
   - Drag the `.crx` file to the Chrome Extensions page
   - Click "Add extension" when prompted

## Usage

### Getting Started

1. **First Launch**
   - Click the extension icon in your Chrome toolbar
   - The popup will show your current productivity score
   - Click "Open Dashboard" for detailed analytics

2. **Understanding the Data**
   - **Productivity Score**: Percentage of time spent on productive websites
   - **Total Time**: Total browsing time for the day
   - **Top Sites**: Most visited websites with time spent

### Using the Dashboard

1. **Overview Cards**
   - View total time, productive time, unproductive time, and productivity score
   - Cards update in real-time as you browse

2. **Charts**
   - **Weekly Trend**: Line chart showing productivity over the week
   - **Category Distribution**: Pie chart showing time distribution by category

3. **Top Sites Table**
   - See your most visited websites for the week
   - View time spent, visit count, and category for each site

4. **Daily Breakdown**
   - Day-by-day breakdown of your browsing activity
   - Quick overview of daily productivity scores

5. **Weekly Report**
   - Comprehensive analysis of your week
   - Key insights and recommendations
   - Export data for further analysis

### Customizing Settings

1. **Website Categories**
   - Go to Settings page
   - Switch between "Productive Sites" and "Unproductive Sites" tabs
   - Add or remove websites from each category
   - Sites are automatically categorized based on your lists

2. **General Settings**
   - **Notifications**: Enable/disable productivity notifications
   - **Daily Goal**: Set your daily browsing time goal
   - **Inactivity Threshold**: Set how long to wait before considering you away

3. **Data Management**
   - **Export Data**: Download your data as JSON file
   - **Clear Data**: Reset all tracking data (irreversible)

## Default Website Categories

### Productive Sites
- GitHub, Stack Overflow, MDN Web Docs
- Educational platforms (Coursera, Udemy, Khan Academy)
- Development tools (CodePen, JSFiddle, Repl.it)
- Productivity tools (Notion, Trello, Asana)
- Professional communication (Slack, Zoom, Teams)

### Unproductive Sites
- Social media (Facebook, Instagram, Twitter, TikTok)
- Entertainment (YouTube, Netflix, Twitch)
- News and forums (Reddit, BuzzFeed, 9GAG)
- Messaging apps (WhatsApp, Telegram, Discord)

## Privacy & Security

- **Local Storage**: All data is stored locally in your browser
- **No External Servers**: No data is sent to external servers
- **No Personal Information**: Only website domains and time spent are tracked
- **User Control**: You can export or delete your data at any time

## Technical Details

### Architecture
- **Manifest V3**: Uses the latest Chrome extension API
- **Service Worker**: Background script for continuous tracking
- **Content Scripts**: Monitor user activity on web pages
- **Chrome Storage API**: Local data persistence
- **Chart.js**: Interactive charts and graphs

### File Structure
```
website-time-tracker/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for tracking
├── content.js            # Content script for activity monitoring
├── popup.html            # Extension popup interface
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
├── dashboard.html        # Analytics dashboard
├── dashboard.css         # Dashboard styling
├── dashboard.js          # Dashboard functionality
├── settings.html         # Settings page
├── settings.css          # Settings styling
├── settings.js           # Settings functionality
└── README.md            # This file
```

## Troubleshooting

### Common Issues

1. **Extension Not Tracking Time**
   - Ensure the extension is enabled in Chrome Extensions page
   - Check that you have the necessary permissions
   - Try refreshing the page or restarting Chrome

2. **Data Not Showing**
   - Clear browser cache and reload the extension
   - Check if data exists in Chrome Storage (Developer Tools → Application → Storage)

3. **Sites Not Categorized Correctly**
   - Go to Settings and manually add sites to appropriate categories
   - The extension learns from your customizations

4. **Performance Issues**
   - The extension is designed to be lightweight
   - If experiencing slowdowns, try clearing old data or reducing tracking frequency

### Getting Help

- Check the Chrome Extensions page for error messages
- Use Chrome Developer Tools to debug issues
- Ensure you're using a supported Chrome version (88+)

## Development

### Building from Source

1. **Clone/Download** the extension files
2. **Modify** the code as needed
3. **Test** by loading as unpacked extension
4. **Package** for distribution

### Contributing

- Fork the repository
- Create a feature branch
- Make your changes
- Test thoroughly
- Submit a pull request

## License

This project is open source and available under the MIT License.

## Version History

### v1.0.0
- Initial release
- Basic time tracking functionality
- Productivity analytics dashboard
- Website categorization system
- Settings and customization options
- Data export capabilities

---

**Note**: This extension is designed for personal productivity improvement. Always respect website terms of service and use responsibly.
#   - A - C H R O M E - E X T E N S I O N - T H A T - T R A C K S - T H E - T I M E - S P E N T  
 