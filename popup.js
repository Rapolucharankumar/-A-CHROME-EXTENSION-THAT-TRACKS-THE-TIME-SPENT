// Popup script for Website Time Tracker
class PopupManager {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadTodayData();
    await this.loadCurrentSite();
    this.setupEventListeners();
  }

  async loadTodayData() {
    try {
      const response = await this.sendMessage({ action: 'getTodayData' });
      this.updateStats(response);
      this.updateTopSites(response);
    } catch (error) {
      console.error('Error loading today data:', error);
    }
  }

  async loadCurrentSite() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        const domain = this.extractDomain(tab.url);
        document.getElementById('currentSiteName').textContent = domain;
      }
    } catch (error) {
      console.error('Error loading current site:', error);
    }
  }

  updateStats(data) {
    let totalTime = 0;
    let productiveTime = 0;
    let unproductiveTime = 0;

    Object.values(data).forEach(site => {
      totalTime += site.totalTime;
      if (site.category === 'productive') {
        productiveTime += site.totalTime;
      } else if (site.category === 'unproductive') {
        unproductiveTime += site.totalTime;
      }
    });

    // Update time displays
    document.getElementById('totalTime').textContent = this.formatTime(totalTime);
    document.getElementById('productiveTime').textContent = this.formatTime(productiveTime);
    document.getElementById('unproductiveTime').textContent = this.formatTime(unproductiveTime);

    // Update productivity score
    const productivityPercentage = totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0;
    document.getElementById('scoreValue').textContent = `${productivityPercentage}%`;

    // Update score color based on productivity
    const scoreElement = document.getElementById('productivityScore');
    scoreElement.className = 'productivity-score';
    if (productivityPercentage >= 70) {
      scoreElement.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
    } else if (productivityPercentage >= 40) {
      scoreElement.style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
    } else {
      scoreElement.style.background = 'linear-gradient(135deg, #F44336, #D32F2F)';
    }
  }

  updateTopSites(data) {
    const sitesList = document.getElementById('topSites');
    
    if (Object.keys(data).length === 0) {
      sitesList.innerHTML = '<div class="loading">No data for today</div>';
      return;
    }

    // Sort sites by time spent
    const sortedSites = Object.entries(data)
      .sort(([,a], [,b]) => b.totalTime - a.totalTime)
      .slice(0, 5); // Show top 5

    sitesList.innerHTML = sortedSites.map(([domain, siteData]) => `
      <div class="site-item">
        <div class="site-info">
          <div class="site-name">${domain}</div>
          <div class="site-time">${this.formatTime(siteData.totalTime)} • ${siteData.visits} visits</div>
        </div>
        <div class="site-category category-${siteData.category}">
          ${siteData.category}
        </div>
      </div>
    `).join('');
  }

  formatTime(milliseconds) {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return '< 1m';
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

  setupEventListeners() {
    // Dashboard button
    document.getElementById('openDashboard').addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    });

    // Settings button
    document.getElementById('openSettings').addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    });
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});
