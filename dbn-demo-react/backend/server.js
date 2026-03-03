/* global process */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// DataBrain Configuration - All values loaded from environment variables
const DATABRAIN_API_KEY = process.env.DATABRAIN_API_KEY;
const dataAppName = process.env.DATABRAIN_DATA_APP_NAME;
const API_BASE_URL = process.env.DATABRAIN_API_BASE_URL || 'https://api.usedatabrain.com'; // Defaults to production
const workspaceName = process.env.DATABRAIN_WORKSPACE_NAME || 'Demo Workspace';

// Helper function to generate dashboard ID
const generateDashboardId = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-' + Date.now();
};

// Fetch available datamarts from DataBrain
app.get('/api/datamarts/list', async (req, res) => {
  try {
    if (!DATABRAIN_API_KEY || DATABRAIN_API_KEY === 'your-databrain-api-key-here') {
      return res.status(500).json({
        error: 'API Key not configured'
      });
    }

    console.log('📊 Fetching datamarts from DataBrain...');

    const response = await fetch(`${API_BASE_URL}/api/v2/dataApp/datamart/list`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATABRAIN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isPagination: false })
    });

    const data = await response.json();

    if (response.ok && data.data) {
      const datamarts = data.data.map(dm => ({
        name: dm.name,
        schemaName: dm.datamartOrganization?.schemaName,
        tableName: dm.datamartOrganization?.tableName,
        integration: dm.companyIntegration?.name
      }));

      console.log(`✅ Found ${datamarts.length} datamarts:`, datamarts.map(d => d.name));

      res.json({
        success: true,
        datamarts: datamarts
      });
    } else {
      throw new Error(data.error?.message || 'Failed to fetch datamarts');
    }
  } catch (error) {
    console.error('ERROR fetching datamarts:', error);
    res.status(500).json({
      error: 'Failed to fetch datamarts',
      details: error.message
    });
  }
});

// Configuration Management Endpoints
// Check configuration status
app.get('/api/config/status', (req, res) => {
  try {
    const status = {
      isConfigured: !!(DATABRAIN_API_KEY && dataAppName),
      hasApiKey: !!DATABRAIN_API_KEY,
      hasDataAppName: !!dataAppName,
      apiBaseUrl: API_BASE_URL,
      workspaceName: workspaceName
    };

    res.json(status);
  } catch (error) {
    console.error('ERROR checking config status:', error);
    res.status(500).json({ error: 'Failed to check configuration status' });
  }
});

// Validate configuration by testing credentials with DataBrain API
app.post('/api/config/validate', async (req, res) => {
  try {
    const { apiKey, dataAppName: testDataAppName } = req.body;

    // Validate required fields
    if (!apiKey || !testDataAppName) {
      return res.status(400).json({
        error: 'API Key and Data App Name are required',
        valid: false
      });
    }

    // Test the credentials by creating a guest token with DataBrain API
    try {
      const testResponse = await fetch(`${API_BASE_URL}/api/v2/guest-token/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId: 'validation-test',
          dataAppName: testDataAppName
        })
      });

      const testData = await testResponse.json();

      if (testResponse.ok && testData.token) {
        // Credentials are valid
        return res.json({
          valid: true,
          message: 'Credentials validated successfully'
        });
      } else {
        // Invalid credentials or API error
        let errorMessage = 'Invalid credentials';

        if (testData.error) {
          if (testData.error.includes('Invalid key') || testData.error.includes('Invalid token') || testData.error.includes('Unauthorized')) {
            errorMessage = 'Invalid API Key';
          } else if (testData.error.includes('dataApp') || testData.error.includes('not found')) {
            errorMessage = 'Data App Name not found';
          } else {
            errorMessage = testData.error;
          }
        }

        return res.status(401).json({
          valid: false,
          error: errorMessage
        });
      }
    } catch (apiError) {
      return res.status(500).json({
        valid: false,
        error: 'Failed to connect to DataBrain API. Please check your internet connection.'
      });
    }
  } catch (error) {
    console.error('ERROR validating config:', error);
    res.status(500).json({
      valid: false,
      error: 'Failed to validate configuration'
    });
  }
});

// Guest token for Dashboards (data app-based, v2 API)
// API Reference: https://docs.usedatabrain.com/developer-docs/helpers/api-reference/token
// Embedding Guide: https://docs.usedatabrain.com/developer-docs/how-to-embed
app.post('/api/dashboard-guest-token', async (req, res) => {
  try {
    // Validate API Key configuration
    if (!DATABRAIN_API_KEY) {
      console.error('ERROR: API Key not configured properly');
      return res.status(500).json({
        error: 'API Key not configured. Please set DATABRAIN_API_KEY environment variable.',
        details: 'Set the environment variable with your actual DataBrain API key'
      });
    }

    // Validate data app name configuration
    if (!dataAppName) {
      console.error('ERROR: Data App Name not configured properly');
      return res.status(500).json({
        error: 'Data App Name not configured. Please set DATABRAIN_DATA_APP_NAME environment variable.',
        details: 'Set the environment variable with the exact name of your DataBrain Data App'
      });
    }

    const { clientId, customerId, dashboardIds, userPersona, filterFieldName, filterValue } = req.body;

    // Validate required parameters
    if (!clientId) {
      return res.status(400).json({
        error: 'clientId is required',
        details: 'clientId must be provided in the request body as a unique identifier for the client/user'
      });
    }

    // For demo purposes, we expect clientId to be 'Team 1', 'Team 2', etc. (top-level tenant)
    // Validate clientId format
    if (!clientId.startsWith('Team ')) {
      console.warn(`Warning: Expected clientId like 'Team 1' but received '${clientId}' - continuing anyway for demo flexibility`);
    }


    // Build request body following the new v2 API specification
    // Reference: https://docs.usedatabrain.com/developer-docs/helpers/api-reference/token
    const requestBody = {
      clientId: clientId,
      dataAppName: dataAppName
    };

    // Add optional parameters for filtering and permissions
    // Using the new API structure with params object for filters
    // Note: Only apply filters to dashboards that have the app filter configured
    // This prevents errors when newly created dashboards don't have the app filter yet
    if (dashboardIds && dashboardIds.length > 0 && filterFieldName && filterValue) {
      // Filter to only apply app filters to known template dashboards that have filters configured
      // Newly created user dashboards don't inherit app filter config automatically
      const knownDashboardsWithFilters = ['dbn-demo']; // Template dashboards with app filters
      const dashboardsToFilter = dashboardIds.filter(id => knownDashboardsWithFilters.includes(id));

      if (dashboardsToFilter.length > 0) {
        requestBody.params = {};

        // Add dashboard-level filters only to dashboards that support them
        requestBody.params.dashboardAppFilters = dashboardsToFilter.map(dashboardId => ({
          dashboardId: dashboardId,
          values: {
            [filterFieldName]: filterValue  // Dynamic filter field name and value
          },
          isShowOnUrl: false
        }));

        console.log(`🔍 Applying app filter: ${filterFieldName} = "${filterValue}" to ${dashboardsToFilter.length} dashboard(s):`, dashboardsToFilter);
        if (dashboardIds.length > dashboardsToFilter.length) {
          console.log(`⚠️ Skipping app filter for ${dashboardIds.length - dashboardsToFilter.length} user-created dashboard(s) (no filter configured)`);
        }
      } else {
        console.log(`⚠️ No dashboards with app filter configuration found. Skipping filter.`);
      }
    } else {
      console.log(`⚠️ Skipping app filter (filterFieldName: ${filterFieldName}, filterValue: ${filterValue}, dashboards: ${dashboardIds?.length || 0})`);
    }

    // Optional: Add permissions configuration for UI controls
    // Customize based on your requirements
    // Note: Email reports are controlled by accessSettings.isAllowEmailReports at embed level, not here
    requestBody.permissions = {
      isEnableManageMetrics: true,
      isEnableCreateDashboardView: true,
      isEnableCustomizeLayout: true,
      isEnableUnderlyingData: true,
      isEnableDownloadMetrics: true,
      isShowSideBar: true,
      isShowDashboardName: true
    };

    // Optional: Add token expiration (in milliseconds)
    // Uncomment to enable token expiration
    // requestBody.expiryTime = 3600000; // 1 hour

    // Log the complete request body being sent to DataBrain
    console.log('📤 DataBrain API Request:', JSON.stringify(requestBody, null, 2));

    // Call DataBrain v2 API as per official documentation
    const response = await fetch(`${API_BASE_URL}/api/v2/guest-token/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATABRAIN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (response.ok && data.token) {
      const guestToken = data.token;

      res.json({
        success: true,
        guestToken: guestToken,
        clientId: clientId,
        customerId: customerId,
        dashboardIds: dashboardIds,
        userPersona: userPersona,
        dataAppName: dataAppName,
        hasDashboardAppFilters: !!(dashboardIds && dashboardIds.length > 0 && customerId),
        filterDetails: dashboardIds && dashboardIds.length > 0 && customerId ? {
          filterType: 'dashboardAppFilters',
          filterValue: customerId,
          appliedToDashboards: dashboardIds,
          totalDashboards: dashboardIds.length
        } : null,
        message: dashboardIds && dashboardIds.length > 0 && customerId
          ? `Guest token created successfully with dashboard app filters for ${userPersona || 'user'} (Customer ID: ${customerId}) across ${dashboardIds.length} dashboards`
          : 'Guest token created successfully for dashboard embedding'
      });
    } else {
      console.error('ERROR: Failed to create guest token:', data);
      res.status(400).json({
        error: 'Failed to create data app-based guest token',
        details: data,
        apiResponse: {
          status: response.status,
          statusText: response.statusText
        },
        suggestion: 'Verify that your API Key has permission to create guest tokens for the specified data app'
      });
    }

  } catch (apiError) {
    console.error('ERROR: Exception during guest token creation:', apiError);
    res.status(500).json({
      error: 'Failed to connect to DataBrain API',
      details: apiError.message,
      endpoint: `${API_BASE_URL}/api/v2/guest-token/create`
    });
  }
});

// New endpoint to fetch dashboards from data app
app.post('/api/v2/dashboards', async (req, res) => {
  try {
    // Check if API key is configured
    if (!DATABRAIN_API_KEY || DATABRAIN_API_KEY === 'your-databrain-api-key-here') {
      return res.status(500).json({
        error: 'API Key not configured. Please set DATABRAIN_API_KEY in backend/server.js line 10.'
      });
    }

    const { isPagination = false, pageNumber = 1 } = req.body;


    // Call DataBrain Data App Embedding API for dashboards
    const response = await fetch(`${API_BASE_URL}/api/v2/dataApp/dashboards`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATABRAIN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        isPagination,
        pageNumber
      })
    });

    const data = await response.json();

    if (response.ok && !data.error) {
      // Transform the response to include both id and externalDashboardId
      const transformedDashboards = (data.data || []).map(dashboard => ({
        name: dashboard.name || `Dashboard - ${dashboard.externalDashboardId}`,
        externalDashboardId: dashboard.externalDashboardId,
        id: dashboard.id,
        description: dashboard.description || `Analytics dashboard: ${dashboard.name || dashboard.externalDashboardId}`,
        lastUpdated: dashboard.lastUpdated || new Date().toISOString()
      }));

      res.json({
        success: true,
        dashboards: transformedDashboards
      });
    } else {
      // Provide sample dashboards if API fails
      const sampleDashboards = [
        {
          name: 'Sales Analytics Dashboard',
          externalDashboardId: 'dbn-demo'
        },
        {
          name: 'Customer Insights Dashboard',
          externalDashboardId: 'customer-analytics'
        },
        {
          name: 'Product Performance Dashboard',
          externalDashboardId: 'product-dashboard'
        }
      ];

      res.json({
        success: true,
        dashboards: sampleDashboards
      });
    }

  } catch (apiError) {
    // Provide sample dashboards on error
    const sampleDashboards = [
      {
        name: 'Sales Analytics Dashboard',
        externalDashboardId: 'dbn-demo'
      },
      {
        name: 'Customer Insights Dashboard',
        externalDashboardId: 'customer-analytics'
      },
      {
        name: 'Product Performance Dashboard',
        externalDashboardId: 'product-dashboard'
      }
    ];

    res.json({
      success: true,
      dashboards: sampleDashboards
    });
  }
});

// New endpoint to try getting embeddable metrics from workspace context
app.post('/api/v2/embeddable-metrics', async (req, res) => {
  try {
    // Check if API key is configured
    if (!DATABRAIN_API_KEY || DATABRAIN_API_KEY === 'your-databrain-api-key-here') {
      return res.status(500).json({
        error: 'API Key not configured. Please set DATABRAIN_API_KEY in backend/server.js line 10.'
      });
    }

    const { workspaceName, dashboardId } = req.body;


    // Try the traditional workspace-based API
    const response = await fetch(`${API_BASE_URL}/api/metrics`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DATABRAIN_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && !data.error) {
      const metrics = data.map((metric, index) => ({
        id: metric.id || `metric-${index}`,
        name: metric.name || `Metric ${index + 1}`,
        description: metric.description || `Metric: ${metric.name}`,
        value: Math.floor(Math.random() * 10000),
        unit: metric.unit || '',
        category: metric.category || 'General',
        status: 'Active',
        lastUpdated: new Date().toISOString()
      }));


      res.json({
        success: true,
        metrics: metrics
      });
    } else {
      throw new Error('Traditional API failed');
    }

  } catch (apiError) {
    res.status(500).json({
      error: 'Failed to connect to DataBrain Traditional API',
      details: apiError.message
    });
  }
});

// Fetch dashboard metrics endpoint
app.post('/api/v2/dashboard-metrics', async (req, res) => {
  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Check if API key is configured
    if (!DATABRAIN_API_KEY || DATABRAIN_API_KEY === 'your-databrain-api-key-here') {
      return res.status(500).json({
        error: 'API Key not configured. Please set DATABRAIN_API_KEY in backend/server.js line 10.'
      });
    }

    const { embedId, clientId } = req.body;

    if (!embedId || !clientId) {
      return res.status(400).json({
        error: 'embedId and clientId are required'
      });
    }

    // For now, return empty metrics array since we're focusing on basic dashboard display
    return res.json({
      success: true,
      metrics: [],
      source: 'dashboard-metrics-v2-api'
    });

  } catch (error) {
    console.error('ERROR in /api/v2/dashboard-metrics:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Fetch metrics by workspace and dashboard using DataBrain Embedding API
app.post('/api/v2/metrics', async (req, res) => {
  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Check if API key is configured
    if (!DATABRAIN_API_KEY || DATABRAIN_API_KEY === 'your-databrain-api-key-here') {
      return res.status(500).json({
        error: 'API Key not configured. Please set DATABRAIN_API_KEY in backend/server.js line 10.'
      });
    }

    const { embedId, clientId, dashboardId } = req.body;
    const dashboardToUse = dashboardId || embedId;
    const workspaceToUse = workspaceName;

    console.log('Parameters:', {
      embedId,
      clientId,
      dashboardId,
      dashboardToUse,
      workspaceToUse
    });

    const requestBody = {
      workspaceName: workspaceToUse,
      dashboardId: dashboardToUse,
      isPagination: false
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    // Use the DataBrain Embedding API for metrics by workspace and dashboard
    const response = await fetch(`${API_BASE_URL}/api/v2/workspace/dashboard/metrics`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATABRAIN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });


    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (response.ok && data.data && Array.isArray(data.data)) {

      // Transform the API response
      const metrics = data.data.map((metric, index) => ({
        id: metric.metricId || `metric-${index}`,
        metricId: metric.metricId,
        name: metric.name || `Metric ${index + 1}`,
        description: `Metric: ${metric.name}`,
        value: Math.floor(Math.random() * 10000),
        unit: '',
        category: 'General',
        status: 'Active',
        lastUpdated: new Date().toISOString(),
        dashboardId: dashboardToUse,
        workspaceName: workspaceToUse
      }));

      console.log('Sample metric:', JSON.stringify(metrics[0], null, 2));

      return res.json({
        success: true,
        metrics: metrics,
        source: 'workspace-dashboard-metrics-api'
      });
    } else if (data.error) {
      return res.status(400).json({
        error: 'DataBrain API Error',
        details: data.error
      });
    } else {
      console.log('ERROR: Invalid API response structure:', {
        responseOk: response.ok,
        hasData: !!data.data,
        isDataArray: Array.isArray(data.data),
        dataKeys: Object.keys(data)
      });
    }

    throw new Error('Invalid API response structure');

  } catch (apiError) {
    console.log('ERROR: Error details:', {
      message: apiError.message,
      stack: apiError.stack,
      name: apiError.name
    });

    res.status(500).json({
      error: 'Failed to connect to DataBrain API',
      details: apiError.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Create Dashboard using DataBrain v2 API
app.post('/api/v2/create-dashboard', async (req, res) => {
  try {
    // Validate API Key configuration
    if (!DATABRAIN_API_KEY) {
      console.error('ERROR: API Key not configured properly');
      return res.status(500).json({
        error: 'API Key not configured. Please set DATABRAIN_API_KEY environment variable.',
        details: 'Set the environment variable with your actual DataBrain API key'
      });
    }

    // Validate data app name configuration
    if (!dataAppName) {
      console.error('ERROR: Data App Name not configured properly');
      return res.status(500).json({
        error: 'Data App Name not configured. Please set DATABRAIN_DATA_APP_NAME environment variable.',
        details: 'Set the environment variable with the exact name of your DataBrain Data App'
      });
    }

    let { dashboardName, description, datamartName, dashboardId, userIdentifier, clientId, isPrivate } = req.body;

    // Validate required parameters
    if (!dashboardName) {
      return res.status(400).json({
        error: 'dashboardName is required',
        details: 'Dashboard name must be provided in the request body'
      });
    }

    // If no datamartName provided, fetch the first available datamart
    if (!datamartName) {
      console.log('📊 No datamart provided, fetching from DataBrain...');
      try {
        const datamartResponse = await fetch(`${API_BASE_URL}/api/v2/dataApp/datamart/list`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${DATABRAIN_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isPagination: false })
        });

        const datamartData = await datamartResponse.json();

        if (datamartResponse.ok && datamartData.data && datamartData.data.length > 0) {
          datamartName = datamartData.data[0].name;
          console.log(`✅ Auto-selected datamart: ${datamartName}`);
        } else {
          console.warn('⚠️ No datamarts found, using default');
          datamartName = 'Sales Management Datamart'; // Fallback
        }
      } catch (dmError) {
        console.error('ERROR fetching datamarts:', dmError);
        datamartName = 'Sales Management Datamart'; // Fallback on error
      }
    }

    // Validate clientId
    if (!clientId) {
      return res.status(400).json({
        error: 'clientId is required',
        details: 'Client ID must be provided in the request body'
      });
    }

    // Generate new unique dashboard ID for the new dashboard
    const newDashboardId = generateDashboardId(dashboardName);

    

    // Determine privacy settings based on isPrivate flag
    const dashboardIsPrivate = isPrivate === true;
    
    // Prepare the request body for DataBrain dashboardEmbed/create API
    // This creates a new dashboard for a specific client with template filters
    // Based on DataBrain API docs: name must be in metadata, not at top level
    const requestBody = {
      dashboardId: newDashboardId, // New unique dashboard ID
      clientId: clientId, // Client identifier for multi-tenant access
      templateDashboardId: 'dbn-demo', // Template dashboard to clone filters from
      isAllowPrivateMetricsByDefault: dashboardIsPrivate, // Private: metrics only visible to creator; Public: visible to all in tenant
      metadata: {
        name: dashboardName, // Dashboard display name (as per DataBrain API docs)
        description: description || '', // Dashboard description
        createdAt: new Date().toISOString(),
        createdBy: 'API',
        userIdentifier: userIdentifier, // Store Name (e.g., 'Ramirez Ltd') - used for grouping/filtering
        originalName: dashboardName, // Backup field for name resolution
        isPrivate: dashboardIsPrivate, // Privacy flag for UI filtering
        visibility: dashboardIsPrivate ? 'private' : 'tenant', // Dashboard visibility level
        creatorId: userIdentifier // Track creator for private dashboard access control
      },
      workspaceName: workspaceName,
      accessSettings: {
        datamartName: datamartName,
        isAllowAiPilot: true,
        isAllowEmailReports: true,
        isAllowManageMetrics: true,
        isAllowMetricCreation: true,
        isAllowMetricDeletion: dashboardIsPrivate ? true : true, // Allow deletion for both (can be restricted later)
        isAllowMetricLayoutChange: true,
        isAllowMetricUpdate: true,
        isAllowUnderlyingData: true,
        isAllowCreateDashboardView: true,
        metricCreationMode: 'DRAG_DROP'
      }
    };

    // Call DataBrain dashboardEmbed/create API to create client-specific dashboard
    console.log('📤 Creating dashboard with config:', JSON.stringify({
      workspaceName,
      templateDashboardId: requestBody.templateDashboardId,
      isPrivate: dashboardIsPrivate,
      clientId
    }, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/v2/dataApp/dashboardEmbed/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATABRAIN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const textResponse = await response.text();
      console.log('Non-JSON response received:', textResponse.substring(0, 500));
      throw new Error(`API returned non-JSON response. Status: ${response.status}. Content-Type: ${contentType}. Response: ${textResponse.substring(0, 200)}`);
    }

    if (response.ok && !data.error) {

      res.json({
        success: true,
        dashboardId: newDashboardId,
        embedId: data.id,
        dashboardName: dashboardName,
        description: description,
        clientId: clientId,
        isPrivate: dashboardIsPrivate,
        visibility: dashboardIsPrivate ? 'private' : 'tenant',
        message: `Dashboard created successfully for client${dashboardIsPrivate ? ' (private)' : ' (shared with tenant)'}`,
        data: data
      });
    } else {
      console.error('ERROR: Failed to create dashboard:', JSON.stringify(data, null, 2));
      console.error('🔍 Debug Info:');
      console.error('   Workspace Name:', workspaceName);
      console.error('   Template Dashboard ID:', requestBody.templateDashboardId);
      console.error('   Client ID:', clientId);
      
      res.status(400).json({
        error: 'Failed to create dashboard embed configuration',
        details: data.error || data,
        apiResponse: {
          status: response.status,
          statusText: response.statusText
        },
        debugInfo: {
          workspaceName: workspaceName,
          templateDashboardId: requestBody.templateDashboardId,
          clientId: clientId,
          suggestion: data.error?.code === 'TEMPLATE_DASHBOARD_ERROR' 
            ? 'Check that DATABRAIN_WORKSPACE_NAME matches your actual DataBrain workspace name'
            : 'Verify that your API Key has permission to create embed configurations in the specified workspace'
        }
      });
    }

  } catch (apiError) {
    console.error('ERROR: Exception during dashboard creation:', apiError);
    res.status(500).json({
      error: 'Failed to connect to DataBrain API',
      details: apiError.message,
      endpoint: `${API_BASE_URL}/api/v2/dataApp/embed/create`
    });
  }
});


// Copy/Save As Dashboard using DataBrain v2 API
app.post('/api/v2/copy-dashboard', async (req, res) => {
  try {
    // Validate API Key configuration
    if (!DATABRAIN_API_KEY || DATABRAIN_API_KEY === 'your-databrain-api-key-here') {
      return res.status(500).json({
        error: 'API Key not configured. Please set DATABRAIN_API_KEY in backend/server.js line 10.'
      });
    }

    let {
      sourceDashboardId,
      newDashboardName,
      description,
      clientId,
      datamartName
    } = req.body;

    // Validate required parameters
    if (!sourceDashboardId || !newDashboardName || !clientId) {
      return res.status(400).json({
        error: 'Missing required parameters: sourceDashboardId, newDashboardName, clientId'
      });
    }

    // If no datamartName provided, fetch the first available datamart
    if (!datamartName) {
      try {
        const datamartResponse = await fetch(`${API_BASE_URL}/api/v2/dataApp/datamart/list`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${DATABRAIN_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isPagination: false })
        });

        const datamartData = await datamartResponse.json();

        if (datamartResponse.ok && datamartData.data && datamartData.data.length > 0) {
          datamartName = datamartData.data[0].name;
        } else {
          datamartName = 'Sales Management Datamart'; // Fallback
        }
      } catch (dmError) {
        datamartName = 'Sales Management Datamart'; // Fallback on error
      }
    }

    console.log('Copying dashboard with DataBrain API:', {
      sourceDashboardId,
      newDashboardName,
      description,
      clientId,
      datamartName
    });

    // Create new embed configuration based on existing dashboard
    const requestBody = {
      dashboardId: sourceDashboardId, // Source dashboard to copy from
      embedType: 'dashboard',
      workspaceName: workspaceName,
      accessSettings: {
        datamartName: datamartName,
        isAllowAiPilot: true,
        isAllowEmailReports: true,
        isAllowManageMetrics: true,
        isAllowMetricCreation: true,
        isAllowMetricDeletion: false,
        isAllowMetricLayoutChange: true,
        isAllowMetricUpdate: true,
        isAllowUnderlyingData: true,
        isAllowCreateDashboardView: true,
        metricCreationMode: 'DRAG_DROP'
      },
      // Dashboard-specific configuration
      dashboardConfig: {
        name: newDashboardName,
        description: description,
        isPrivate: true // Initially private
      }
    };

    // Call DataBrain API to create dashboard copy
    const response = await fetch(`${API_BASE_URL}/api/v2/dataApp/embed/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATABRAIN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (response.ok && !data.error) {

      res.json({
        success: true,
        dashboardId: data.id,
        embedId: data.id,
        dashboardName: newDashboardName,
        description: description,
        clientId: clientId,
        isPrivate: true,
        message: 'Dashboard copied successfully',
        data: data
      });
    } else {
      console.error('ERROR: Failed to copy dashboard:', data);
      res.status(400).json({
        error: 'Failed to copy dashboard',
        details: data.error || data,
        apiResponse: {
          status: response.status,
          statusText: response.statusText
        }
      });
    }

  } catch (apiError) {
    console.error('ERROR: Exception during dashboard copy:', apiError);
    res.status(500).json({
      error: 'Failed to connect to DataBrain API',
      details: apiError.message,
      endpoint: `${API_BASE_URL}/api/v2/dataApp/embed/create`
    });
  }
});

// Publish Dashboard - Custom Implementation (Demo)
// Note: DataBrain doesn't have publishing APIs - this would be custom functionality
// we'd build around DataBrain's core APIs for permission management
app.post('/api/v2/publish-dashboard', async (req, res) => {
  try {
    const {
      embedId,
      publishTarget,
      clientId
    } = req.body;

    // Validate required parameters
    if (!embedId || !publishTarget || !clientId) {
      return res.status(400).json({
        error: 'Missing required parameters: embedId, publishTarget, clientId'
      });
    }

    console.log('Publishing dashboard (Custom Implementation):', {
      embedId,
      publishTarget,
      clientId
    });

    // DEMO: Simulate publishing logic
    // In a real implementation, this would:
    // 1. Update your custom permission database
    // 2. Manage user access controls
    // 3. Handle role-based permissions
    // 4. Integrate with your authentication system

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return success response
    res.json({
      success: true,
      embedId: embedId,
      publishTarget: publishTarget,
      clientId: clientId,
      message: 'Dashboard published successfully (Custom Implementation)',
      implementation: 'This would integrate with your custom permission system',
      features: [
        'Role-based access control',
        'User-specific permissions',
        'Integration with your auth system',
        'Custom publishing workflows'
      ]
    });

  } catch (error) {
    console.error('ERROR: Exception during dashboard publish:', error);
    res.status(500).json({
      error: 'Failed to publish dashboard',
      details: error.message
    });
  }
});


// Delete embed endpoint - Use DataBrain Delete Embed API
app.post('/api/delete-embed', async (req, res) => {
  try {
    // Validate API Key configuration
    if (!DATABRAIN_API_KEY || DATABRAIN_API_KEY === 'your-databrain-api-key-here') {
      console.error('ERROR: API Key not configured properly');
      return res.status(500).json({
        error: 'API Key not configured. Please set DATABRAIN_API_KEY in backend/server.js line 10.',
        details: 'Replace "your-databrain-api-key-here" with your actual DataBrain API Key'
      });
    }

    const { embedId } = req.body;

    // Validate required parameters
    if (!embedId) {
      return res.status(400).json({
        error: 'embedId is required',
        details: 'embedId must be provided in the request body'
      });
    }

    console.log('🗑️ Deleting embed configuration:', {
      embedId,
      endpoint: `${API_BASE_URL}/api/v2/dataApp/embed/delete`
    });

    // Call DataBrain Delete Embed API as per official documentation
    const response = await fetch(`${API_BASE_URL}/api/v2/dataApp/embed/delete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATABRAIN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        embedId: embedId
      })
    });

    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('❌ Failed to delete embed:', data);
      return res.status(response.status).json({
        error: 'Failed to delete embed from DataBrain',
        details: data.error || 'Unknown error',
        embedId: embedId
      });
    }


    return res.json({
      success: true,
      id: data.id,
      embedId: embedId,
      message: `Embed configuration '${embedId}' deleted successfully`,
      warning: 'All associated guest tokens are now invalid. Embedded dashboards using this configuration will stop working.'
    });

  } catch (error) {
    console.error('ERROR in /api/delete-embed:', error);
    return res.status(500).json({
      error: 'Internal server error while deleting embed',
      details: error.message
    });
  }
});

// List embeds endpoint - Use DataBrain List All Embeds API
app.post('/api/list-embeds', async (req, res) => {
  try {
    // Validate API Key configuration
    if (!DATABRAIN_API_KEY || DATABRAIN_API_KEY === 'your-databrain-api-key-here') {
      console.error('ERROR: API Key not configured properly');
      return res.status(500).json({
        error: 'API Key not configured. Please set DATABRAIN_API_KEY in backend/server.js line 10.',
        details: 'Replace "your-databrain-api-key-here" with your actual DataBrain API Key'
      });
    }

    const { clientId, userPersona } = req.body;

    // Only clientId is required for fetching embeds
    if (!clientId) {
      return res.status(400).json({
        error: 'clientId is required',
        details: 'clientId must be provided in the request body'
      });
    }

    console.log('🔍 Fetching all embeds for user persona:', {
      clientId,
      userPersona,
      endpoint: `${API_BASE_URL}/api/v2/dataApp/embed/list`
    });

    // Debug: Log API key info
    console.log('🔍 Debug API Key:', {
      hasKey: !!DATABRAIN_API_KEY,
      keyPrefix: DATABRAIN_API_KEY ? DATABRAIN_API_KEY.substring(0, 10) : 'null',
      keyLength: DATABRAIN_API_KEY?.length || 0,
      keyType: typeof DATABRAIN_API_KEY,
      hasTrimmed: DATABRAIN_API_KEY ? DATABRAIN_API_KEY.trim().length : 0
    });

    // Use DataBrain List All Embeds API without clientId filtering
    // We'll get all embeds and then filter by user context in the application layer
    const requestBody = {
      isPagination: false
      // Removed clientId filtering to ensure template dashboards (like dbn-demo) are included
      // User-specific filtering will be handled by guest token with Customer App filter
    };

    const response = await fetch(`${API_BASE_URL}/api/v2/dataApp/embed/list`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATABRAIN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('❌ Failed to fetch embeds:', data);
      return res.status(response.status).json({
        error: 'Failed to fetch embeds from DataBrain',
        details: data.error || 'Unknown error'
      });
    }

    if (!data.data || !Array.isArray(data.data)) {
      console.warn('⚠️ No embeds data in response:', data);
      return res.json({
        success: true,
        embeds: [],
        source: 'list-all-embeds-api'
      });
    }


    // Helper function to get the proper display name for a dashboard
    const getDisplayName = (embed) => {
      const embedId = embed.embedId;

      // For user-created dashboards, prioritize metadata fields (our saved names)
      if (embedId !== 'dbn-demo') {
        // First try metadata.originalName (our custom field where we save the user input)
        if (embed.externalDashboard?.metadata?.originalName) {
          return embed.externalDashboard.metadata.originalName;
        }

        // Then try metadata.name
        if (embed.externalDashboard?.metadata?.name) {
          return embed.externalDashboard.metadata.name;
        }
      }

      // For all dashboards, try externalDashboard.name (proper API field)
      if (embed.externalDashboard?.name) {
        return embed.externalDashboard.name;
      }

      // Fallback to externalMetric name for metrics
      if (embed.externalMetric?.name) {
        return embed.externalMetric.name;
      }

      // Custom name mapping ONLY for the template dashboard
      if (embedId === 'dbn-demo') {
        return 'Sales Analytics Dashboard';
      }

      // Final fallback
      return 'Unnamed Dashboard';
    };

    // Helper function to determine if a dashboard should be visible to the current user
    const isDashboardVisibleToUser = (embed, currentUserId) => {
      // Dashboards with embedIds are template/common dashboards from the Data App
      // These are visible to everyone
      const hasEmbedId = !!embed.embedId;
      const hasMetadata = embed.externalDashboard?.metadata && Object.keys(embed.externalDashboard.metadata).length > 0;

      // If it has an embedId but no custom metadata, it's a template dashboard
      if (hasEmbedId && !hasMetadata) {
        return true;
      }

      // User-created dashboards have metadata with userIdentifier (Store Name like 'Ramirez Ltd')
      // These are visible to all users with the same Store Name
      const creatorStoreName = embed.externalDashboard?.metadata?.userIdentifier;

      // Show if this dashboard belongs to the same Store Name
      return creatorStoreName === currentUserId;
    };

    // Transform and filter embeds from the List All Embeds API
    const allEmbeds = data.data.map(embed => ({
      embedId: embed.embedId,
      name: getDisplayName(embed), // Use our smart name resolution function
      originalName: embed.externalDashboard?.name || embed.externalMetric?.name || 'Unnamed',
      embedType: embed.embedType,
      // Extract the actual dashboard ID for filtering
      dashboardId: embed.externalDashboard?.dashboardId || embed.embedId,
      metadata: {
        createdAt: embed.externalDashboard?.metadata?.createdAt || embed.externalMetric?.createdAt,
        updatedAt: embed.externalDashboard?.metadata?.updatedAt || embed.externalMetric?.updatedAt,
        ...(embed.externalDashboard?.metadata || {}),
        ...(embed.externalMetric || {}),
        // Store dashboard ID in metadata for reference
        actualDashboardId: embed.externalDashboard?.dashboardId || embed.embedId
      },
      isDashboard: embed.embedType === 'dashboard',
      isMetric: embed.embedType === 'metric',
      // Store original embed data for reference
      originalData: embed
    }));

    // Get currentUserId from request body for proper filtering
    const currentUserId = req.body.userId || req.body.userPersona;

    // Filter embeds based on user visibility rules
    const embeds = allEmbeds.filter(embed =>
      embed.isDashboard ? isDashboardVisibleToUser(embed.originalData, currentUserId) : true
    );

    console.log(`🔍 Filtered embeds for user "${currentUserId}" (client: ${clientId}):`, {
      totalEmbeds: allEmbeds.length,
      visibleEmbeds: embeds.length,
      filteredOut: allEmbeds.length - embeds.length
    });

    // Log which dashboards are included/excluded for debugging
    allEmbeds.forEach(embed => {
      if (embed.isDashboard) {
        const isVisible = isDashboardVisibleToUser(embed.originalData, currentUserId);
        const creatorInfo = embed.originalData.externalDashboard?.metadata?.userIdentifier || 'unknown';
        console.log(`   ${isVisible ? '✅' : '❌'} "${embed.name}" (created by: ${creatorInfo})`);
      }
    });

    // Filter to show only dashboards initially (1 dashboard per persona as requested)
    const dashboards = embeds.filter(embed => embed.isDashboard);
    const metrics = embeds.filter(embed => embed.isMetric);

    console.log(`🎯 Returning ${embeds.length} total embeds (${dashboards.length} dashboards, ${metrics.length} metrics)`);
    if (embeds.length > 0) {
      console.log('Sample embed:', JSON.stringify(embeds[0], null, 2));
    }

    return res.json({
      success: true,
      embeds: embeds,
      dashboards: dashboards,
      metrics: metrics,
      source: 'list-all-embeds-api',
      userPersona: userPersona,
      debug: {
        totalCount: embeds.length,
        dashboardsCount: dashboards.length,
        metricsCount: metrics.length
      }
    });

  } catch (apiError) {
    console.error('ERROR: Exception during embed list fetch:', apiError);
    res.status(500).json({
      error: 'Failed to connect to DataBrain API',
      details: apiError.message,
      endpoint: `${API_BASE_URL}/api/v2/dataApp/embed/list`
    });
  }
});

const PORT = process.env.PORT || 3002;

// Start the server
app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         DataBrain Demo Backend Server                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`🚀 Server is running on http://localhost:${PORT}`);

  const credentialsConfigured = DATABRAIN_API_KEY &&
    DATABRAIN_API_KEY !== 'your-databrain-api-key-here' &&
    DATABRAIN_API_KEY.trim() !== '';

  if (credentialsConfigured) {
    console.log('✅ DataBrain credentials: Configured');
    console.log(`📱 Data App Name: ${dataAppName || 'Not set'}`);
    console.log(`🌐 API Base URL: ${API_BASE_URL}`);
    console.log(`🔑 API Key: ${DATABRAIN_API_KEY ? `${DATABRAIN_API_KEY.substring(0, 10)}...` : 'Not set'} (length: ${DATABRAIN_API_KEY?.length || 0})`);
  } else {
    console.log('⚠️  DataBrain credentials: Not configured');
    console.log('\n📋 To configure, set environment variables in backend/.env:');
    console.log('   • DATABRAIN_API_KEY=your-api-key');
    console.log('   • DATABRAIN_DATA_APP_NAME=your-app-name');
    console.log(`\n🔍 Debug: API_KEY value: "${DATABRAIN_API_KEY}" (type: ${typeof DATABRAIN_API_KEY})`);
  }

  console.log('\n💡 Frontend should be running on: http://localhost:5173');
  console.log('📚 API Endpoints:');
  console.log('   • GET  /api/config/status - Check configuration status');
  console.log('   • POST /api/config/validate - Validate credentials');
  console.log('   • POST /api/dashboard-guest-token - Generate guest tokens');
  console.log('   • POST /api/v2/dashboards - List dashboards');
  console.log('   • POST /api/v2/create-dashboard - Create dashboards');
  console.log('   • POST /api/list-embeds - List embed configurations');
  console.log('\n');
});

export default app; 