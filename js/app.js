/* ==========================================
   PORTFOLIO INTERACTIVE LOGIC
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  initMobileMenu();
  initThemeToggle();
  initCanvasBackground();
  initTerminalMock();
  initTimelineToggle();
  initScrollReveal();
  initContactForm();
});

/* ==========================================
   1. MOBILE MENU PANEL
   ========================================== */
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-toggle');
  const menu = document.querySelector('.nav-menu');
  const links = document.querySelectorAll('.nav-link');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.innerHTML = isOpen ? '&#x2715;' : '&#x2630;'; // ✕ or ☰
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '&#x2630;';
    });
  });
}

/* ==========================================
   2. THEME SWITCHER (NAVY & GOLD vs EMERALD)
   ========================================== */
function initThemeToggle() {
  const themeToggleBtn = document.querySelector('.theme-toggle');
  if (!themeToggleBtn) return;

  // Icons
  const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
  const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;

  // Check saved theme
  const savedTheme = localStorage.getItem('theme') || 'navy';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggleBtn.innerHTML = savedTheme === 'emerald' ? sunIcon : moonIcon;

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'emerald' ? 'navy' : 'emerald';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggleBtn.innerHTML = newTheme === 'emerald' ? sunIcon : moonIcon;
    
    // Update canvas particle colors
    if (window.updateCanvasColors) {
      window.updateCanvasColors(newTheme);
    }
  });
}

/* ==========================================
   3. INTERACTIVE CANVAS DATA GRAPH
   ========================================== */
function initCanvasBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = [];
  let particleCount = Math.min(60, Math.floor((width * height) / 25000));
  
  // Interactive mouse tracking
  const mouse = {
    x: null,
    y: null,
    radius: 120
  };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Handle Resize
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particleCount = Math.min(60, Math.floor((width * height) / 25000));
    createParticles();
  });

  // Color variables based on current theme
  let colors = {
    particle: 'rgba(201, 168, 96, 0.4)',
    line: 'rgba(201, 168, 96, 0.08)',
    accent: 'rgba(6, 182, 212, 0.3)'
  };

  window.updateCanvasColors = function(theme) {
    if (theme === 'emerald') {
      colors.particle = 'rgba(52, 211, 153, 0.4)';
      colors.line = 'rgba(52, 211, 153, 0.08)';
      colors.accent = 'rgba(56, 189, 248, 0.3)';
    } else {
      colors.particle = 'rgba(201, 168, 96, 0.4)';
      colors.line = 'rgba(201, 168, 96, 0.08)';
      colors.accent = 'rgba(6, 182, 212, 0.3)';
    }
  };

  // Run immediately for initial theme configuration
  const currentTheme = document.documentElement.getAttribute('data-theme');
  window.updateCanvasColors(currentTheme);

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1;
      this.colorType = Math.random() > 0.85 ? 'accent' : 'particle';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce on boundaries
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse interactive push/pull
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          // Soft pull towards mouse to represent "connecting data nodes"
          this.x -= (dx / dist) * force * 0.5;
          this.y -= (dy / dist) * force * 0.5;
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

        if (dist < 150) {
          const alpha = (150 - dist) / 150 * 0.45;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = colors.line.replace('0.08', (alpha * 0.08).toFixed(3));
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    connectParticles();
    animationFrameId = requestAnimationFrame(animate);
  }

  createParticles();
  animate();
}

/* ==========================================
   4. INTERACTIVE SQL / DATA CODE TERMINAL MOCK
   ========================================== */
const terminalData = {
  'retention_query.sql': {
    code: `SELECT 
    segment, 
    COUNT(customer_id) AS total_customers, 
    SUM(churn_flag) AS churned, 
    ROUND(100.0 * SUM(churn_flag) / COUNT(customer_id), 2) || '%' AS churn_rate
FROM customer_activity
WHERE last_active > '2026-01-01'
GROUP BY segment;`,
    output: `Executing query retention_query.sql...

| segment    | total_customers | churned | churn_rate |
|------------|-----------------|---------|------------|
| Enterprise | 1,420           | 85      | 5.99%      |
| Mid-Market | 2,840           | 298     | 10.49%     |
| SMB        | 5,120           | 839     | 16.39%     |

Query finished in 0.048s. 3 rows affected.`
  },
  'defect_detection.py': {
    code: `import cv2
import torch
from pcb_analytics import CVEngine

# Load customized YOLOv5 network
cv_model = torch.hub.load('models/', 'custom', path='pcb_cv_v2.pt')
img = cv2.imread('uploads/pcb_sample_049.jpg')
findings = cv_model(img)

# Log defect metrics
for index, item in enumerate(findings.xyxy[0]):
    print(f"Defect Detected - Class: {int(item[5])}, Confidence: {item[4]:.2f}")`,
    output: `Initializing PyTorch deep learning weights...
Loading PCB model pcb_cv_v2.pt... Successfully loaded.
Running inference on uploads/pcb_sample_049.jpg [1024x1024]...
Inspection results:
- Defect 01: Class 0 (Missing Hole), Conf: 94.2%, Box: [120, 240, 150, 270]
- Defect 02: Class 2 (Short Circuit), Conf: 88.0%, Box: [450, 110, 485, 145]
- Defect 03: Class 5 (Spurious Copper), Conf: 81.4%, Box: [890, 520, 930, 560]

Result: REJECT. Flow metrics sent to database.`
  },
  'clean_data.py': {
    code: `import pandas as pd
import numpy as np

# Pipeline to clean churn sensor data
df = pd.read_csv('raw_logs.csv')
print(f"Original shape: {df.shape}")

# Drop bad keys and impute null values
df.drop_duplicates(subset=['log_id'], inplace=True)
df['session_duration'].fillna(df['session_duration'].median(), inplace=True)
df['page_views'] = np.clip(df['page_views'], 0, 100)

print(f"Cleaned dataset shape: {df.shape}")`,
    output: `Running Python clean_data.py...
[Logs] Reading dataset: raw_logs.csv
[Logs] Deduplicating keys on 'log_id'... Cleaned 1,240 duplicates.
[Logs] Imputing missing values in 'session_duration' with median (12.4 minutes).
[Logs] Clipping outliers in 'page_views' column at percentile thresholds.

Output metrics:
- Original shape: (149632, 14)
- Cleaned dataset shape: (148392, 14)
Data pipeline completed successfully.`
  }
};

function initTerminalMock() {
  const tabs = document.querySelectorAll('.terminal-tab');
  const codeEl = document.querySelector('.terminal-code');
  const outputEl = document.querySelector('.terminal-console');
  
  if (!tabs.length || !codeEl || !outputEl) return;

  let typingTimer = null;

  function typeCode(text, callback) {
    codeEl.innerHTML = '';
    let index = 0;
    
    // Clear any active typing sequence
    if (typingTimer) clearInterval(typingTimer);

    // Fast typing simulation
    typingTimer = setInterval(() => {
      if (index < text.length) {
        // Quick basic formatting for syntax highlights
        let char = text[index];
        if (char === '<') {
          // Skip HTML entities
          const end = text.indexOf('>', index);
          if (end !== -1) {
            char = text.substring(index, end + 1);
            index = end;
          }
        }
        
        codeEl.innerHTML += char;
        index++;
        
        // Scroll terminal code panel to bottom if overflow
        codeEl.parentElement.scrollTop = codeEl.parentElement.scrollHeight;
      } else {
        clearInterval(typingTimer);
        typingTimer = null;
        if (callback) callback();
      }
    }, 8); // Fast typing pace
  }

  function highlightCode(filename) {
    const rawCode = terminalData[filename].code;
    let formatted = rawCode
      // Strings
      .replace(/(['"])(.*?)\1/g, '<span class="terminal-str">$1$2$1</span>')
      // Comments
      .replace(/(#.*|\-\-.*)/g, '<span class="terminal-comment">$1</span>')
      // SQL keywords
      .replace(/\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|AND|OR|AS|ROUND|SUM|COUNT|LIMIT|WHERE)\b/g, '<span class="terminal-kw">$1</span>')
      // Python imports & flow controls
      .replace(/\b(import|from|as|for|in|print|def|return|class|if|elif|else|try|except)\b/g, '<span class="terminal-kw">$1</span>')
      // Custom functions/methods
      .replace(/(\.\w+|\b\w+)(?=\()/g, '<span class="terminal-fn">$1</span>')
      // Variables and attributes
      .replace(/\b(df|img|findings|cv_model|results|det|customer_id|churn_flag|ltv|segment)\b/g, '<span class="terminal-var">$1</span>');

    codeEl.innerHTML = formatted + '<span class="terminal-caret"></span>';
  }

  function executeTab(tabName) {
    outputEl.style.opacity = '0.3';
    outputEl.textContent = 'Awaiting query execution...';
    
    const fileData = terminalData[tabName];
    if (!fileData) return;

    typeCode(fileData.code, () => {
      // Re-apply standard syntax coloring on completion
      highlightCode(tabName);
      
      // Simulate backend computing wait
      setTimeout(() => {
        outputEl.style.opacity = '1';
        outputEl.textContent = fileData.output;
      }, 350);
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const target = e.currentTarget;
      if (target.classList.contains('active') && typingTimer) return;

      tabs.forEach(t => t.classList.remove('active'));
      target.classList.add('active');

      const filename = target.getAttribute('data-file');
      executeTab(filename);
    });
  });

  // Start with first tab loaded
  executeTab('retention_query.sql');
}

/* ==========================================
   5. TIMELINE FILTER TOGGLE (EXPERIENCE / EDUCATION)
   ========================================== */
function initTimelineToggle() {
  const btns = document.querySelectorAll('.timeline-btn');
  const items = document.querySelectorAll('.timeline-item');

  if (!btns.length || !items.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.currentTarget.getAttribute('data-target');
      
      // Active Button
      btns.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');

      // Filter timeline list items with animations
      items.forEach(item => {
        const itemType = item.getAttribute('data-type');
        
        // Hide card first
        item.style.display = 'none';
        item.classList.remove('show');
        
        if (itemType === type) {
          // Visual delay for layout adjustments
          setTimeout(() => {
            item.style.display = 'block';
            setTimeout(() => {
              item.classList.add('show');
            }, 50);
          }, 100);
        }
      });
    });
  });

  // Set initial state
  const activeBtn = document.querySelector('.timeline-btn.active');
  if (activeBtn) {
    const initialType = activeBtn.getAttribute('data-target');
    items.forEach(item => {
      const itemType = item.getAttribute('data-type');
      if (itemType === initialType) {
        item.style.display = 'block';
        item.classList.add('show');
      } else {
        item.style.display = 'none';
      }
    });
  }
}

/* ==========================================
   6. SCROLL REVEAL (INTERSECTION OBSERVER)
   ========================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Unobserve to keep element visible and avoid re-triggering
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px' // Trigger slightly before element is in full view
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ==========================================
   7. INTERACTIVE CONTACT FORM WITH TOAST FEEDBACK
   ========================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Simulate loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `Sending... <span class="terminal-caret" style="width: 5px; height: 10px;"></span>`;

    const name = document.getElementById('formName').value;
    const email = document.getElementById('formEmail').value;
    const msg = document.getElementById('formMessage').value;

    setTimeout(() => {
      // Reset button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      
      // Toast notification creation
      createToast(`Thank you, ${name}! Your message has been sent successfully. Kanhu will reply to ${email} shortly.`);
      
      // Reset fields
      form.reset();
    }, 1200);
  });
}

function createToast(message) {
  // Check if a toast container already exists, otherwise create it
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    // Style toast container dynamically or add to style.css
    Object.assign(container.style, {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      zIndex: '1000',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '380px'
    });
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-notification glass-panel';
  
  // Style toast card dynamically
  Object.assign(toast.style, {
    padding: '1.25rem',
    background: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid var(--primary)',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
    transform: 'translateY(100px)',
    opacity: '0',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.88rem',
    color: 'var(--text-hi)',
    borderRadius: 'var(--border-radius-sm)'
  });

  toast.innerHTML = `
    <div style="display: flex; align-items: flex-start; gap: 10px;">
      <span style="color: var(--primary); font-size: 1.1rem; font-weight: bold;">✓</span>
      <div>${message}</div>
    </div>
  `;

  container.appendChild(toast);

  // Trigger animation after appending
  setTimeout(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  }, 10);

  // Auto-dismiss after 6 seconds
  setTimeout(() => {
    toast.style.transform = 'translateY(30px)';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 6000);
}
