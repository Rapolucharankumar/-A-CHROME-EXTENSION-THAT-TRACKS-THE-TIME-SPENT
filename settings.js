// Settings script for Website Time Tracker
class SettingsManager {
  constructor() {
    this.currentSettings = null;
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners();
    this.setupTabs();
  }

  async loadSettings() {
    try {
      const response = await this.sendMessage({ action: 'getSettings' });
      this.currentSettings = response;
      this.populateSettings();
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  populateSettings() {
    // Populate website categories
    this.populateSiteList('productiveSites', this.currentSettings.productiveSites);
    this.populateSiteList('unproductiveSites', this.currentSettings.unproductiveSites);

    // Populate general settings
    document.getElementById('notificationsEnabled').checked = this.currentSettings.notifications;
    document.getElementById('dailyGoal').value = Math.round(this.currentSettings.dailyGoal / (1000 * 60 * 60));
    document.getElementById('inactivityThreshold').value = 30; // Default value
  }

  populateSiteList(containerId, sites) {
    const container = document.getElementById(containerId);
    
    if (sites.length === 0) {
      container.innerHTML = '<div class="loading">No sites added yet</div>';
      return;
    }

    container.innerHTML = sites.map(site => `
      <div class="site-item">
        <span class="site-name">${site}</span>
        <button class="remove-btn" data-site="${site}">Remove</button>
      </div>
    `).join('');

    // Add remove event listeners
    container.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.removeSite(containerId, e.target.dataset.site);
      });
    });
  }

  setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.category-panel');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        
        // Update active tab
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active panel
        panels.forEach(panel => panel.classList.remove('active'));
        document.getElementById(`${category}-panel`).classList.add('active');
      });
    });
  }

  setupEventListeners() {
    // Add site buttons
    document.getElementById('addProductiveBtn').addEventListener('click', () => {
      this.addSite('productiveSites', 'addProductiveSite');
    });

    document.getElementById('addUnproductiveBtn').addEventListener('click', () => {
      this.addSite('unproductiveSites', 'addUnproductiveSite');
    });

    // Enter key support for input fields
    document.getElementById('addProductiveSite').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addSite('productiveSites', 'addProductiveSite');
      }
    });

    document.getElementById('addUnproductiveSite').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addSite('unproductiveSites', 'addUnproductiveSite');
      }
    });

    // Save settings
    document.getElementById('saveSettings').addEventListener('click', () => {
      this.saveSettings();
    });

    // Back to dashboard
    document.getElementById('backToDashboard').addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });

    // Export data
    document.getElementById('exportData').addEventListener('click', () => {
      this.exportData();
    });

    // Clear data
    document.getElementById('clearData').addEventListener('click', () => {
      this.clearData();
    });
  }

  addSite(containerId, inputId) {
    const input = document.getElementById(inputId);
    const site = input.value.trim().toLowerCase();

    if (!site) {
      alert('Please enter a site name');
      return;
    }

    // Validate site format
    if (!this.isValidSite(site)) {
      alert('Please enter a valid site name (e.g., github.com)');
      return;
    }

    // Check if site already exists
    const existingSites = this.getSitesFromContainer(containerId);
    if (existingSites.includes(site)) {
      alert('This site is already in the list');
      return;
    }

    // Add to current settings
    if (containerId === 'productiveSites') {
      this.currentSettings.productiveSites.push(site);
    } else {
      this.currentSettings.unproductiveSites.push(site);
    }

    // Update display
    this.populateSiteList(containerId, this.getSitesFromContainer(containerId));
    input.value = '';
  }

  removeSite(containerId, site) {
    if (confirm(`Are you sure you want to remove ${site}?`)) {
      if (containerId === 'productiveSites') {
        this.currentSettings.productiveSites = this.currentSettings.productiveSites.filter(s => s !== site);
      } else {
        this.currentSettings.unproductiveSites = this.currentSettings.unproductiveSites.filter(s => s !== site);
      }

      this.populateSiteList(containerId, this.getSitesFromContainer(containerId));
    }
  }

  getSitesFromContainer(containerId) {
    if (containerId === 'productiveSites') {
      return this.currentSettings.productiveSites;
    } else {
      return this.currentSettings.unproductiveSites;
    }
  }

  isValidSite(site) {
    // Basic validation for site names
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,}|[a-zA-Z]{2,}\.[a-zA-Z]{2,})$/;
    return domainRegex.test(site) || site.includes('.');
  }

  async saveSettings() {
    try {
      // Update settings object
      this.currentSettings.notifications = document.getElementById('notificationsEnabled').checked;
      this.currentSettings.dailyGoal = parseInt(document.getElementById('dailyGoal').value) * 60 * 60 * 1000; // Convert to milliseconds

      // Save to storage
      await this.sendMessage({
        action: 'updateSettings',
        settings: this.currentSettings
      });

      // Show success message
      this.showMessage('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showMessage('Error saving settings. Please try again.', 'error');
    }
  }

  async exportData() {
    try {
      const weeklyData = await this.sendMessage({ action: 'getWeeklyData' });
      const dataStr = JSON.stringify({
        settings: this.currentSettings,
        timeData: weeklyData,
        exportDate: new Date().toISOString()
      }, null, 2);
      
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `website-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      this.showMessage('Data exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      this.showMessage('Error exporting data. Please try again.', 'error');
    }
  }

  async clearData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        await chrome.storage.local.clear();
        this.showMessage('All data cleared successfully!', 'success');
        
        // Reload settings
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        console.error('Error clearing data:', error);
        this.showMessage('Error clearing data. Please try again.', 'error');
      }
    }
  }

  showMessage(message, type) {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      animation: slideIn 0.3s ease;
      ${type === 'success' ? 'background: #4CAF50;' : 'background: #F44336;'}
    `;

    document.body.appendChild(messageEl);

    // Remove message after 3 seconds
    setTimeout(() => {
      messageEl.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(messageEl);
      }, 300);
    }, 3000);
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

// Add CSS for message animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize settings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SettingsManager();
});
