/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
import "@databrainhq/plugin/web";
import { useState, useEffect, useCallback } from "react";

// Add debugging for DataBrain component loading
console.log('🔍 DataBrain plugin imported, checking if dbn-dashboard is available...');
console.log('🔍 DataBrain plugin version check...');

// Configure DataBrain API base URL
// The DataBrain plugin will make direct API calls to DataBrain servers using the token from your backend
const DATABRAIN_API_BASE_URL = "https://uat-api.usedatabrain.com"; // UAT environment
// const DATABRAIN_API_BASE_URL = "https://api.usedatabrain.com"; // Production environment

// Set global DataBrain configuration
if (typeof window !== 'undefined') {
  window.dbn = window.dbn || {};
  window.dbn.baseUrl = DATABRAIN_API_BASE_URL;
  console.log('🔧 DataBrain baseUrl configured:', window.dbn.baseUrl);
}

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bug } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  interface Window {
    dbn?: {
      baseUrl?: string;
    };
  }
}

const CONFIG = {
  clientId: "101", // Top-level tenant ID (all users belong to client 101)
  dashboardId: "dbn-demo", // Default dashboard
  dashboardName: "Demo Dashboard" // Default dashboard name
};

function App() {
  const url = new URL(location.href);
  const urlToken = url.searchParams.get("token") || "";
  const urlDashboardId = url.searchParams.get("dashboardId") || "";
  const urlClientId = url.searchParams.get("clientId") || "";
  const urlDashboardName = url.searchParams.get("dashboardName") || "";

  // Initialize user based on URL parameter or default to first user
  const urlUser = url.searchParams.get("user");
  const initialUser = urlUser ? USERS.find(u => u.id === urlUser) || USERS[0] : USERS[0];
  const [currentUser, setCurrentUser] = useState<User>(initialUser);
  const [userIdInput, setUserIdInput] = useState<string>(initialUser.id);

  const clientId = urlClientId || CONFIG.clientId; // Use tenant ID (101) - shared across users
  const [currentDashboardId, setCurrentDashboardId] = useState(urlDashboardId || CONFIG.dashboardId);
  const [, setCurrentDashboardName] = useState(urlDashboardName || CONFIG.dashboardName);
  const dashboardId = currentDashboardId;

  const [token, setToken] = useState(urlToken);
  const [dashboardTokens, setDashboardTokens] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('analytics');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dashboardSelectorKey, setDashboardSelectorKey] = useState(0);
  const [availableDashboards, setAvailableDashboards] = useState<Array<{ embedId: string; name: string; embedType: string; metadata: any; isDashboard: boolean; isMetric: boolean }>>([]);
  const [activeDashboardTab, setActiveDashboardTab] = useState<string>('');

  const fetchGuestTokenForDashboards = useCallback(async (dashboardIds: string[], clientId: string, customerId?: string) => {
    try {
      console.log('🔄 Fetching guest token for multiple dashboards:', {
        dashboardIds,
        clientId,
        customerId,
        userPersona: currentUser.name
      });

      const requestBody = {
        clientId: clientId,
        ...(customerId && { customerId: customerId }),
        dashboardIds: dashboardIds,
        userPersona: currentUser.name
      };

      console.log('🎯 Guest token request with multiple dashboard app filters:', requestBody);

      const response = await fetch('http://localhost:3001/api/dashboard-guest-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Guest token received for multiple dashboards:', {
          dashboardIds,
          token: data.guestToken ? `${data.guestToken.substring(0, 20)}...` : 'No token',
          customerId: customerId,
          userPersona: currentUser.name,
          hasFiltering: !!(customerId && dashboardIds.length > 0)
        });

        if (data.guestToken) {
          // Cache the same token for all dashboards since it works for multiple
          const tokenCache: Record<string, string> = {};
          dashboardIds.forEach(dashboardId => {
            tokenCache[dashboardId] = data.guestToken;
          });

          setDashboardTokens(prev => ({
            ...prev,
            ...tokenCache
          }));

          // Set as current token
          setToken(data.guestToken);

          console.log('🎯 Dashboard app filters applied for multiple dashboards:', {
            filterName: 'Customer App filter',
            customerValue: customerId,
            dashboardIds: dashboardIds,
            dashboardCount: dashboardIds.length
          });
        }

        setError(null);
        return data.guestToken;
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
        return null;
      }
    } catch (error) {
      setError('Failed to connect to backend. Make sure the server is running on http://localhost:3001');
      return null;
    }
  }, [currentUser.name]);

  useEffect(() => {
    if (!urlToken) {
      if (!clientId) {
        setError(`Client ID not configured. Please set CONFIG.clientId in src/App.tsx`);
        return;
      }

      // STEP 1: Create initial guest token with customer context FIRST
      console.log('🔐 Step 1: Creating initial guest token with customer context...');
      setIsLoading(true);
      fetchGuestTokenForDashboards([], clientId, currentUser.customerId).finally(() => {
        setIsLoading(false);
      });
    }
  }, [clientId, urlToken, currentUser.customerId, fetchGuestTokenForDashboards]);

  const handleUserChange = (user: User) => {
    console.log('👤 User switching to:', user.name, '- Following exact same API flow as login');

    // Update current user and clear all cached state
    setCurrentUser(user);
    setUserIdInput(user.id);
    setSuccessMessage(`Switched to ${user.name} (${user.role}) - Refreshing data...`);

    // Clear all cached tokens and state when switching users
    setDashboardTokens({});
    setToken('');
    setAvailableDashboards([]);
    setActiveDashboardTab('');

    // Update URL to reflect current user (for debugging/bookmarking)
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('user', user.id);
    window.history.replaceState({}, '', currentUrl.toString());

    // Force refresh of dashboard selector to get new user's dashboards
    setDashboardSelectorKey(prev => prev + 1);

    setTimeout(() => { setSuccessMessage(null); }, 3000);
  };

  const handleUserIdInputChange = (userId: string) => {
    const user = USERS.find(u => u.id === userId);
    if (user) {
      handleUserChange(user);
    } else {
      console.warn('User not found:', userId);
    }
  };


  const handleDashboardsLoaded = (dashboards: Array<{ embedId: string; name: string; embedType: string; metadata: any; isDashboard: boolean; isMetric: boolean }>) => {
    console.log('📊 Step 2: Dashboards loaded with customer filtering applied:', dashboards);
    setAvailableDashboards(dashboards);

    // Set the first dashboard as active if none is selected
    if (dashboards.length > 0 && !activeDashboardTab) {
      setActiveDashboardTab(dashboards[0].embedId);
      setCurrentDashboardId(dashboards[0].embedId);
      setCurrentDashboardName(dashboards[0].name);
    }

    // STEP 3: Update guest token to include specific dashboard filters (optional optimization)
    console.log('🎯 Step 3: Updating token with specific dashboard filters...');
    const dashboardsOnly = dashboards.filter(d => d.isDashboard);
    const dashboardIds = dashboardsOnly.map(d => d.embedId);

    if (dashboardIds.length > 0) {
      console.log(`🔄 Updating token for ${dashboardIds.length} specific dashboards:`, dashboardIds);
      setIsLoading(true);
      fetchGuestTokenForDashboards(dashboardIds, clientId, currentUser.customerId).finally(() => {
        setIsLoading(false);
      });
    }
  };

  const handleDashboardCreated = (dashboard: { dashboardId: string; embedId: string; dashboardName: string; description?: string }) => {
    console.log('🎯 New dashboard created - immediately focusing and rendering:', dashboard);

    setSuccessMessage(`Dashboard "${dashboard.dashboardName}" created successfully! Loading dashboard...`);

    // Immediately set the new dashboard as active
    setCurrentDashboardId(dashboard.embedId);
    setCurrentDashboardName(dashboard.dashboardName);
    setActiveDashboardTab(dashboard.embedId);

    // Add the new dashboard to available dashboards
    const newDashboard = {
      embedId: dashboard.embedId,
      name: dashboard.dashboardName,
      embedType: 'dashboard',
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: currentUser.name
      },
      isDashboard: true,
      isMetric: false
    };

    setAvailableDashboards(prev => {
      const updated = [...prev, newDashboard];
      console.log('📊 Updated available dashboards:', updated.map(d => ({ embedId: d.embedId, name: d.name })));
      return updated;
    });

    // Immediately fetch token for all dashboards including the new one
    const allDashboardIds = [...availableDashboards.filter(d => d.isDashboard).map(d => d.embedId), dashboard.embedId];
    console.log('🔄 Fetching token for all dashboards including new one:', allDashboardIds);

    setIsLoading(true);
    fetchGuestTokenForDashboards(allDashboardIds, clientId, currentUser.customerId).then(() => {
      console.log('✅ Token updated - new dashboard should now be rendered');
      setSuccessMessage(`Dashboard "${dashboard.dashboardName}" is now active!`);
      setTimeout(() => { setSuccessMessage(null); }, 2000);
    }).catch((error) => {
      console.error('❌ Failed to fetch token for new dashboard:', error);
      setSuccessMessage(`Dashboard created but failed to load. Please refresh.`);
      setTimeout(() => { setSuccessMessage(null); }, 3000);
    }).finally(() => {
      setIsLoading(false);
    });

    // Force refresh of dashboard selector to show the new dashboard
    setDashboardSelectorKey(prev => prev + 1);
  };

  const handleCloseCreateDashboard = () => {
    // Switch back to the currently active dashboard or first available dashboard
    if (currentDashboardId && availableDashboards.some(d => d.embedId === currentDashboardId)) {
      setActiveDashboardTab(currentDashboardId);
    } else if (availableDashboards.length > 0) {
      setActiveDashboardTab(availableDashboards[0].embedId);
    }
  };

  const handleDashboardTabChange = (embedId: string) => {
    console.log('🎯 Dashboard tab changed to:', embedId);
    setActiveDashboardTab(embedId);

    // Handle create tab separately
    if (embedId === 'create') {
      return;
    }

    // Find the dashboard and update state
    const selectedDashboard = availableDashboards.find(d => d.embedId === embedId);
    if (selectedDashboard) {
      console.log('⚡ Instant dashboard switch to:', selectedDashboard.name);

      // Update dashboard ID immediately for instant UI response
      setCurrentDashboardId(embedId);
      setCurrentDashboardName(selectedDashboard.name);

      // Check if we have a cached token for this dashboard
      const cachedToken = dashboardTokens[embedId];
      if (cachedToken) {
        console.log('🚀 Using cached multi-dashboard token for instant switch');
        setToken(cachedToken);
      } else {
        console.log('⚠️ No cached token found - this should not happen with multi-dashboard tokens');
        // Fallback: create token for all dashboards again
        const dashboardIds = availableDashboards.filter(d => d.isDashboard).map(d => d.embedId);
        fetchGuestTokenForDashboards(dashboardIds, clientId, currentUser.customerId);
      }
    }
  };

  const handleDashboardSelect = async (embedId: string, dashboardName: string) => {
    console.log('🎯 Dashboard selected from selector:', { embedId, dashboardName });

    // Update UI immediately
    setCurrentDashboardId(embedId);
    setCurrentDashboardName(dashboardName);
    setActiveDashboardTab(embedId);

    // Check for cached token first
    const cachedToken = dashboardTokens[embedId];
    if (cachedToken) {
      console.log('🚀 Using cached multi-dashboard token for dashboard selection');
      setToken(cachedToken);
    } else {
      console.log('🔄 Creating token for all dashboards');
      const dashboardIds = availableDashboards.filter(d => d.isDashboard).map(d => d.embedId);
      await fetchGuestTokenForDashboards(dashboardIds, clientId, currentUser.customerId);
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

          {/* Quick User ID Input */}
          <div className="mb-4 p-3 bg-slate-800 rounded-lg border border-slate-700">
            <label className="block text-slate-300 text-xs font-medium mb-2">
              Quick User Switch
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUserIdInputChange(userIdInput);
                  }
                }}
                placeholder="michael, jake"
                className="flex-1 px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              <button
                onClick={() => handleUserIdInputChange(userIdInput)}
                className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                Go
              </button>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Current: {currentUser.name} ({currentUser.id})
            </div>
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
              {/* Dashboard Tabs */}
              {availableDashboards.length > 0 ? (
                <Tabs value={activeDashboardTab} onValueChange={handleDashboardTabChange}>
                  <div className="flex items-center justify-between mb-4">
                    <TabsList>
                      {availableDashboards.map((dashboard) => (
                        <TabsTrigger key={dashboard.embedId} value={dashboard.embedId}>
                          {dashboard.name}
                        </TabsTrigger>
                      ))}
                      <TabsTrigger value="create">
                        + Create New
                      </TabsTrigger>
                    </TabsList>

                    {/* Debug Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Bug className="h-4 w-4 mr-2" />
                          Debug
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-80 bg-white border border-slate-200 shadow-lg z-[9999] relative"
                        align="end"
                        sideOffset={5}
                      >
                        <DropdownMenuLabel className="bg-slate-50">🔧 Debug Information</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <div className="p-3 text-sm space-y-2">
                          <div>
                            <span className="font-medium">🎯 DataBrain Dashboard Component:</span>
                          </div>
                          <div>
                            <span className="font-medium">Embed ID:</span> {dashboardId}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span> {token ? '✅ Token Available' : '❌ No Token'}
                          </div>
                          <div>
                            <span className="font-medium">Client ID:</span> {clientId}
                          </div>
                          <div>
                            <span className="font-medium">Dashboard ID:</span> {dashboardId}
                          </div>
                          <div>
                            <span className="font-medium">Token:</span>{' '}
                            {token ? `${token.substring(0, 20)}...` : 'Not available'}
                          </div>
                          <div>
                            <span className="font-medium">User:</span> {currentUser.name} ({currentUser.role})
                          </div>
                          <div>
                            <span className="font-medium">Customer ID:</span> {currentUser.customerId}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Token Valid:</span>
                            <Badge variant={token ? "default" : "destructive"}>
                              {token ? '✅' : '❌'}
                            </Badge>
                          </div>
                          {!token && (
                            <div className="text-destructive font-medium text-xs">
                              ⚠️ Token missing - this will cause invalid_token error
                            </div>
                          )}
                          {token && (
                            <div className="text-blue-600 font-medium text-xs">
                              🔄 Rendering DataBrain component...
                            </div>
                          )}
                        </div>

                        <DropdownMenuSeparator />
                        <div className="p-3 text-xs text-muted-foreground">
                          Available Dashboards: {availableDashboards.length}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Dashboard Content */}
                  {availableDashboards.map((dashboard) => (
                    <TabsContent key={dashboard.embedId} value={dashboard.embedId}>
                      {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                          <p className="text-muted-foreground">Loading ecommerce analytics...</p>
                        </div>
                      )}

                      {token && clientId && currentDashboardId === dashboard.embedId ? (
                        <div className="border rounded-lg bg-white min-h-[400px]">
                          {/* Dashboard Header with Name */}
                          <div className="border-b bg-slate-50 px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h1 className="text-xl font-semibold text-slate-900">{dashboard.name}</h1>
                                <p className="text-sm text-slate-600 mt-1">
                                  Dashboard for {currentUser.name} ({currentUser.role})
                                </p>
                              </div>
                              <div className="text-xs text-slate-500">
                                ID: {dashboard.embedId}
                              </div>
                            </div>
                          </div>

                          {/* Dashboard Content */}
                          <div className="p-4">
                            {token ? (
                              <dbn-dashboard
                                token={token}
                                dashboard-id={dashboard.embedId}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-32 text-muted-foreground">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                                <span>Waiting for valid token...</span>
                              </div>
                            )}
                          </div>
                        </div>
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
                                Dashboard ID: <Badge variant={dashboard.embedId ? "default" : "secondary"}>{dashboard.embedId ? '✅ Available' : '❌ Missing'}</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                  ))}

                  {/* Create New Dashboard Tab */}
                  <TabsContent value="create">
                    <div className="mt-6">
                      <CreateDashboard
                        isOpen={true}
                        onClose={handleCloseCreateDashboard}
                        onSuccess={handleDashboardCreated}
                        clientId={clientId}
                        inline={true}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <>
                  {/* Show DashboardSelector when no dashboards are loaded yet */}
                  <DashboardSelector
                    key={dashboardSelectorKey}
                    clientId={clientId}
                    selectedDashboardId={dashboardId}
                    onDashboardSelect={handleDashboardSelect}
                    onDashboardsLoaded={handleDashboardsLoaded}
                    onCreateNew={() => setActiveDashboardTab('create')}
                    embedId={dashboardId}
                    autoSelectFirst={false}
                    debugInfo={{
                      token,
                      currentUser,
                      currentDashboardId,
                      configDashboardId: CONFIG.dashboardId
                    }}
                  />
                </>
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