// Background script for Website Time Tracker
class TimeTracker {
  constructor() {
    this.currentTab = null;
    this.startTime = null;
    this.isActive = true;
    this.websiteCategories = this.initializeCategories();
    
    this.setupEventListeners();
    this.loadSettings();
  }

  initializeCategories() {
    return {
      productive: [
        'github.com', 'stackoverflow.com', 'developer.mozilla.org', 'w3schools.com',
        'codepen.io', 'jsfiddle.net', 'repl.it', 'leetcode.com', 'hackerrank.com',
        'coursera.org', 'udemy.com', 'edx.org', 'khanacademy.org', 'freecodecamp.org',
        'medium.com', 'dev.to', 'hashnode.com', 'atlassian.com', 'notion.so',
        'trello.com', 'asana.com', 'slack.com', 'zoom.us', 'teams.microsoft.com'
      ],
      unproductive: [
        'facebook.com', 'instagram.com', 'twitter.com', 'tiktok.com', 'snapchat.com',
        'reddit.com', 'youtube.com', 'netflix.com', 'twitch.tv', 'discord.com',
        'pinterest.com', 'tumblr.com', 'linkedin.com', 'whatsapp.com', 'telegram.org',
        'spotify.com', 'soundcloud.com', '9gag.com', 'buzzfeed.com', 'mashable.com'
      ]
    };
  }

  setupEventListeners() {
    // Track tab activation
    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.handleTabChange(activeInfo.tabId);
    });

    // Track tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.active) {
        this.handleTabChange(tabId);
      }
    });

    // Track window focus changes
    chrome.windows.onFocusChanged.addListener((windowId) => {
      if (windowId === chrome.windows.WINDOW_ID_NONE) {
        this.handleWindowBlur();
      } else {
        this.handleWindowFocus();
      }
    });

    // Handle extension installation
    chrome.runtime.onInstalled.addListener(() => {
      this.initializeData();
    });

    // Handle messages from popup/content scripts
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async response
    });
  }

  async handleTabChange(tabId) {
    // Save previous tab time
    if (this.currentTab && this.startTime) {
      await this.saveTimeData(this.currentTab);
    }

    // Get new tab info
    try {
      const tab = await chrome.tabs.get(tabId);
      if (tab.url && this.isValidUrl(tab.url)) {
        this.currentTab = {
          id: tabId,
          url: tab.url,
          domain: this.extractDomain(tab.url),
          title: tab.title
        };
        this.startTime = Date.now();
      }
    } catch (error) {
      console.error('Error getting tab info:', error);
    }
  }

  handleWindowBlur() {
    this.isActive = false;
    if (this.currentTab && this.startTime) {
      this.saveTimeData(this.currentTab);
    }
  }

  handleWindowFocus() {
    this.isActive = true;
    if (this.currentTab) {
      this.startTime = Date.now();
    }
  }

  async saveTimeData(tab) {
    if (!this.startTime) return;

    const timeSpent = Date.now() - this.startTime;
    const domain = this.extractDomain(tab.url);
    const category = this.categorizeWebsite(domain);
    
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const result = await chrome.storage.local.get(['timeData']);
      const timeData = result.timeData || {};
      
      if (!timeData[today]) {
        timeData[today] = {};
      }
      
      if (!timeData[today][domain]) {
        timeData[today][domain] = {
          totalTime: 0,
          visits: 0,
          category: category,
          lastVisit: new Date().toISOString()
        };
      }
      
      timeData[today][domain].totalTime += timeSpent;
      timeData[today][domain].visits += 1;
      timeData[today][domain].lastVisit = new Date().toISOString();
      
      await chrome.storage.local.set({ timeData });
      
      // Update badge
      this.updateBadge(timeData[today]);
      
    } catch (error) {
      console.error('Error saving time data:', error);
    }
  }

  categorizeWebsite(domain) {
    const productiveDomains = this.websiteCategories.productive;
    const unproductiveDomains = this.websiteCategories.unproductive;
    
    if (productiveDomains.some(d => domain.includes(d))) {
      return 'productive';
    } else if (unproductiveDomains.some(d => domain.includes(d))) {
      return 'unproductive';
    } else {
      return 'neutral';
    }
  }

  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch (error) {
      return url;
    }
  }

  isValidUrl(url) {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  updateBadge(todayData) {
    let totalTime = 0;
    let productiveTime = 0;
    
    Object.values(todayData).forEach(site => {
      totalTime += site.totalTime;
      if (site.category === 'productive') {
        productiveTime += site.totalTime;
      }
    });
    
    const productivePercentage = totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0;
    const hours = Math.floor(totalTime / (1000 * 60 * 60));
    const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));
    
    chrome.action.setBadgeText({
      text: `${productivePercentage}%`
    });
    
    chrome.action.setBadgeBackgroundColor({
      color: productivePercentage >= 70 ? '#4CAF50' : productivePercentage >= 40 ? '#FF9800' : '#F44336'
    });
  }

  async handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'getTodayData':
        const todayData = await this.getTodayData();
        sendResponse(todayData);
        break;
      case 'getWeeklyData':
        const weeklyData = await this.getWeeklyData();
        sendResponse(weeklyData);
        break;
      case 'getSettings':
        const settings = await this.getSettings();
        sendResponse(settings);
        break;
      case 'updateSettings':
        await this.updateSettings(request.settings);
        sendResponse({ success: true });
        break;
      default:
        sendResponse({ error: 'Unknown action' });
    }
  }

  async getTodayData() {
    const today = new Date().toISOString().split('T')[0];
    const result = await chrome.storage.local.get(['timeData']);
    return result.timeData?.[today] || {};
  }

  async getWeeklyData() {
    const result = await chrome.storage.local.get(['timeData']);
    const timeData = result.timeData || {};
    
    const weeklyData = {};
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      weeklyData[dateStr] = timeData[dateStr] || {};
    }
    
    return weeklyData;
  }

  async getSettings() {
    const result = await chrome.storage.local.get(['settings']);
    return result.settings || {
      productiveSites: this.websiteCategories.productive,
      unproductiveSites: this.websiteCategories.unproductive,
      notifications: true,
      dailyGoal: 8 * 60 * 60 * 1000 // 8 hours in milliseconds
    };
  }

  async updateSettings(newSettings) {
    await chrome.storage.local.set({ settings: newSettings });
  }

  async loadSettings() {
    const settings = await this.getSettings();
    this.websiteCategories.productive = settings.productiveSites;
    this.websiteCategories.unproductive = settings.unproductiveSites;
  }

  async initializeData() {
    const result = await chrome.storage.local.get(['timeData', 'settings']);
    
    if (!result.timeData) {
      await chrome.storage.local.set({ timeData: {} });
    }
    
    if (!result.settings) {
      await chrome.storage.local.set({ 
        settings: {
          productiveSites: this.websiteCategories.productive,
          unproductiveSites: this.websiteCategories.unproductive,
          notifications: true,
          dailyGoal: 8 * 60 * 60 * 1000
        }
      });
    }
  }
}

// Initialize the time tracker
const timeTracker = new TimeTracker();
