// Dashboard script for Website Time Tracker
class DashboardManager {
  constructor() {
    this.weeklyChart = null;
    this.categoryChart = null;
    this.init();
  }

  async init() {
    await this.loadData();
    this.setupEventListeners();
    this.setupCharts();
  }

  async loadData() {
    try {
      const weeklyData = await this.sendMessage({ action: 'getWeeklyData' });
      this.updateOverview(weeklyData);
      this.updateTopSites(weeklyData);
      this.updateDailyBreakdown(weeklyData);
      this.generateWeeklyReport(weeklyData);
      this.updateCharts(weeklyData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  updateOverview(weeklyData) {
    const today = new Date().toISOString().split('T')[0];
    const todayData = weeklyData[today] || {};

    let totalTime = 0;
    let productiveTime = 0;
    let unproductiveTime = 0;

    Object.values(todayData).forEach(site => {
      totalTime += site.totalTime;
      if (site.category === 'productive') {
        productiveTime += site.totalTime;
      } else if (site.category === 'unproductive') {
        unproductiveTime += site.totalTime;
      }
    });

    document.getElementById('totalTimeToday').textContent = this.formatTime(totalTime);
    document.getElementById('productiveTimeToday').textContent = this.formatTime(productiveTime);
    document.getElementById('unproductiveTimeToday').textContent = this.formatTime(unproductiveTime);

    const productivityScore = totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0;
    document.getElementById('productivityScore').textContent = `${productivityScore}%`;
  }

  updateTopSites(weeklyData) {
    const sitesMap = new Map();

    // Aggregate data across all days
    Object.values(weeklyData).forEach(dayData => {
      Object.entries(dayData).forEach(([domain, siteData]) => {
        if (sitesMap.has(domain)) {
          const existing = sitesMap.get(domain);
          existing.totalTime += siteData.totalTime;
          existing.visits += siteData.visits;
        } else {
          sitesMap.set(domain, {
            totalTime: siteData.totalTime,
            visits: siteData.visits,
            category: siteData.category
          });
        }
      });
    });

    // Sort by total time and get top 10
    const topSites = Array.from(sitesMap.entries())
      .sort(([,a], [,b]) => b.totalTime - a.totalTime)
      .slice(0, 10);

    const tableBody = document.getElementById('topSitesTable');
    
    if (topSites.length === 0) {
      tableBody.innerHTML = '<div class="loading">No data available</div>';
      return;
    }

    tableBody.innerHTML = topSites.map(([domain, data]) => `
      <div class="table-row">
        <div class="col-domain" data-label="Domain">${domain}</div>
        <div class="col-time" data-label="Time">${this.formatTime(data.totalTime)}</div>
        <div class="col-visits" data-label="Visits">${data.visits}</div>
        <div class="col-category" data-label="Category">
          <span class="category-badge category-${data.category}">${data.category}</span>
        </div>
      </div>
    `).join('');
  }

  updateDailyBreakdown(weeklyData) {
    const dailyBreakdown = document.getElementById('dailyBreakdown');
    const days = Object.keys(weeklyData).sort();

    if (days.length === 0) {
      dailyBreakdown.innerHTML = '<div class="loading">No data available</div>';
      return;
    }

    dailyBreakdown.innerHTML = days.map(date => {
      const dayData = weeklyData[date];
      let totalTime = 0;
      let productiveTime = 0;
      let unproductiveTime = 0;

      Object.values(dayData).forEach(site => {
        totalTime += site.totalTime;
        if (site.category === 'productive') {
          productiveTime += site.totalTime;
        } else if (site.category === 'unproductive') {
          unproductiveTime += site.totalTime;
        }
      });

      const productivityScore = totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0;
      const dateObj = new Date(date);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return `
        <div class="daily-item">
          <div class="daily-date">${dayName}, ${monthDay}</div>
          <div class="daily-stats">
            <span>Total: ${this.formatTime(totalTime)}</span>
            <span>Productive: ${this.formatTime(productiveTime)}</span>
            <span>Score: ${productivityScore}%</span>
          </div>
        </div>
      `;
    }).join('');
  }

  generateWeeklyReport(weeklyData) {
    const reportContent = document.getElementById('weeklyReport');
    
    // Calculate weekly statistics
    let totalTime = 0;
    let productiveTime = 0;
    let unproductiveTime = 0;
    let totalVisits = 0;
    let uniqueSites = new Set();

    Object.values(weeklyData).forEach(dayData => {
      Object.entries(dayData).forEach(([domain, siteData]) => {
        totalTime += siteData.totalTime;
        totalVisits += siteData.visits;
        uniqueSites.add(domain);
        
        if (siteData.category === 'productive') {
          productiveTime += siteData.totalTime;
        } else if (siteData.category === 'unproductive') {
          unproductiveTime += siteData.totalTime;
        }
      });
    });

    const productivityScore = totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0;
    const avgTimePerDay = totalTime / 7;
    const avgVisitsPerDay = totalVisits / 7;

    // Generate insights
    const insights = this.generateInsights(weeklyData, productivityScore);

    reportContent.innerHTML = `
      <div class="report-summary">
        <h4>Weekly Summary</h4>
        <p>This week, you spent a total of <strong>${this.formatTime(totalTime)}</strong> browsing the web across <strong>${uniqueSites.size}</strong> different websites. Your productivity score was <strong>${productivityScore}%</strong>, with an average of <strong>${this.formatTime(avgTimePerDay)}</strong> per day.</p>
      </div>

      <div class="report-insights">
        <div class="insight-card">
          <div class="insight-value">${this.formatTime(totalTime)}</div>
          <div class="insight-label">Total Time</div>
        </div>
        <div class="insight-card">
          <div class="insight-value">${productivityScore}%</div>
          <div class="insight-label">Productivity Score</div>
        </div>
        <div class="insight-card">
          <div class="insight-value">${uniqueSites.size}</div>
          <div class="insight-label">Unique Sites</div>
        </div>
        <div class="insight-card">
          <div class="insight-value">${Math.round(avgVisitsPerDay)}</div>
          <div class="insight-label">Avg Visits/Day</div>
        </div>
      </div>

      <div class="insights-section">
        <h4>Key Insights</h4>
        <ul>
          ${insights.map(insight => `<li>${insight}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  generateInsights(weeklyData, productivityScore) {
    const insights = [];

    // Productivity insights
    if (productivityScore >= 70) {
      insights.push("Excellent productivity! You're spending most of your time on productive websites.");
    } else if (productivityScore >= 40) {
      insights.push("Good balance between productive and unproductive browsing. Consider reducing time on distracting sites.");
    } else {
      insights.push("Consider focusing more on productive websites to improve your productivity score.");
    }

    // Time insights
    const totalTime = Object.values(weeklyData).reduce((total, dayData) => {
      return total + Object.values(dayData).reduce((dayTotal, site) => dayTotal + site.totalTime, 0);
    }, 0);

    const avgTimePerDay = totalTime / 7;
    const hoursPerDay = avgTimePerDay / (1000 * 60 * 60);

    if (hoursPerDay > 8) {
      insights.push("You're spending more than 8 hours per day browsing. Consider taking breaks.");
    } else if (hoursPerDay > 4) {
      insights.push("Moderate browsing time. Good balance between online and offline activities.");
    } else {
      insights.push("Light browsing activity. You're maintaining a good balance.");
    }

    // Site diversity insights
    const allSites = new Set();
    Object.values(weeklyData).forEach(dayData => {
      Object.keys(dayData).forEach(site => allSites.add(site));
    });

    if (allSites.size > 20) {
      insights.push("High site diversity! You're exploring many different websites.");
    } else if (allSites.size > 10) {
      insights.push("Good variety in your browsing habits.");
    } else {
      insights.push("Consider exploring more websites to diversify your online experience.");
    }

    return insights;
  }

  setupCharts() {
    // Weekly productivity chart
    const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');
    this.weeklyChart = new Chart(weeklyCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Productive Time',
          data: [],
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4
        }, {
          label: 'Unproductive Time',
          data: [],
          borderColor: '#F44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return Math.round(value / (1000 * 60 * 60)) + 'h';
              }
            }
          }
        }
      }
    });

    // Category distribution chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    this.categoryChart = new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: ['Productive', 'Unproductive', 'Neutral'],
        datasets: [{
          data: [0, 0, 0],
          backgroundColor: ['#4CAF50', '#F44336', '#FF9800'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          }
        }
      }
    });
  }

  updateCharts(weeklyData) {
    const days = Object.keys(weeklyData).sort();
    const labels = days.map(date => {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    });

    const productiveData = [];
    const unproductiveData = [];

    days.forEach(date => {
      const dayData = weeklyData[date];
      let productiveTime = 0;
      let unproductiveTime = 0;

      Object.values(dayData).forEach(site => {
        if (site.category === 'productive') {
          productiveTime += site.totalTime;
        } else if (site.category === 'unproductive') {
          unproductiveTime += site.totalTime;
        }
      });

      productiveData.push(productiveTime);
      unproductiveData.push(unproductiveTime);
    });

    // Update weekly chart
    this.weeklyChart.data.labels = labels;
    this.weeklyChart.data.datasets[0].data = productiveData;
    this.weeklyChart.data.datasets[1].data = unproductiveData;
    this.weeklyChart.update();

    // Calculate category totals
    let totalProductive = 0;
    let totalUnproductive = 0;
    let totalNeutral = 0;

    Object.values(weeklyData).forEach(dayData => {
      Object.values(dayData).forEach(site => {
        if (site.category === 'productive') {
          totalProductive += site.totalTime;
        } else if (site.category === 'unproductive') {
          totalUnproductive += site.totalTime;
        } else {
          totalNeutral += site.totalTime;
        }
      });
    });

    // Update category chart
    this.categoryChart.data.datasets[0].data = [totalProductive, totalUnproductive, totalNeutral];
    this.categoryChart.update();
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

  setupEventListeners() {
    document.getElementById('refreshData').addEventListener('click', () => {
      this.loadData();
    });

    document.getElementById('exportData').addEventListener('click', () => {
      this.exportData();
    });
  }

  async exportData() {
    try {
      const weeklyData = await this.sendMessage({ action: 'getWeeklyData' });
      const dataStr = JSON.stringify(weeklyData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `website-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
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

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new DashboardManager();
});
