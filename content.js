// Content script for Website Time Tracker
// This script runs on all web pages to track user activity

class ContentTracker {
  constructor() {
    this.isActive = true;
    this.lastActivity = Date.now();
    this.activityThreshold = 30000; // 30 seconds of inactivity
    
    this.setupActivityTracking();
    this.setupVisibilityTracking();
  }

  setupActivityTracking() {
    // Track user activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.lastActivity = Date.now();
        this.isActive = true;
      }, true);
    });

    // Check for inactivity every 10 seconds
    setInterval(() => {
      const timeSinceActivity = Date.now() - this.lastActivity;
      if (timeSinceActivity > this.activityThreshold) {
        this.isActive = false;
      }
    }, 10000);
  }

  setupVisibilityTracking() {
    // Track when page becomes visible/hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isActive = false;
      } else {
        this.isActive = true;
        this.lastActivity = Date.now();
      }
    });

    // Track window focus/blur
    window.addEventListener('focus', () => {
      this.isActive = true;
      this.lastActivity = Date.now();
    });

    window.addEventListener('blur', () => {
      this.isActive = false;
    });
  }

  // Method to check if user is currently active
  isUserActive() {
    return this.isActive && !document.hidden;
  }
}

// Initialize content tracker
const contentTracker = new ContentTracker();

// Send activity status to background script periodically
setInterval(() => {
  chrome.runtime.sendMessage({
    action: 'updateActivityStatus',
    isActive: contentTracker.isUserActive(),
    timestamp: Date.now()
  });
}, 5000); // Send every 5 seconds
