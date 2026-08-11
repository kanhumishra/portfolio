/* ==========================================================================
   PORTFOLIO INTERACTIVE APPLICATION LOGIC — KANHU CHARAN MISHRA
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCursorGlow();
  initMobileMenu();
  initHeaderScroll();
  initThemeToggle();
  initCanvasBackground();
  initTerminalMock();
  initChartJSHub();
  initProjectFilters();
  initPcbSimulator();
  initTimelineToggle();
  initCopyCards();
  initModals();
  initScrollReveal();
  initContactForm();
});

/* ==========================================================================
   1. CUSTOM CURSOR GLOW FOLLOWER
   ========================================================================== */
function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;

  window.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

/* ==========================================================================
   2. MOBILE MENU & HEADER SCROLL
   ========================================================================== */
function initMobileMenu() {
  const toggle = document.getElementById('mobileMenuToggle');
  const menu = document.getElementById('navMenu');
  const links = document.querySelectorAll('.nav-link');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.innerHTML = isOpen ? '<i class="lucide-x"></i>' : '<i class="lucide-menu"></i>';
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<i class="lucide-menu"></i>';
    });
  });
}

function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* ==========================================================================
   3. THEME TOGGLE (NAVY vs EMERALD)
   ========================================================================== */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('themeToggler');
  if (!themeToggleBtn) return;

  const sunIcon = `<i class="lucide-sun"></i>`;
  const moonIcon = `<i class="lucide-moon"></i>`;

  const savedTheme = localStorage.getItem('portfolio_theme') || 'navy';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggleBtn.innerHTML = savedTheme === 'emerald' ? sunIcon : moonIcon;

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'emerald' ? 'navy' : 'emerald';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('portfolio_theme', newTheme);
    themeToggleBtn.innerHTML = newTheme === 'emerald' ? sunIcon : moonIcon;
    
    if (window.updateCanvasColors) window.updateCanvasColors(newTheme);
    if (window.updateChartTheme) window.updateChartTheme(newTheme);
  });
}

/* ==========================================================================
   4. INTERACTIVE CANVAS PARTICLE GRAPH
   ========================================================================== */
function initCanvasBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = [];
  let particleCount = Math.min(60, Math.floor((width * height) / 24000));
  
  const mouse = { x: null, y: null, radius: 140 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particleCount = Math.min(60, Math.floor((width * height) / 24000));
    createParticles();
  });

  let colors = {
    particle: 'rgba(201, 168, 96, 0.4)',
    line: 'rgba(201, 168, 96, 0.08)',
    accent: 'rgba(6, 182, 212, 0.35)'
  };

  window.updateCanvasColors = function(theme) {
    if (theme === 'emerald') {
      colors.particle = 'rgba(52, 211, 153, 0.4)';
      colors.line = 'rgba(52, 211, 153, 0.08)';
      colors.accent = 'rgba(56, 189, 248, 0.35)';
    } else {
      colors.particle = 'rgba(201, 168, 96, 0.4)';
      colors.line = 'rgba(201, 168, 96, 0.08)';
      colors.accent = 'rgba(6, 182, 212, 0.35)';
    }
  };

  const currentTheme = document.documentElement.getAttribute('data-theme');
  window.updateCanvasColors(currentTheme);

  class Particle {
    constructor() { this.reset(); }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 2 + 1;
      this.colorType = Math.random() > 0.8 ? 'accent' : 'particle';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 0.6;
          this.y -= (dy / dist) * force * 0.6;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.colorType === 'accent' ? colors.accent : colors.particle;
      ctx.fill();
    }
  }

  function createParticles() {
    particles.length = 0;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140) {
          const alpha = (140 - dist) / 140 * 0.4;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = colors.line.replace('0.08', (alpha * 0.08).toFixed(3));
          ctx.lineWidth = 0.65;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animate);
  }

  createParticles();
  animate();
}

/* ==========================================================================
   5. HERO TERMINAL / CODE IDE MOCK
   ========================================================================== */
const terminalData = {
  'growth_analytics.sql': {
    code: `-- Telecom Customer Growth & High Risk Account Query
WITH HighRiskAccounts AS (
    SELECT 
        CustomerID,
        City,
        Monthly_Charges,
        Churn_Score,
        CASE WHEN Churn_Score >= 80 THEN 'HIGH RISK' ELSE 'STABLE' END AS Risk_Category
    FROM telco_customer_clean
    WHERE Total_Charges > 500.00
)
SELECT City, COUNT(CustomerID) AS Total_High_Risk, SUM(Monthly_Charges) AS Revenue_At_Risk
FROM HighRiskAccounts
WHERE Risk_Category = 'HIGH RISK'
GROUP BY City
ORDER BY Revenue_At_Risk DESC;`,
    output: `Executing T-SQL script [growth_analytics.sql]...

| City          | Total_High_Risk | Revenue_At_Risk ($) |
|---------------|-----------------|---------------------|
| Los Angeles   | 142             | $12,480.50          |
| San Diego     | 98              | $8,910.20           |
| San Jose      | 76              | $6,740.00           |
| San Francisco | 64              | $5,820.75           |

Execution Complete: 4 rows returned in 0.038s. High risk flag isolated.`
  },
  'pcb_vision.py': {
    code: `import cv2
import torch
from fastapi import FastAPI
from pcb_vision import YOLOv5Engine

app = FastAPI(title="PCB Defect Classifier")
model = YOLOv5Engine(weights="best_model.pth")

@app.post("/inspect")
async def inspect_pcb(image_path: str):
    image = cv2.imread(image_path)
    detections = model.predict(image, conf_threshold=0.85)
    return {"status": "SUCCESS", "anomalies_detected": len(detections), "results": detections}`,
    output: `Running PyTorch YOLOv5 Inference API test...

[MODEL] Model loaded: best_model.pth (CUDA GPU Acceleration)
[INPUT] Image shape: (1080, 1920, 3)
[RESULT] Found 1 Defect: 'Short Circuit' (Confidence: 0.984)
[TIME] Inference Latency: 14.2 ms. Response 200 OK.`
  },
  'churn_eda.py': {
    code: `import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Load cleaned telecom retention dataset
df = pd.read_csv("data/processed/telco_customer_clean.csv")

X = df[['Tenure', 'Monthly_Charges', 'Total_Charges', 'Contract_Code']]
y = df['Churn_Value']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

acc = model.score(X_test, y_test)
print(f"Model Test Accuracy: {acc * 100:.2f}%")`,
    output: `Training Random Forest Classifier...

Splitting dataset (80% train, 20% test)...
Model Training Finished.
========================================
Model Test Accuracy: 84.62%
Feature Importance: Tenure (34.2%), Monthly_Charges (28.4%), Contract (22.1%)`
  }
};

function initTerminalMock() {
  const tabs = document.querySelectorAll('.terminal-tab');
  const codeElem = document.getElementById('terminalCodeContent');
  const consoleElem = document.getElementById('terminalConsoleContent');
  const runBtn = document.getElementById('btnRunTerminalQuery');

  if (!codeElem || !consoleElem) return;

  let currentFile = 'growth_analytics.sql';
  codeElem.textContent = terminalData[currentFile].code;

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');

      currentFile = target.getAttribute('data-file');
      codeElem.textContent = terminalData[currentFile].code;
      consoleElem.textContent = "Click 'Run Code' to execute pipeline analysis...";
    });
  });

  if (runBtn) {
    runBtn.addEventListener('click', () => {
      consoleElem.textContent = "Running script on server...";
      setTimeout(() => {
        consoleElem.textContent = terminalData[currentFile].output;
      }, 400);
    });
  }
}

/* ==========================================================================
   6. LIVE CHART.JS BUSINESS INTELLIGENCE HUB
   ========================================================================== */
let chartInstance = null;

const chartDatasets = {
  revenue: {
    title: 'Telco Regional Revenue & Growth Analytics',
    labels: ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Sacramento', 'Fresno'],
    type: 'bar',
    datasets: [{
      label: 'Total Revenue ($K)',
      data: [1420, 980, 840, 720, 560, 410],
      backgroundColor: 'rgba(201, 168, 96, 0.7)',
      borderColor: '#c9a860',
      borderWidth: 1.5,
      borderRadius: 6
    }],
    insights: [
      'Top 10 cities account for over 42% of total cumulative telecom revenue.',
      'High-risk accounts (Churn Score >= 80) contribute to $145K in monthly revenue risk.',
      'Fiber Optic internet service yields highest ARPU but requires proactive retention.'
    ],
    kpi: { dataset: '7,043 Rows', accuracy: 'Score >= 80', risk: '$482.5K' }
  },
  churn: {
    title: 'Customer Churn Rate by Contract Tenure',
    labels: ['Month-to-Month', 'One Year', 'Two Year'],
    type: 'doughnut',
    datasets: [{
      label: 'Churn % Rate',
      data: [42.7, 11.2, 2.8],
      backgroundColor: ['rgba(239, 68, 68, 0.75)', 'rgba(245, 158, 11, 0.75)', 'rgba(52, 211, 153, 0.75)'],
      borderColor: ['#ef4444', '#f59e0b', '#34d399'],
      borderWidth: 2
    }],
    insights: [
      'Month-to-Month contracts represent 78.4% of overall account cancellations.',
      'Customers with tenure under 12 months show 3.5x higher churn probability.',
      'Electronic check payment methods show significant correlation with churn.'
    ],
    kpi: { dataset: '7,043 Rows', accuracy: '84.6% Accuracy', risk: '$310.2K' }
  },
  pcb: {
    title: 'PCB Defect Category Frequency Distribution',
    labels: ['Short Circuit', 'Mousebite', 'Missing Hole', 'Open Loop', 'Spur', 'Spurious Copper'],
    type: 'bar',
    datasets: [{
      label: 'Identified Anomalies',
      data: [142, 98, 86, 64, 45, 32],
      backgroundColor: 'rgba(6, 182, 212, 0.7)',
      borderColor: '#06b6d4',
      borderWidth: 1.5,
      borderRadius: 6
    }],
    insights: [
      'Short circuits and Mousebites account for 51% of total surface defect flags.',
      'Open-CV contour template matching achieved 98.4% precision on standard test sets.',
      'FastAPI async inference pipeline runs at 14.2ms per PCB image frame.'
    ],
    kpi: { dataset: '6 Defect Classes', accuracy: '98.4% Precision', risk: '14.2 ms Latency' }
  }
};

function initChartJSHub() {
  const canvas = document.getElementById('liveChartCanvas');
  const titleElem = document.getElementById('currentChartTitle');
  const insightsElem = document.getElementById('insightsList');
  const kpiData = document.getElementById('kpiDataset');
  const kpiAcc = document.getElementById('kpiAccuracy');
  const kpiRisk = document.getElementById('kpiRisk');
  const selectBtns = document.querySelectorAll('.btn-chart-select');

  if (!canvas || typeof Chart === 'undefined') return;

  function renderChart(key) {
    const config = chartDatasets[key];

    if (chartInstance) chartInstance.destroy();

    titleElem.textContent = config.title;
    
    // Update insights
    insightsElem.innerHTML = config.insights.map(item => `<li><i class="lucide-check-circle"></i> ${item}</li>`).join('');
    
    // Update KPI mini cards
    if (kpiData) kpiData.textContent = config.kpi.dataset;
    if (kpiAcc) kpiAcc.textContent = config.kpi.accuracy;
    if (kpiRisk) kpiRisk.textContent = config.kpi.risk;

    chartInstance = new Chart(canvas, {
      type: config.type,
      data: {
        labels: config.labels,
        datasets: config.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: config.type === 'doughnut',
            labels: { color: '#cbd5e1', font: { family: 'Plus Jakarta Sans', size: 12 } }
          }
        },
        scales: config.type !== 'doughnut' ? {
          x: { ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 11 } }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 11 } }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        } : {}
      }
    });
  }

  selectBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      selectBtns.forEach(b => b.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');
      const chartKey = target.getAttribute('data-chart');
      renderChart(chartKey);
    });
  });

  renderChart('revenue');
}

/* ==========================================================================
   7. PROJECT CATEGORY FILTERING (ALL, AI / ML ENGINEER, DATA ANALYST)
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');

      const filter = target.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        card.style.opacity = '0';
        card.style.transform = 'translateY(15px)';

        setTimeout(() => {
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          } else {
            card.style.display = 'none';
          }
        }, 200);
      });
    });
  });
}

/* ==========================================================================
   8. PCB COMPUTER VISION DEFECT INSPECTION SIMULATOR
   ========================================================================== */
const pcbDefects = {
  short: {
    name: 'Short Circuit',
    confidence: '98.4%',
    coords: '[x: 180, y: 110, w: 90, h: 75]',
    latency: '14.2 ms',
    action: 'FLAGGED FOR MANUAL REVIEW',
    log: '[INFO] Image frame 1920x1080 received.\n[INFO] Contour template alignment done.\n[DETECT] Copper trace bridge found at sector B-4.\n[OUTPUT] Bounding box drawn with confidence 0.984.',
    bbox: { top: '22%', left: '25%', width: '110px', height: '80px', color: '#ef4444' }
  },
  mousebite: {
    name: 'Mousebite Anomaly',
    confidence: '95.1%',
    coords: '[x: 310, y: 200, w: 60, h: 50]',
    latency: '12.8 ms',
    action: 'FLAGGED FOR ETCH RE-CHECK',
    log: '[INFO] Image frame received.\n[INFO] Edge roughness analysis in progress.\n[DETECT] Trace bite erosion found at pad connector C-2.\n[OUTPUT] Confidence score 0.951.',
    bbox: { top: '50%', left: '55%', width: '85px', height: '65px', color: '#f59e0b' }
  },
  hole: {
    name: 'Missing Hole',
    confidence: '99.2%',
    coords: '[x: 420, y: 80, w: 45, h: 45]',
    latency: '11.5 ms',
    action: 'REJECTED — MISSING DRILL',
    log: '[INFO] Drill pad verification routine.\n[DETECT] Missing via hole on layer 1.\n[OUTPUT] Severe defect flag triggered.',
    bbox: { top: '15%', left: '68%', width: '60px', height: '60px', color: '#ef4444' }
  },
  open: {
    name: 'Open Circuit',
    confidence: '96.8%',
    coords: '[x: 120, y: 250, w: 100, h: 40]',
    latency: '13.9 ms',
    action: 'FLAGGED FOR RESOLDER',
    log: '[INFO] Trace continuity scan initialized.\n[DETECT] Line gap break detected on signal line 3.\n[OUTPUT] Open loop flag generated.',
    bbox: { top: '65%', left: '15%', width: '130px', height: '55px', color: '#a855f7' }
  },
  spur: {
    name: 'Copper Spur',
    confidence: '92.6%',
    coords: '[x: 240, y: 160, w: 50, h: 50]',
    latency: '15.1 ms',
    action: 'MINOR ANOMALY LOGGED',
    log: '[INFO] Surface copper protrusion scan.\n[DETECT] Extra copper spur trace identified.\n[OUTPUT] Logged to database.',
    bbox: { top: '35%', left: '42%', width: '70px', height: '70px', color: '#06b6d4' }
  }
};

function initPcbSimulator() {
  const defectBtns = document.querySelectorAll('.defect-btn');
  const bbox = document.getElementById('pcbBoundingBox');
  const label = document.getElementById('bboxLabel');
  const nameElem = document.getElementById('telDefectName');
  const confElem = document.getElementById('telConfidence');
  const coordsElem = document.getElementById('telCoords');
  const latElem = document.getElementById('telLatency');
  const actElem = document.getElementById('telAction');
  const logElem = document.getElementById('logOutput');

  if (!defectBtns.length || !bbox) return;

  defectBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      defectBtns.forEach(b => b.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');

      const defectKey = target.getAttribute('data-defect');
      const data = pcbDefects[defectKey];

      // Update Bounding Box
      bbox.style.top = data.bbox.top;
      bbox.style.left = data.bbox.left;
      bbox.style.width = data.bbox.width;
      bbox.style.height = data.bbox.height;
      bbox.style.borderColor = data.bbox.color;
      
      label.textContent = `${data.name}: ${data.confidence}`;
      label.style.background = data.bbox.color;

      // Update Telemetry Sidebar
      if (nameElem) nameElem.textContent = data.name;
      if (confElem) confElem.textContent = data.confidence;
      if (coordsElem) coordsElem.textContent = data.coords;
      if (latElem) latElem.textContent = data.latency;
      if (actElem) actElem.textContent = data.action;
      if (logElem) logElem.textContent = data.log;
    });
  });
}

/* ==========================================================================
   9. TIMELINE TOGGLE (EXPERIENCE vs EDUCATION)
   ========================================================================== */
function initTimelineToggle() {
  const toggleBtns = document.querySelectorAll('.timeline-tab-btn');
  const items = document.querySelectorAll('.timeline-item');

  if (!toggleBtns.length || !items.length) return;

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      toggleBtns.forEach(b => b.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');

      const type = target.getAttribute('data-target');

      items.forEach(item => {
        const itemType = item.getAttribute('data-type');
        if (itemType === type) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   10. COPY CARDS & TOAST NOTIFICATIONS
   ========================================================================== */
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="lucide-check-circle"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function initCopyCards() {
  const copyCards = document.querySelectorAll('.copyable-card');

  copyCards.forEach(card => {
    card.addEventListener('click', () => {
      const textToCopy = card.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied "${textToCopy}" to clipboard!`);
        });
      }
    });
  });
}

/* ==========================================================================
   11. MODAL WINDOWS (RESUME & PROJECT ARCHITECTURE DETAILS)
   ========================================================================== */
const projectModalData = {
  pcb: {
    title: 'AI-Powered PCB Defect Detection Architecture',
    github: 'https://github.com/kanhumishra/Smart-PCB-defect-detection-and-classification',
    body: `
      <h4><i class="lucide-cpu"></i> System Overview & Pipeline</h4>
      <p>This project resolves industrial PCB manufacturing inspection errors by replacing slow manual visual checks with an automated deep-learning computer vision pipeline.</p>
      
      <h4 style="margin-top: 1rem;"><i class="lucide-layers"></i> Technical Stack & Modules</h4>
      <ul>
        <li><strong>OpenCV & PyTorch:</strong> Image contour extraction, grayscale alignment, and YOLOv5 deep learning model training.</li>
        <li><strong>6 Defect Classes:</strong> Short Circuit, Mousebite, Missing Hole, Open Circuit, Spur, Spurious Copper.</li>
        <li><strong>FastAPI Microservice:</strong> Asynchronous REST backend handling image frames and yielding bounding box JSON.</li>
        <li><strong>Streamlit Dashboard:</strong> User interface displaying real-time inspection feeds, metrics, and anomaly logs.</li>
      </ul>
    `
  },
  telcogrowth: {
    title: 'Customer Intelligence & Growth Analytics Architecture',
    github: 'https://github.com/kanhumishra/Customer-Intelligence-Growth-Analytics',
    body: `
      <h4><i class="lucide-bar-chart-2"></i> System Overview & Business Impact</h4>
      <p>Designed a data analytics engine analyzing customer retention dynamics, top revenue-generating cities, and high-risk churn indicators across telecom accounts.</p>
      
      <h4 style="margin-top: 1rem;"><i class="lucide-database"></i> SQL Pipeline & Analytics Workflow</h4>
      <ul>
        <li><strong>T-SQL Data Pipeline (telco_customer_clean.sql):</strong> Executed bulk data import, deduplication, NULL handling, and CTE analysis for contract churn rates and top cities.</li>
        <li><strong>Python Jupyter Notebooks:</strong> Conducted EDA, ARPU calculations, and root-cause correlation analysis (Notebooks 1 through 7).</li>
        <li><strong>Power BI Dashboard (telco_customer.pbix):</strong> Formulated DAX measures and built interactive slicers isolating high-risk users (Churn_Score >= 80) to preserve monthly revenue.</li>
      </ul>
    `
  },
  supplychain: {
    title: 'Enterprise Supply Chain & Logistics Intelligence Architecture',
    github: 'https://github.com/kanhumishra/Enterprise-Supply-Chain-Logistics-Intelligence',
    body: `
      <h4><i class="lucide-truck"></i> System Overview & Business Objective</h4>
      <p>Constructed an enterprise analytical platform inspecting global supply chain order fulfillment, net profit margins across geographic regions, customer segment behaviors, and top product revenue drivers.</p>
      
      <h4 style="margin-top: 1rem;"><i class="lucide-database"></i> Analytics Pipeline & SQL Modeling</h4>
      <ul>
        <li><strong>Relational SQL Query Suite:</strong> Authored modular T-SQL scripts (Market Performance, Customer Segment Analysis, Sales by Department & Category, and Top 10 Product performance) computing profit margin percentages and grouped aggregations.</li>
        <li><strong>Python Data Preparation & EDA:</strong> Utilized Pandas and NumPy for automated data cleaning (Notebook 01) and multi-variate exploratory data analysis (Notebook 02).</li>
        <li><strong>Power BI Dashboard (Supply_chain.pbix):</strong> Modeled DAX KPIs and interactive dashboards highlighting high-margin product lines, market revenue distributions, and department sales trends.</li>
      </ul>
    `
  }
};

function initModals() {
  // Resume Modal
  const resumeModal = document.getElementById('resumeModal');
  const openResumeBtn = document.getElementById('heroResumeBtn');
  const openHeaderResumeBtn = document.getElementById('headerResumeModalBtn');
  const closeResumeBtn = document.getElementById('closeResumeModal');
  const printResumeBtn = document.getElementById('btnPrintResume');

  function openResume() { if (resumeModal) resumeModal.classList.add('open'); }
  function closeResume() { if (resumeModal) resumeModal.classList.remove('open'); }

  if (openResumeBtn) openResumeBtn.addEventListener('click', openResume);
  if (openHeaderResumeBtn) openHeaderResumeBtn.addEventListener('click', openResume);
  if (closeResumeBtn) closeResumeBtn.addEventListener('click', closeResume);

  if (printResumeBtn) {
    printResumeBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Project Modal
  const projectModal = document.getElementById('projectModal');
  const openProjectBtns = document.querySelectorAll('.btn-open-modal');
  const closeProjBtn = document.getElementById('closeProjectModal');
  const closeProjFooter = document.getElementById('closeProjectModalFooter');
  const modalTitle = document.getElementById('modalProjectTitle');
  const modalBody = document.getElementById('modalProjectBody');
  const modalGithubLink = document.getElementById('modalProjectGithubLink');

  function openProject(key) {
    const data = projectModalData[key];
    if (!data) return;

    if (modalTitle) modalTitle.innerHTML = `<i class="lucide-layers"></i> ${data.title}`;
    if (modalBody) modalBody.innerHTML = data.body;
    if (modalGithubLink) modalGithubLink.href = data.github;

    if (projectModal) projectModal.classList.add('open');
  }

  function closeProject() { if (projectModal) projectModal.classList.remove('open'); }

  openProjectBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const key = e.currentTarget.getAttribute('data-project');
      openProject(key);
    });
  });

  if (closeProjBtn) closeProjBtn.addEventListener('click', closeProject);
  if (closeProjFooter) closeProjFooter.addEventListener('click', closeProject);

  // Close modals on backdrop click
  window.addEventListener('click', (e) => {
    if (e.target === resumeModal) closeResume();
    if (e.target === projectModal) closeProject();
  });
}

/* ==========================================================================
   12. SCROLL REVEAL ANIMATIONS
   ========================================================================== */
function initScrollReveal() {
  const revealElems = document.querySelectorAll('.reveal-on-scroll');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElems.forEach(elem => observer.observe(elem));
}

/* ==========================================================================
   13. CONTACT FORM HANDLER
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Thank you! Your message has been sent successfully.');
    form.reset();
  });
}
