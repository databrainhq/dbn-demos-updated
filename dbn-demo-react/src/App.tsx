/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
import "@databrainhq/plugin/web";
import { useState, useEffect } from "react";
import "./App.css";
import Reports from "./components/Reports";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "dbn-dashboard": any;
      "dbn-metric": any;
    }
  }
}

// Configuration - Set these values in your code
const CONFIG = {
  clientId: "101", // Set your DataBrain client ID here
  dashboardId: "features-demo", // Set your dashboard ID here
};

function App() {
  const url = new URL(location.href);
  const urlToken = url.searchParams.get("token") || "";
  const urlDashboardId = url.searchParams.get("dashboardId") || "";
  const urlClientId = url.searchParams.get("clientId") || "";

  // Use URL parameters if provided, otherwise use CONFIG
  const clientId = urlClientId || CONFIG.clientId;
  const dashboardId = urlDashboardId || CONFIG.dashboardId;

  const [token, setToken] = useState(urlToken);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('analytics');

  // Check configuration on mount
  useEffect(() => {
    if (!urlToken) {
      // Only auto-fetch if we don't have URL token
      if (!clientId) {
        setError(`Client ID not configured. Please set CONFIG.clientId in src/App.tsx line 18`);
        return;
      }
      if (!dashboardId) {
        setError(`Dashboard ID not configured. Please set CONFIG.dashboardId in src/App.tsx line 19`);
        return;
      }

      // Auto-fetch guest token
      fetchGuestTokenFromBackend(clientId);
    }
  }, [clientId, dashboardId, urlToken]);

  // Backend mode - fetch data app token from backend for dashboard
  const fetchGuestTokenFromBackend = async (clientId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/dashboard-guest-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId: clientId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.guestToken);
        setError(null);
      } else {
        const errorData = await response.json();
        if (errorData.error && errorData.error.includes('API Token')) {
          setError(`Backend API Token not configured. Please set DATABRAIN_API_TOKEN in backend/server.js line 10.`);
        } else {
          setError(`Backend Error: ${errorData.error || 'Failed to generate guest token'}`);
        }
        if (errorData.details) {
          console.error('Error details:', errorData.details);
        }
      }
    } catch (error) {
      setError('Failed to connect to backend. Make sure the server is running on http://localhost:3001');
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for dashboard events to handle errors
  useEffect(() => {
    if (token && clientId && dashboardId) {
      const handleDashboardError = (event: any) => {
        console.error('Dashboard error:', event);
        setIsLoading(false);
        if (event.detail?.message) {
          setError(`Dashboard Error: ${event.detail.message}`);
        } else if (event.detail?.error) {
          setError(`Authentication Error: ${event.detail.error}`);
        } else {
          setError('Failed to load dashboard. Please check your guest token, client ID, and dashboard ID.');
        }
      };

      const handleDashboardLoad = () => {
        console.log('Dashboard loaded successfully');
        setIsLoading(false);
        setError(null);
      };

      // Listen for custom events from the dashboard component
      window.addEventListener('dbn-dashboard-error', handleDashboardError);
      window.addEventListener('dbn-dashboard-loaded', handleDashboardLoad);

      // Cleanup listeners
      return () => {
        window.removeEventListener('dbn-dashboard-error', handleDashboardError);
        window.removeEventListener('dbn-dashboard-loaded', handleDashboardLoad);
      };
    }
  }, [token, clientId, dashboardId]);

  const hasRequiredConfig = token && clientId && dashboardId;

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h1 className="error-title">Configuration Error</h1>
          <div className="error-message">{error}</div>

          <div className="config-section">
            <h3>Frontend Configuration (src/App.tsx):</h3>
            <pre><code>{`const CONFIG = {
  clientId: "your-databrain-client-id",       // Line 18
  dashboardId: "your-dashboard-id",           // Line 19
  workspaceName: "your-workspace-name",       // Line 20
};`}</code></pre>
          </div>

          <div className="config-section">
            <h3>Backend Configuration (backend/server.js):</h3>
            <pre><code>{`const DATABRAIN_API_TOKEN = 'your-databrain-api-token'; // Line 10`}</code></pre>
          </div>

          <button
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!hasRequiredConfig) {
    return (
      <div className="loading-container">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <h1 className="loading-title">CommerceHub</h1>
          <div className="loading-message">
            {isLoading ? 'Connecting to analytics platform...' : 'Initializing ecommerce dashboard...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">CH</div>
            <span>ZenCommerce</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Overview</div>
            <a
              href="#"
              className={`nav-item ${activeNavItem === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveNavItem('dashboard')}
            >
              <span className="nav-icon">📊</span>
              Dashboard
            </a>
            <a
              href="#"
              className={`nav-item ${activeNavItem === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveNavItem('analytics')}
            >
              <span className="nav-icon">📈</span>
              Analytics
            </a>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Catalog</div>
            <a
              href="#"
              className={`nav-item ${activeNavItem === 'products' ? 'active' : ''}`}
              onClick={() => setActiveNavItem('products')}
            >
              <span className="nav-icon">📦</span>
              Products
            </a>
            <a
              href="#"
              className={`nav-item ${activeNavItem === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveNavItem('categories')}
            >
              <span className="nav-icon">🏷️</span>
              Categories
            </a>
            <a
              href="#"
              className={`nav-item ${activeNavItem === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveNavItem('inventory')}
            >
              <span className="nav-icon">📋</span>
              Inventory
            </a>
            <a
              href="#"
              className={`nav-item ${activeNavItem === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveNavItem('reviews')}
            >
              <span className="nav-icon">⭐</span>
              Reviews
            </a>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Sales</div>
            <a
              href="#"
              className={`nav-item ${activeNavItem === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveNavItem('orders')}
            >
              <span className="nav-icon">🛒</span>
              Orders
            </a>
            <a
              href="#"
              className={`nav-item ${activeNavItem === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveNavItem('customers')}
            >
              <span className="nav-icon">👥</span>
              Customers
            </a>
            <a
              href="#"
              className={`nav-item ${activeNavItem === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveNavItem('payments')}
            >
              <span className="nav-icon">💳</span>
              Payments
            </a>
            <a
              href="#"
              className={`nav-item ${activeNavItem === 'shipping' ? 'active' : ''}`}
              onClick={() => setActiveNavItem('shipping')}
            >
              <span className="nav-icon">🚚</span>
              Shipping
            </a>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Marketing</div>
            <a
              href="#"
              className={`nav-item ${activeNavItem === 'campaigns' ? 'active' : ''}`}
              onClick={() => setActiveNavItem('campaigns')}
            >
              <span className="nav-icon">📢</span>
              Campaigns
            </a>
            <a
              href="#"
              className={`nav-item ${activeNavItem === 'promotions' ? 'active' : ''}`}
              onClick={() => setActiveNavItem('promotions')}
            >
              <span className="nav-icon">🎯</span>
              Promotions
            </a>
            <a
              href="#"
              className={`nav-item ${activeNavItem === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveNavItem('reports')}
            >
              <span className="nav-icon">📑</span>
              Reports
            </a>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">

        <main className="dashboard-content">
          {activeNavItem === 'reports' ? (
            <Reports
              embedId={dashboardId}
              clientId={clientId}
            />
          ) : (
            <>
              {isLoading && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.9)',
                  zIndex: 10,
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div className="loading-spinner"></div>
                  <div>Loading ecommerce analytics...</div>
                </div>
              )}

              <dbn-dashboard
                token={token}
                client-id={clientId}
                dashboard-id={dashboardId}
                enable-download-csv
                enable-email-csv
                enable-multi-metric-filters
                options-icon="kebab-menu-vertical"
                variant="card"
                options={JSON.stringify({
                  disableScheduleEmailReports: false,
                  showDashboardActions: true,
                  disableMetricCreation: false,
                  disableMetricCardBorder: false,
                  disableLayoutCustomization: false,
                  disableSaveLayout: false,
                  disableManageMetrics: false,
                  disableUnderlyingData: false,
                  hideDashboardName: false,
                  shouldFitFullScreen: true,
                  chartColors: ["#1d4ed8", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#be185d", "#65a30d"]
                })}
                custom-messages={JSON.stringify({
                  tokenExpiry: "Your session has expired. Please refresh to continue accessing your ecommerce analytics.",
                  tokenAbsent: "Unable to load dashboard. Please check your connection and try again."
                })}
                global-filter-options={JSON.stringify({
                  "Store Location": {
                    options: [
                      { value: 'North America', label: 'North America' },
                      { value: 'Europe', label: 'Europe' },
                      { value: 'Asia Pacific', label: 'Asia Pacific' },
                      { value: 'Latin America', label: 'Latin America' }
                    ],
                    defaultOption: 'North America'
                  },
                  "Customer Segment": {
                    options: [
                      { value: 'Premium', label: 'Premium Customers' },
                      { value: 'Regular', label: 'Regular Customers' },
                      { value: 'New', label: 'New Customers' },
                      { value: 'VIP', label: 'VIP Customers' }
                    ],
                    defaultOption: 'Regular'
                  },
                  "Date Range": {
                    defaultOption: 'this month',
                    datePresetOptions: [
                      {
                        type: 'this',
                        interval: 1,
                        timeGrain: 'month',
                        label: 'this month'
                      },
                      {
                        type: 'last',
                        interval: 3,
                        timeGrain: 'month',
                        label: 'last 3 months'
                      },
                      {
                        type: 'last',
                        interval: 6,
                        timeGrain: 'month',
                        label: 'last 6 months'
                      },
                      {
                        type: 'this',
                        interval: 1,
                        timeGrain: 'year',
                        label: 'this year'
                      }
                    ]
                  }
                })}
                chart-appearance={JSON.stringify({
                  chartTooltip: {
                    labelStyle: {
                      size: 14,
                      family: 'Inter',
                      weight: 500,
                      color: '#374151'
                    },
                    valueStyle: {
                      size: 14,
                      family: 'Inter',
                      weight: 600,
                      color: '#1f2937'
                    }
                  },
                  chartLegend: {
                    show: true,
                    fixedPosition: 'bottom-center',
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: 'Inter',
                    color: '#6b7280'
                  },
                  verticalAxis: {
                    fontSize: 12,
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    color: '#6b7280'
                  },
                  horizontalAxis: {
                    fontSize: 12,
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    color: '#6b7280'
                  }
                })}
                onError={(e: any) => console.error('Dashboard component error:', e)}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
