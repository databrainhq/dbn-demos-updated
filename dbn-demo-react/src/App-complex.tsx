/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
import "@databrainhq/plugin/web";
import { useState, useEffect } from "react";

// Add debugging for DataBrain component loading
console.log('🔍 DataBrain plugin imported, checking if dbn-dashboard is available...');
console.log('🔍 DataBrain plugin version check...');
if (typeof customElements !== 'undefined') {
  console.log('✅ Custom elements supported');
  setTimeout(() => {
    const isDefined = customElements.get('dbn-dashboard');
    console.log('🎯 dbn-dashboard custom element defined:', !!isDefined);
    if (isDefined) {
      console.log('✅ DataBrain component is ready to use');
    } else {
      console.error('❌ DataBrain component not found - check plugin import');
    }
  }, 1000);
} else {
  console.log('❌ Custom elements not supported');
}
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Reports from "./components/Reports";
import CreateDashboard from "./components/CreateDashboard";
import DashboardSelector from "./components/DashboardSelector";
import UserSwitcher from "./components/UserSwitcher";
import { User, USERS } from "./types/user";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "dbn-dashboard": any;
      "dbn-metric": any;
    }
  }
}

const CONFIG = {
  clientId: "101", // Top-level tenant ID (all users belong to client 101)
  dashboardId: "dbn-demo", // Dashboard ID (Embed ID) from your DataBrain Data App
  dashboardName: "Demo Dashboard", // Display name for the dashboard
};

function App() {
  const url = new URL(location.href);
  const urlToken = url.searchParams.get("token") || "";
  const urlDashboardId = url.searchParams.get("dashboardId") || "";
  const urlClientId = url.searchParams.get("clientId") || "";
  const urlDashboardName = url.searchParams.get("dashboardName") || "";

  const [currentUser, setCurrentUser] = useState<User>(USERS[0]);

  const clientId = urlClientId || CONFIG.clientId; // Use top-level tenant ID (101)
  const [currentDashboardId, setCurrentDashboardId] = useState(urlDashboardId || CONFIG.dashboardId);
  const [, setCurrentDashboardName] = useState(urlDashboardName || CONFIG.dashboardName);
  const dashboardId = currentDashboardId;

  const [token, setToken] = useState(urlToken);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('analytics');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('dashboard');
  const [dashboardSelectorKey, setDashboardSelectorKey] = useState(0);


  useEffect(() => {
    if (!urlToken) {
      if (!clientId) {
        setError(`Client ID not configured. Please set CONFIG.clientId in src/App.tsx line 18`);
        return;
      }
      if (!dashboardId) {
        setError(`Dashboard ID not configured. Please set CONFIG.dashboardId in src/App.tsx line 19`);
        return;
      }
      fetchGuestTokenFromBackend(clientId, currentUser.customerId);
    }
  }, [clientId, dashboardId, urlToken, currentUser.customerId]);

  const fetchGuestTokenFromBackend = async (clientId: string, customerId?: string) => {
    try {
      console.log('🔄 Fetching guest token...', { clientId, customerId });
      setIsLoading(true);
      setError(null);
      setToken(''); // Clear existing token while fetching
      const response = await fetch('http://localhost:3001/api/dashboard-guest-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientId,
          ...(customerId && { customerId: customerId })
        })
      });
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Guest token received:', data.guestToken ? `${data.guestToken.substring(0, 20)}...` : 'No token');

        // Test token validity immediately
        if (data.guestToken) {
          console.log('🧪 Testing token validity...');
          // We can't easily test the token without making a DataBrain API call
          // But we can at least check if it's a valid UUID format
          const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.guestToken);
          console.log('Token format valid (UUID):', isValidUUID);
        }

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

  const handleUserChange = (user: User) => {
    setCurrentUser(user);
    setSuccessMessage(`Switched to ${user.name} (${user.role})`);
    setToken('');
    fetchGuestTokenFromBackend(clientId, user.customerId);
    setTimeout(() => { setSuccessMessage(null); }, 3000);
  };


  const handleDashboardCreated = (dashboard: { dashboardId: string; embedId: string; dashboardName: string; description?: string }) => {
    setSuccessMessage(`Dashboard "${dashboard.dashboardName}" created successfully! Switching to new dashboard...`);
    setCurrentDashboardId(dashboard.embedId);
    setCurrentDashboardName(dashboard.dashboardName);
    setToken('');
    setDashboardSelectorKey(prev => prev + 1);
    setActiveAnalyticsTab('dashboard');
    setTimeout(() => { setSuccessMessage(null); }, 3000);
  };

  const handleCloseCreateDashboard = () => {
    setActiveAnalyticsTab('dashboard');
  };

  const handleDashboardSelect = async (embedId: string, dashboardName: string) => {
    console.log('🎯 Dashboard selected from selector:', { embedId, dashboardName });
    console.log('🔄 Previous dashboard ID:', currentDashboardId);

    // Prevent unnecessary re-selection if it's the same dashboard
    if (currentDashboardId === embedId && token) {
      console.log('ℹ️ Dashboard already selected and token exists, skipping re-selection');
      setActiveAnalyticsTab('dashboard');
      return;
    }

    console.log('🔄 Updating dashboard selection...');
    setCurrentDashboardId(embedId);
    setCurrentDashboardName(dashboardName);
    setActiveAnalyticsTab('dashboard');

    // Only fetch new token if we don't have one or dashboard changed
    if (!token || currentDashboardId !== embedId) {
      console.log('🔄 Fetching new token for dashboard:', embedId);
      await fetchGuestTokenFromBackend(clientId, currentUser.customerId);
    }

    console.log('ℹ️ Dashboard selection complete');
  };

  const hasRequiredConfig = token && clientId && dashboardId;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Configuration Error</CardTitle>
            <CardDescription>Please check your setup</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading && !hasRequiredConfig) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ecommerce analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-screen z-10 shadow-lg">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-800">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-semibold text-sm">
              DB
            </div>
            <span className="text-slate-100 font-semibold text-lg">Acme Corp</span>
          </div>

          {/* User Section */}
          <UserSwitcher
            currentUser={currentUser}
            onUserChange={handleUserChange}
          />
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {/* Analytics Section */}
          <div className="mb-6">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 px-3">
              Analytics
            </h3>
            <div className="space-y-1">
              <Button
                variant={activeNavItem === 'analytics' ? 'default' : 'ghost'}
                className="w-full justify-start text-slate-300 hover:text-slate-100"
                onClick={() => setActiveNavItem('analytics')}
              >
                <span className="mr-3">📊</span>
                Dashboard
              </Button>
              <Button
                variant={activeNavItem === 'reports' ? 'default' : 'ghost'}
                className="w-full justify-start text-slate-300 hover:text-slate-100"
                onClick={() => setActiveNavItem('reports')}
              >
                <span className="mr-3">📈</span>
                Reports
              </Button>
            </div>
          </div>

          {/* Workspace Section */}
          <div className="mb-6">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 px-3">
              Workspace
            </h3>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-slate-100">
                <span className="mr-3">👥</span>
                Users
              </Button>
              <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-slate-100">
                <span className="mr-3">🔗</span>
                Integrations
              </Button>
            </div>
          </div>

          {/* Admin Section */}
          <div className="mb-6">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 px-3">
              Admin
            </h3>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-slate-100">
                <span className="mr-3">📊</span>
                Monitoring
              </Button>
              <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-slate-100">
                <span className="mr-3">⚙️</span>
                Settings
              </Button>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-80 bg-background">
        <main className="p-6 min-h-screen">
          {activeNavItem === 'reports' ? (
            <Reports
              embedId={dashboardId}
              clientId={clientId}
            />
          ) : activeNavItem === 'analytics' ? (
            <>
              <DashboardSelector
                key={dashboardSelectorKey}
                clientId={clientId}
                selectedDashboardId={dashboardId}
                onDashboardSelect={handleDashboardSelect}
                activeTab={activeAnalyticsTab}
                onTabChange={setActiveAnalyticsTab}
                embedId={dashboardId}
                autoSelectFirst={false}
                debugInfo={{
                  token,
                  currentUser,
                  currentDashboardId,
                  configDashboardId: CONFIG.dashboardId
                }}
              />

              {activeAnalyticsTab === 'create' ? (
                <div className="mt-6">
                  <CreateDashboard
                    isOpen={true}
                    onClose={handleCloseCreateDashboard}
                    onSuccess={handleDashboardCreated}
                    clientId={clientId}
                    inline={true}
                  />
                </div>
              ) : (
                <div>
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                      <p className="text-muted-foreground">Loading ecommerce analytics...</p>
                    </div>
                  )}

                  {token && clientId && dashboardId ? (
                    <>
                      <div className="border rounded-lg p-4 bg-white min-h-[400px]">
                        <div className="mb-4 text-sm text-muted-foreground">
                          🎯 DataBrain Dashboard Component (embedId: {dashboardId})
                        </div>
                        <div className="mb-2 text-xs text-gray-500">
                          Status: {token ? '✅ Token Available' : '❌ No Token'} | Client: {clientId} | Dashboard: {dashboardId}
                        </div>

                        {token ? (
                          <div>
                            <p className="text-sm text-blue-600 mb-2">🔄 Rendering DataBrain component...</p>
                            <p className="text-xs text-gray-500 mb-4">Token: {token.substring(0, 20)}... | Dashboard: {dashboardId}</p>
                            <dbn-dashboard
                              token={token}
                              dashboard-id={dashboardId}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-32 text-muted-foreground">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                            <span>Waiting for valid token...</span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <p className="text-muted-foreground mb-4">Loading dashboard configuration...</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-center gap-2">
                            Token: <Badge variant={token ? "default" : "secondary"}>{token ? '✅ Available' : '❌ Missing'}</Badge>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            Client ID: <Badge variant={clientId ? "default" : "secondary"}>{clientId ? '✅ Available' : '❌ Missing'}</Badge>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            Dashboard ID: <Badge variant={dashboardId ? "default" : "secondary"}>{dashboardId ? '✅ Available' : '❌ Missing'}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          ) : null}
        </main>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-4">
              <p className="text-sm font-medium">{successMessage}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default App;