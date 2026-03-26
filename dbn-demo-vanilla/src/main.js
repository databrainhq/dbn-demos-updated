const API_URL = 'http://localhost:3002';
const DASHBOARD_ID = ''; // Set your embed ID here or use .env with a bundler

const THEMES = {
  none: {},
  light: {
    colors: { primary: '#2563eb', background: '#ffffff', dark: '#0f172a', light: '#f8fafc' },
    typography: { fontFamily: 'Inter', fontSize: '13px' },
  },
  dark: {
    colors: { primary: '#60a5fa', background: '#0f172a', dark: '#f8fafc', light: '#1e293b' },
    typography: { fontFamily: 'Inter', fontSize: '13px' },
  },
};

// Server event handler
window.databrainServerEvent = (event) => {
  if (event?.type === 'TOKEN_EXPIRED') {
    console.warn('Databrain: guest token expired.');
  }
};

let currentDashboard = null;

function showSetup(message) {
  document.getElementById('app').innerHTML = `
    <div class="setup">
      <h2>Configure Databrain</h2>
      <p>${message}</p>
      <button class="btn" onclick="location.reload()">Check again</button>
    </div>
  `;
}

function showError(message) {
  document.getElementById('app').innerHTML = `
    <div class="setup">
      <h2 style="color:#dc2626;">Error</h2>
      <p>${message}</p>
      <button class="btn" onclick="location.reload()">Retry</button>
    </div>
  `;
}

function renderDashboard(token, dashboardId) {
  const container = document.getElementById('app');
  container.innerHTML = '<div id="dashboard-container"></div>';

  const el = document.createElement('dbn-dashboard');
  el.setAttribute('token', token);
  el.setAttribute('dashboard-id', dashboardId);
  el.setAttribute('handle-server-event', 'databrainServerEvent');
  document.getElementById('dashboard-container').appendChild(el);
  currentDashboard = el;

  document.getElementById('theme-select').addEventListener('change', (e) => {
    const theme = e.target.value;
    if (theme === 'none') {
      currentDashboard.removeAttribute('theme');
    } else {
      currentDashboard.setAttribute('theme', JSON.stringify(THEMES[theme]));
    }
  });
}

async function init() {
  try {
    const res = await fetch(`${API_URL}/api/guest-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: 'default' }),
    });
    const data = await res.json();

    if (res.ok && data.configured === false) {
      showSetup('Set <code>DATABRAIN_API_TOKEN</code> and <code>DATA_APP_NAME</code> in <code>backend/.env</code>.');
      return;
    }
    if (res.ok && data.guestToken) {
      if (!DASHBOARD_ID) {
        showSetup('Set the <code>DASHBOARD_ID</code> variable in <code>src/main.js</code> to your embed ID.');
        return;
      }
      renderDashboard(data.guestToken, DASHBOARD_ID);
      return;
    }
    showError(data.error || 'Failed to get guest token');
  } catch (err) {
    showError(err.message || 'Connection failed');
  }
}

document.addEventListener('DOMContentLoaded', init);
