// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // Navigation State & Elements
  const navItems = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');
  const sidebar = document.querySelector('aside');
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  
  // SPA Tab Switching
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      
      // Update nav active classes
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Update content active classes
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabId}-section`) {
          content.classList.add('active');
        }
      });
      
      // Close sidebar on mobile after clicking
      if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }

      // Re-trigger chart resize if needed
      if (tabId === 'dashboard') {
        initDashboardCharts();
      } else if (tabId === 'climate') {
        updateClimateProjections();
      }
    });
  });

  // Mobile Sidebar Toggle
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Toast System
  function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /* ----------------------------------------------------
     DASHBOARD - Live Data Simulators & Charts
     ---------------------------------------------------- */
  let dashboardChartInstance = null;

  function initDashboardCharts() {
    const ctx = document.getElementById('dashboardChart');
    if (!ctx) return;
    
    // Destroy previous chart if it exists
    if (dashboardChartInstance) {
      dashboardChartInstance.destroy();
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const aqiData = [58, 62, 75, 90, 82, 65];
    const co2Data = [415, 416, 417, 418, 417, 416];

    dashboardChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'AQI Level',
            data: aqiData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'CO2 Levels (ppm)',
            data: co2Data,
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#94a3b8', font: { family: 'Outfit' } }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' },
            title: { display: true, text: 'AQI', color: '#94a3b8' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: '#94a3b8' },
            title: { display: true, text: 'CO2 (ppm)', color: '#94a3b8' }
          }
        }
      }
    });
  }

  // Dashboard live sensor simulation
  function startSensorSimulation() {
    setInterval(() => {
      // Temperature
      const tempEl = document.getElementById('dash-temp');
      if (tempEl) {
        let currentTemp = parseFloat(tempEl.textContent);
        let diff = (Math.random() - 0.5) * 0.4;
        tempEl.textContent = (currentTemp + diff).toFixed(1);
      }
      
      // CO2 Level
      const co2El = document.getElementById('dash-co2');
      if (co2El) {
        let currentCO2 = parseInt(co2El.textContent);
        let diff = Math.round((Math.random() - 0.5) * 2);
        co2El.textContent = currentCO2 + diff;
      }
      
      // Humidity
      const humidityEl = document.getElementById('dash-humidity');
      if (humidityEl) {
        let currentHum = parseInt(humidityEl.textContent);
        let diff = Math.round((Math.random() - 0.5) * 2);
        humidityEl.textContent = Math.min(100, Math.max(0, currentHum + diff));
      }
      
      // Water Quality index
      const waterEl = document.getElementById('dash-water');
      if (waterEl) {
        let currentWQ = parseFloat(waterEl.textContent);
        let diff = (Math.random() - 0.5) * 0.1;
        waterEl.textContent = Math.min(10, Math.max(0, currentWQ + diff)).toFixed(2);
      }
    }, 2500);
  }

  /* ----------------------------------------------------
     AIR QUALITY - AQI Parameter Calculator & Recommendation
     ---------------------------------------------------- */
  const aqiSliders = ['pm25', 'pm10', 'co2', 'no2', 'so2'];
  
  aqiSliders.forEach(sliderId => {
    const slider = document.getElementById(`range-${sliderId}`);
    const display = document.getElementById(`val-${sliderId}`);
    if (slider && display) {
      slider.addEventListener('input', (e) => {
        display.textContent = e.target.value;
        calculateAQI();
      });
    }
  });

  function calculateAQI() {
    const pm25 = parseFloat(document.getElementById('range-pm25').value);
    const pm10 = parseFloat(document.getElementById('range-pm10').value);
    const co2 = parseFloat(document.getElementById('range-co2').value);
    const no2 = parseFloat(document.getElementById('range-no2').value);
    const so2 = parseFloat(document.getElementById('range-so2').value);

    // Simulated multi-factor AQI scoring formula
    // Note: AQI maps between 0-500 depending on inputs
    const aqiScore = Math.round(
      (pm25 * 1.5) + (pm10 * 0.8) + ((co2 - 350) * 0.1) + (no2 * 1.2) + (so2 * 1.4)
    );

    // Clamp score
    const finalAQI = Math.min(500, Math.max(0, aqiScore));

    const resultBox = document.getElementById('aqi-result-box');
    const scoreVal = document.getElementById('aqi-score-val');
    const badge = document.getElementById('aqi-badge');
    const desc = document.getElementById('aqi-desc');
    const recText = document.getElementById('aqi-rec-text');

    if (!resultBox) return;

    resultBox.classList.remove('hidden');
    scoreVal.textContent = finalAQI;

    // Reset status badges
    badge.className = 'badge';
    
    if (finalAQI <= 50) {
      badge.textContent = 'Good';
      badge.classList.add('safe');
      desc.textContent = 'Air quality is satisfactory, and air pollution poses little or no risk.';
      recText.textContent = 'Perfect day for outdoor exercises and ventilation. No special precautions needed.';
    } else if (finalAQI <= 100) {
      badge.textContent = 'Moderate';
      badge.classList.add('warning');
      desc.textContent = 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.';
      recText.textContent = 'Sensitive individuals should limit prolonged outdoor exertion. Keep windows closed if you experience discomfort.';
    } else if (finalAQI <= 150) {
      badge.textContent = 'Unhealthy for Sensitive Groups';
      badge.classList.add('warning');
      desc.textContent = 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.';
      recText.textContent = 'Children, elderly, and individuals with respiratory issues should stay indoors. Consider running air purifiers.';
    } else if (finalAQI <= 200) {
      badge.textContent = 'Unhealthy';
      badge.classList.add('danger');
      desc.textContent = 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.';
      recText.textContent = 'Wear an N95 mask if outdoors. Keep windows shut and active air purifiers at max capacity.';
    } else {
      badge.textContent = 'Hazardous';
      badge.classList.add('danger');
      desc.textContent = 'Health alert: The risk of health effects is increased for everyone.';
      recText.textContent = 'CRITICAL ALERT: Avoid all outdoor activities. Remain in well-filtered indoor environments. Seal cracks in doors and windows.';
    }
  }

  /* ----------------------------------------------------
     WATER QUALITY - Interactive Analysis & Titrator Simulator
     ---------------------------------------------------- */
  const waterSliders = ['ph', 'turbidity', 'do', 'lead'];
  
  waterSliders.forEach(sliderId => {
    const slider = document.getElementById(`range-${sliderId}`);
    const display = document.getElementById(`val-${sliderId}`);
    if (slider && display) {
      slider.addEventListener('input', (e) => {
        display.textContent = e.target.value;
        analyzeWaterQuality();
      });
    }
  });

  function analyzeWaterQuality() {
    const ph = parseFloat(document.getElementById('range-ph').value);
    const turbidity = parseFloat(document.getElementById('range-turbidity').value);
    const dissolvedOxygen = parseFloat(document.getElementById('range-do').value);
    const lead = parseFloat(document.getElementById('range-lead').value);

    const resultBox = document.getElementById('water-result-box');
    const badge = document.getElementById('water-badge');
    const desc = document.getElementById('water-desc');
    const treatmentText = document.getElementById('water-treatment-text');

    if (!resultBox) return;

    resultBox.classList.remove('hidden');

    badge.className = 'badge';
    
    // Evaluate conditions
    let isToxic = lead > 15 || ph < 5.0 || ph > 9.5;
    let isPoor = turbidity > 5 || dissolvedOxygen < 4.0 || ph < 6.5 || ph > 8.5;

    if (isToxic) {
      badge.textContent = 'Highly Contaminated (Toxic)';
      badge.classList.add('danger');
      desc.textContent = `CRITICAL: The water has unsafe parameter deviations. ${lead > 15 ? 'Lead content is above safe thresholds (15 ppb).' : 'pH balance is highly acidic/alkaline.'}`;
      treatmentText.textContent = 'DO NOT DRINK. Requires specialized chemical neutralization, active carbon filtration, and heavy metal remediation.';
    } else if (isPoor) {
      badge.textContent = 'Moderate Risk';
      badge.classList.add('warning');
      desc.textContent = 'The water has minor impurities. Turbidity levels or oxygen saturation makes it unsafe for raw consumption, but recoverable.';
      treatmentText.textContent = 'Requires coagulation/sedimentation, sand filtration, and standard boiling or chlorination before use.';
    } else {
      badge.textContent = 'Safe for Drinking';
      badge.classList.add('safe');
      desc.textContent = 'Excellent properties. The water meets safe ecological and drinking water index standards.';
      treatmentText.textContent = 'No immediate action required. Safe for consumption and aquatic life support.';
    }
  }

  // Interactive titration/purifier simulator
  const btnPurify = document.getElementById('btn-purify-water');
  if (btnPurify) {
    btnPurify.addEventListener('click', () => {
      // Simulate purification process by restoring inputs to optimal values
      document.getElementById('range-ph').value = 7.2;
      document.getElementById('val-ph').textContent = '7.2';
      
      document.getElementById('range-turbidity').value = 1.0;
      document.getElementById('val-turbidity').textContent = '1.0';
      
      document.getElementById('range-do').value = 8.5;
      document.getElementById('val-do').textContent = '8.5';
      
      document.getElementById('range-lead').value = 2;
      document.getElementById('val-lead').textContent = '2';
      
      analyzeWaterQuality();
      showToast('💧 Filtration & Ionization complete! Water is fully purified.');
    });
  }

  /* ----------------------------------------------------
     CLIMATE RISK - Scenario and Location Predictor
     ---------------------------------------------------- */
  const selectRegion = document.getElementById('select-region');
  const selectEmission = document.getElementById('select-emission');
  let climateChartInstance = null;

  if (selectRegion && selectEmission) {
    selectRegion.addEventListener('change', updateClimateProjections);
    selectEmission.addEventListener('change', updateClimateProjections);
  }

  function updateClimateProjections() {
    const region = document.getElementById('select-region').value;
    const emission = document.getElementById('select-emission').value;

    let baseTempRise = 0.5;
    let baseSeaLevel = 10;
    let baseExtremeWeather = 20;
    let baseBiodiversityThreat = 15;

    // Emission Multipliers
    let mult = 1.0;
    if (emission === 'medium') mult = 1.8;
    if (emission === 'high') mult = 3.2;

    // Region adjustments
    let regionName = 'Coastal Zone';
    if (region === 'coastal') {
      baseSeaLevel *= 1.8;
      baseExtremeWeather *= 1.3;
      regionName = 'Coastal Zone';
    } else if (region === 'urban') {
      baseTempRise *= 1.4; // Heat island
      baseExtremeWeather *= 1.1;
      regionName = 'Urban Metropolis';
    } else if (region === 'forested') {
      baseBiodiversityThreat *= 1.5;
      baseTempRise *= 0.9;
      regionName = 'Forested Wilderness';
    } else if (region === 'arid') {
      baseTempRise *= 1.6;
      baseSeaLevel = 0;
      baseExtremeWeather *= 1.4;
      regionName = 'Arid Desert';
    }

    // Projections for 2030, 2050, 2100
    const years = ['2030', '2050', '2100'];
    const tempProj = [
      (baseTempRise * 0.8 * mult).toFixed(1),
      (baseTempRise * 1.5 * mult).toFixed(1),
      (baseTempRise * 3.0 * mult).toFixed(1)
    ];
    const seaProj = [
      Math.round(baseSeaLevel * 0.9 * mult),
      Math.round(baseSeaLevel * 1.7 * mult),
      Math.round(baseSeaLevel * 3.5 * mult)
    ];
    const extremeProj = [
      Math.round(Math.min(100, baseExtremeWeather * 1.0 * mult)),
      Math.round(Math.min(100, baseExtremeWeather * 1.6 * mult)),
      Math.round(Math.min(100, baseExtremeWeather * 2.8 * mult))
    ];
    const bioProj = [
      Math.round(Math.min(100, baseBiodiversityThreat * 1.1 * mult)),
      Math.round(Math.min(100, baseBiodiversityThreat * 1.8 * mult)),
      Math.round(Math.min(100, baseBiodiversityThreat * 3.2 * mult))
    ];

    // Populate values in UI
    document.getElementById('risk-temp-2100').textContent = `+${tempProj[2]}°C`;
    document.getElementById('risk-sea-2100').textContent = `${seaProj[2]} cm`;
    document.getElementById('risk-weather-2100').textContent = `${extremeProj[2]}%`;
    
    // Dynamic Climate Summary Card
    const summaryText = document.getElementById('climate-summary-text');
    if (summaryText) {
      let riskLevel = 'Low';
      if (mult > 2.0 || extremeProj[2] > 60) riskLevel = 'Extreme';
      else if (mult > 1.2) riskLevel = 'High';

      summaryText.innerHTML = `
        <strong>AI Analysis for ${regionName}:</strong> Under the ${emission.toUpperCase()} emission pathway, this region faces 
        <span class="${riskLevel === 'Extreme' ? 'text-rose' : 'text-amber'}">${riskLevel} Climate Risk</span>. 
        Temperature is expected to spike by <strong>${tempProj[2]}°C</strong> by 2100. 
        ${region !== 'arid' ? `Sea levels will rise by <strong>${seaProj[2]} cm</strong>, threatenining infrastructure.` : 'Prolonged droughts will trigger severe water table loss.'} 
        Biodiversity threat level reaches a critical <strong>${bioProj[2]}%</strong>.
      `;
    }

    // Chart.js render
    const ctx = document.getElementById('climateChart');
    if (!ctx) return;

    if (climateChartInstance) {
      climateChartInstance.destroy();
    }

    climateChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Temp Rise (°C)',
            data: tempProj.map(Number),
            backgroundColor: 'rgba(244, 63, 94, 0.8)',
            borderColor: '#f43f5e',
            borderWidth: 1
          },
          {
            label: 'Sea Level Rise (dm)',
            data: seaProj.map(v => (v / 10).toFixed(1)), // Decimeters for scaling
            backgroundColor: 'rgba(14, 165, 233, 0.8)',
            borderColor: '#0ea5e9',
            borderWidth: 1
          },
          {
            label: 'Extreme Weather Risk (%)',
            data: extremeProj,
            backgroundColor: 'rgba(245, 158, 11, 0.8)',
            borderColor: '#f59e0b',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#94a3b8', font: { family: 'Outfit' } }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                let value = context.raw;
                if (label.includes('Sea Level')) {
                  return `${label}: ${(value * 10).toFixed(0)} cm`;
                }
                return `${label}: ${value}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    });
  }

  /* ----------------------------------------------------
     TREE PLANTATION PLANNER - Interactive Grid
     ---------------------------------------------------- */
  const treePaletteOptions = document.querySelectorAll('.tree-type-option');
  const treeGridEl = document.querySelector('.tree-grid');
  
  let selectedTree = {
    emoji: '🌳',
    name: 'Oak Tree',
    offset: 22 // kg CO2/year
  };

  // Change selected tree from palette
  treePaletteOptions.forEach(option => {
    option.addEventListener('click', () => {
      treePaletteOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      
      selectedTree = {
        emoji: option.getAttribute('data-emoji'),
        name: option.getAttribute('data-name'),
        offset: parseInt(option.getAttribute('data-offset'))
      };
    });
  });

  // Reforestation grid configuration
  const GRID_SIZE = 64; // 8x8
  let gridState = new Array(GRID_SIZE).fill(null);

  // Initialize the tree grid
  function initTreeGrid() {
    if (!treeGridEl) return;
    treeGridEl.innerHTML = '';
    
    for (let i = 0; i < GRID_SIZE; i++) {
      const cell = document.createElement('div');
      cell.className = 'tree-cell';
      cell.setAttribute('data-index', i);
      
      // Click event to plant or clear
      cell.addEventListener('click', () => {
        const idx = parseInt(cell.getAttribute('data-index'));
        if (gridState[idx] === null) {
          // Plant tree
          gridState[idx] = { ...selectedTree };
          cell.textContent = selectedTree.emoji;
          cell.classList.add('planted');
          showToast(`🌱 Planted a ${selectedTree.name}!`);
        } else {
          // Remove tree
          const removedName = gridState[idx].name;
          gridState[idx] = null;
          cell.textContent = '';
          cell.classList.remove('planted');
          showToast(`🗑 Removed ${removedName}.`);
        }
        updateGridStats();
      });
      
      treeGridEl.appendChild(cell);
    }
  }

  function updateGridStats() {
    let treeCount = 0;
    let totalOffset = 0;

    gridState.forEach(cell => {
      if (cell !== null) {
        treeCount++;
        totalOffset += cell.offset;
      }
    });

    // Update UI Elements
    document.getElementById('tree-count-val').textContent = treeCount;
    document.getElementById('co2-offset-val').textContent = `${totalOffset} kg/yr`;
    
    // Cars equivalent (average passenger vehicle emits 4600 kg CO2 per year)
    const carsEquivalent = (totalOffset / 4600).toFixed(3);
    document.getElementById('cars-offset-val').textContent = carsEquivalent;

    // Reforestation percentage
    const percent = Math.round((treeCount / GRID_SIZE) * 100);
    document.getElementById('reforest-percent').textContent = `${percent}%`;

    // Achievement Milestone Toast
    if (treeCount === 10) {
      showToast('🎉 Eco-Warrior Milestone: 10 Trees Planted!');
    } else if (treeCount === 32) {
      showToast('🌟 Green Guardian Milestone: Grid is 50% Reforested!');
    } else if (treeCount === 64) {
      showToast('🏆 Master Silviculturalist: Reforestation Grid fully populated!');
    }
  }

  // Clear Grid Button
  const btnClearGrid = document.getElementById('btn-clear-grid');
  if (btnClearGrid) {
    btnClearGrid.addEventListener('click', () => {
      gridState.fill(null);
      const cells = document.querySelectorAll('.tree-cell');
      cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('planted');
      });
      updateGridStats();
      showToast('🧹 Reforestation grid cleared.');
    });
  }

  /* ----------------------------------------------------
     INITIALIZATION ON LOAD
     ---------------------------------------------------- */
  // Auto-init dashboard and simulators on start
  initDashboardCharts();
  startSensorSimulation();
  calculateAQI();
  analyzeWaterQuality();
  updateClimateProjections();
  initTreeGrid();
});
