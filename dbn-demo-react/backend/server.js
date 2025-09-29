import express from 'express';
import cors from 'cors';
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// DataBrain Configuration - Set these values for your app

const DATABRAIN_API_TOKEN = '98847992-1b1a-4dac-a8af-206e97cd4c1a'; //UAT environment
const dataAppName = 'Demo Sales Data App'; // UAT environment
const API_BASE_URL = 'https://uat-api.usedatabrain.com'; // UAT environment

//const DATABRAIN_API_TOKEN = '8b414240-91fb-4844-ab65-2303e58be363'// Production environment
//const dataAppName = 'Demo Embed'// 'Production environment
//const API_BASE_URL = 'https://api.usedatabrain.com'; // Production environment


const workspaceName = 'Demo Workspace'; // Set your workspace name here
// Helper function to generate dashboard ID
const generateDashboardId = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-' + Date.now();
};

// Guest token for Dashboards (data app-based, v2 API)
// Following official DataBrain documentation: https://docs.usedatabrain.com/developer-docs/how-to-embed
app.post('/api/dashboard-guest-token', async (req, res) => {
  try {
    // Validate API token configuration
    if (!DATABRAIN_API_TOKEN || DATABRAIN_API_TOKEN === 'your-databrain-api-token-here') {
      console.error('ERROR: API Token not configured properly');
      return res.status(500).json({
        error: 'API Token not configured. Please set DATABRAIN_API_TOKEN in backend/server.js line 10.',
        details: 'Replace "your-databrain-api-token-here" with your actual DataBrain API token'
      });
    }

    // Validate data app name configuration
    if (!dataAppName || dataAppName === 'your-data-app-name') {
      console.error('ERROR: Data App Name not configured properly');
      return res.status(500).json({
        error: 'Data App Name not configured. Please set dataAppName in backend/server.js line 11.',
        details: 'Set the exact name of your DataBrain Data App'
      });
    }

    const { clientId, customerId, dashboardIds, userPersona } = req.body;

    // Validate required parameters
    if (!clientId) {
      return res.status(400).json({
        error: 'clientId is required',
        details: 'clientId must be provided in the request body as a unique identifier for the client/user'
      });
    }

    // For demo purposes, we expect clientId to be '101' (top-level tenant)
    // and customerId to be the specific customer ID for data filtering
    if (clientId !== '101') {
      console.warn(`Warning: Expected clientId '101' but received '${clientId}' - continuing anyway for demo flexibility`);
    }

    console.log('Creating data app-based guest token for multiple dashboards with customer persona filtering');
    console.log('Request details:', {
      clientId,
      customerId,
      dashboardIds,
      userPersona,
      dataAppName,
      endpoint: `${API_BASE_URL}/api/v2/guest-token/create`,
      hasCustomerFiltering: !!customerId,
      hasDashboardFiltering: !!(dashboardIds && dashboardIds.length > 0)
    });

    // Build request body with dashboard app filters for customer persona
    const requestBody = {
      clientId: clientId,
      dataAppName: dataAppName
    };

    // Create guest token with customer filtering
    if (customerId && dashboardIds && Array.isArray(dashboardIds) && dashboardIds.length > 0) {
      // Use all dashboard IDs - both template and client-specific dashboards should work now
      // Since we're using the proper dashboardEmbed/create API, client dashboards will have proper IDs
      requestBody.params = {
        dashboardAppFilters: dashboardIds.map(dashboardId => ({
          dashboardId: dashboardId,
          values: {
            'Customer App filter': customerId
          },
          isShowOnUrl: false
        }))
      };
      console.log('Dashboard app filters configured for all dashboards:', {
        dashboardCount: dashboardIds.length,
        dashboardIds: dashboardIds,
        filterKey: 'Customer App filter',
        filterValue: customerId,
        userPersona: userPersona || 'unknown'
      });
    } else if (customerId) {
      // Create general token without dashboard-specific filters
      // This is for initial authentication - no special params needed
      console.log('Creating general guest token for initial authentication (no dashboard-specific filters)');
      console.log('Customer filtering will be applied at the application level');
    } else {
      console.log('Creating general guest token without customer filtering');
    }

    console.log('Actual request body being sent:', JSON.stringify(requestBody, null, 2));

    // Call DataBrain v2 API as per official documentation
    const response = await fetch(`${API_BASE_URL}/api/v2/guest-token/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATABRAIN_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log('DataBrain API Response Status:', response.status, response.statusText);

    if (response.ok && (data.guest_token || data.token)) {
      const guestToken = data.guest_token || data.token;

      console.log('SUCCESS: Guest token created successfully for client:', clientId);

      res.json({
        success: true,
        guestToken: guestToken,
        clientId: clientId,
        customerId: customerId,
        dashboardIds: dashboardIds,
        userPersona: userPersona,
        dataAppName: dataAppName,
        hasFiltering: !!(dashboardIds && dashboardIds.length > 0 && customerId),
        filterDetails: dashboardIds && dashboardIds.length > 0 && customerId ? {
          filterName: 'Customer App filter',
          filterValue: customerId,
          appliedToDashboards: dashboardIds,
          totalDashboards: dashboardIds.length
        } : null,
        message: dashboardIds && dashboardIds.length > 0 && customerId
          ? `Guest token created successfully with customer persona filtering for ${userPersona || 'user'} (Customer ID: ${customerId}) across ${dashboardIds.length} dashboards`
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
        suggestion: 'Verify that your API token has permission to create guest tokens for the specified data app'
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
    // Check if API token is configured
    if (!DATABRAIN_API_TOKEN || DATABRAIN_API_TOKEN === 'your-databrain-api-token-here') {
      return res.status(500).json({
        error: 'API Token not configured. Please set DATABRAIN_API_TOKEN in backend/server.js line 10.'
      });
    }

    const { isPagination = false, pageNumber = 1 } = req.body;

    console.log('API Call: Fetching dashboards from DataBrain');

    // Call DataBrain Data App Embedding API for dashboards
    const response = await fetch(`${API_BASE_URL}/api/v2/dataApp/dashboards`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATABRAIN_API_TOKEN}`,
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
    // Check if API token is configured
    if (!DATABRAIN_API_TOKEN || DATABRAIN_API_TOKEN === 'your-databrain-api-token-here') {
      return res.status(500).json({
        error: 'API Token not configured. Please set DATABRAIN_API_TOKEN in backend/server.js line 10.'
      });
    }

    const { workspaceName, dashboardId } = req.body;

    console.log('API Call: Fetching embeddable metrics from workspace context');

    // Try the traditional workspace-based API
    const response = await fetch(`${API_BASE_URL}/api/metrics`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DATABRAIN_API_TOKEN}`,
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

      console.log(`Fetched ${metrics.length} metrics from traditional API`);

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
    console.log('/api/v2/dashboard-metrics - Request received');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Check if API token is configured
    if (!DATABRAIN_API_TOKEN || DATABRAIN_API_TOKEN === 'your-databrain-api-token-here') {
      return res.status(500).json({
        error: 'API Token not configured. Please set DATABRAIN_API_TOKEN in backend/server.js line 10.'
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
    console.log('/api/metrics - Request received');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Check if API token is configured
    if (!DATABRAIN_API_TOKEN || DATABRAIN_API_TOKEN === 'your-databrain-api-token-here') {
      console.log('ERROR: API Token not configured');
      return res.status(500).json({
        error: 'API Token not configured. Please set DATABRAIN_API_TOKEN in backend/server.js line 10.'
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

    console.log('API Call: Fetching metrics by workspace and dashboard');
    console.log(`Request URL: ${API_BASE_URL}/api/v2/workspace/dashboard/metrics`);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    // Use the DataBrain Embedding API for metrics by workspace and dashboard
    const response = await fetch(`${API_BASE_URL}/api/v2/workspace/dashboard/metrics`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATABRAIN_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status, response.statusText);

    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (response.ok && data.data && Array.isArray(data.data)) {
      console.log('SUCCESS: API response successful, processing metrics');

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

      console.log(`SUCCESS: Processed ${metrics.length} metrics successfully`);
      console.log('Sample metric:', JSON.stringify(metrics[0], null, 2));

      return res.json({
        success: true,
        metrics: metrics,
        source: 'workspace-dashboard-metrics-api'
      });
    } else if (data.error) {
      console.log('ERROR: DataBrain API returned error:', data.error);
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
    console.log('ERROR: Exception in /api/metrics:', apiError);
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
    // Validate API token configuration
    if (!DATABRAIN_API_TOKEN || DATABRAIN_API_TOKEN === 'your-databrain-api-token-here') {
      console.error('ERROR: API Token not configured properly');
      return res.status(500).json({
        error: 'API Token not configured. Please set DATABRAIN_API_TOKEN in backend/server.js line 10.',
        details: 'Replace "your-databrain-api-token-here" with your actual DataBrain API token'
      });
    }

    // Validate data app name configuration
    if (!dataAppName || dataAppName === 'your-data-app-name') {
      console.error('ERROR: Data App Name not configured properly');
      return res.status(500).json({
        error: 'Data App Name not configured. Please set dataAppName in backend/server.js line 11.',
        details: 'Set the exact name of your DataBrain Data App'
      });
    }

    const { dashboardName, description, datamartName, dashboardId } = req.body;

    // Validate required parameters
    if (!dashboardName) {
      return res.status(400).json({
        error: 'dashboardName is required',
        details: 'Dashboard name must be provided in the request body'
      });
    }

    const { clientId } = req.body;

    // Validate clientId
    if (!clientId) {
      return res.status(400).json({
        error: 'clientId is required',
        details: 'Client ID must be provided in the request body'
      });
    }

    // Generate new unique dashboard ID for the new dashboard
    const newDashboardId = generateDashboardId(dashboardName);

    // First, try to get available dashboards to use as template
    let templateDashboardId = 'dbn-demo'; // Template dashboard for creating new dashboards

    try {
      console.log('🔍 Fetching available dashboards to find a template...');
      const dashboardsResponse = await fetch(`${API_BASE_URL}/api/v2/dataApp/dashboards`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${DATABRAIN_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (dashboardsResponse.ok) {
        const dashboardsData = await dashboardsResponse.json();
        if (dashboardsData.data && dashboardsData.data.length > 0) {
          // Use the first available dashboard as template
          templateDashboardId = dashboardsData.data[0].externalDashboardId || dashboardsData.data[0].id;
          console.log('✅ Found template dashboard:', templateDashboardId);
        } else {
          console.log('⚠️ No dashboards found, using default template:', templateDashboardId);
        }
      } else {
        console.log('⚠️ Could not fetch dashboards, using default template:', templateDashboardId);
      }
    } catch (error) {
      console.log('⚠️ Error fetching dashboards for template, using default:', templateDashboardId);
    }

    console.log('Creating new dashboard embed configuration');
    console.log('Request details:', {
      dashboardName,
      newDashboardId,
      templateDashboardId: 'dbn-demo',
      clientId,
      description,
      datamartName,
      workspaceName,
      endpoint: `${API_BASE_URL}/api/v2/dataApp/dashboardEmbed/create`
    });

    // Prepare the request body for DataBrain dashboardEmbed/create API
    // This creates a new dashboard for a specific client with template filters
    // Based on DataBrain API docs: name must be in metadata, not at top level
    const requestBody = {
      dashboardId: newDashboardId, // New unique dashboard ID
      clientId: clientId, // Client identifier for multi-tenant access
      templateDashboardId: 'dbn-demo', // Template dashboard to clone filters from
      metadata: {
        name: dashboardName, // Dashboard display name (as per DataBrain API docs)
        description: description || '', // Dashboard description
        createdAt: new Date().toISOString(),
        createdBy: 'API',
        originalName: dashboardName // Backup field for name resolution
      },
      workspaceName: workspaceName,
      accessSettings: {
        datamartName: datamartName || 'Demo Embed Datamart',
        isAllowAiPilot: true,
        isAllowEmailReports: true,
        isAllowManageMetrics: true,
        isAllowMetricCreation: true,
        isAllowMetricDeletion: true,
        isAllowMetricLayoutChange: true,
        isAllowMetricUpdate: true,
        isAllowUnderlyingData: true,
        isAllowCreateDashboardView: true,
        metricCreationMode: 'DRAG_DROP'
      }
    };

    // Call DataBrain dashboardEmbed/create API to create client-specific dashboard
    const response = await fetch(`${API_BASE_URL}/api/v2/dataApp/dashboardEmbed/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATABRAIN_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('DataBrain API Response Status:', response.status, response.statusText);
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
      console.log('SUCCESS: Dashboard embed configuration created successfully');

      res.json({
        success: true,
        dashboardId: newDashboardId,
        embedId: data.id,
        dashboardName: dashboardName,
        description: description,
        clientId: clientId,
        message: 'Dashboard created successfully for client',
        data: data
      });
    } else {
      console.error('ERROR: Failed to create dashboard:', data);
      res.status(400).json({
        error: 'Failed to create dashboard embed configuration',
        details: data.error || data,
        apiResponse: {
          status: response.status,
          statusText: response.statusText
        },
        suggestion: 'Verify that your API token has permission to create embed configurations in the specified workspace'
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
    // Validate API token configuration
    if (!DATABRAIN_API_TOKEN || DATABRAIN_API_TOKEN === 'your-databrain-api-token-here') {
      return res.status(500).json({
        error: 'API Token not configured. Please set DATABRAIN_API_TOKEN in backend/server.js line 10.'
      });
    }

    const {
      sourceDashboardId,
      newDashboardName,
      description,
      clientId
    } = req.body;

    // Validate required parameters
    if (!sourceDashboardId || !newDashboardName || !clientId) {
      return res.status(400).json({
        error: 'Missing required parameters: sourceDashboardId, newDashboardName, clientId'
      });
    }

    console.log('Copying dashboard with DataBrain API:', {
      sourceDashboardId,
      newDashboardName,
      description,
      clientId
    });

    // Create new embed configuration based on existing dashboard
    const requestBody = {
      dashboardId: sourceDashboardId, // Source dashboard to copy from
      embedType: 'dashboard',
      workspaceName: workspaceName,
      accessSettings: {
        datamartName: 'Demo Embed Datamart',
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
        'Authorization': `Bearer ${DATABRAIN_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log('DataBrain Dashboard Copy Response:', response.status, response.statusText);

    if (response.ok && !data.error) {
      console.log('SUCCESS: Dashboard copy created successfully');

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
    // Validate API token configuration
    if (!DATABRAIN_API_TOKEN || DATABRAIN_API_TOKEN === 'your-databrain-api-token-here') {
      console.error('ERROR: API Token not configured properly');
      return res.status(500).json({
        error: 'API Token not configured. Please set DATABRAIN_API_TOKEN in backend/server.js line 10.',
        details: 'Replace "your-databrain-api-token-here" with your actual DataBrain API token'
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
        'Authorization': `Bearer ${DATABRAIN_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        embedId: embedId
      })
    });

    const data = await response.json();
    console.log('DataBrain Delete Embed API Response Status:', response.status, response.statusText);
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('❌ Failed to delete embed:', data);
      return res.status(response.status).json({
        error: 'Failed to delete embed from DataBrain',
        details: data.error || 'Unknown error',
        embedId: embedId
      });
    }

    console.log('✅ Embed deleted successfully:', embedId);

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
    // Validate API token configuration
    if (!DATABRAIN_API_TOKEN || DATABRAIN_API_TOKEN === 'your-databrain-api-token-here') {
      console.error('ERROR: API Token not configured properly');
      return res.status(500).json({
        error: 'API Token not configured. Please set DATABRAIN_API_TOKEN in backend/server.js line 10.',
        details: 'Replace "your-databrain-api-token-here" with your actual DataBrain API token'
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
        'Authorization': `Bearer ${DATABRAIN_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log('DataBrain List Embeds API Response Status:', response.status, response.statusText);
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

    console.log(`✅ Found ${data.data.length} embeds from List All Embeds API`);

    // Helper function to get the proper display name for a dashboard
    const getDisplayName = (embed) => {
      const embedId = embed.embedId;

      // For user-created dashboards, prioritize metadata fields (our saved names)
      if (embedId !== 'dbn-demo') {
        // First try metadata.originalName (our custom field where we save the user input)
        if (embed.externalDashboard?.metadata?.originalName) {
          console.log(`   └─ Using metadata.originalName: "${embed.externalDashboard.metadata.originalName}"`);
          return embed.externalDashboard.metadata.originalName;
        }

        // Then try metadata.name
        if (embed.externalDashboard?.metadata?.name) {
          console.log(`   └─ Using metadata.name: "${embed.externalDashboard.metadata.name}"`);
          return embed.externalDashboard.metadata.name;
        }
      }

      // For all dashboards, try externalDashboard.name (proper API field)
      if (embed.externalDashboard?.name) {
        console.log(`   └─ Using externalDashboard.name: "${embed.externalDashboard.name}"`);
        return embed.externalDashboard.name;
      }

      // Fallback to externalMetric name for metrics
      if (embed.externalMetric?.name) {
        console.log(`   └─ Using externalMetric.name: "${embed.externalMetric.name}"`);
        return embed.externalMetric.name;
      }

      // Custom name mapping ONLY for the template dashboard
      if (embedId === 'dbn-demo') {
        console.log(`   └─ Using custom mapping for dbn-demo: "Sales Analytics Dashboard"`);
        return 'Sales Analytics Dashboard';
      }

      // Final fallback
      console.log(`   └─ Using final fallback: "Unnamed Dashboard"`);
      return 'Unnamed Dashboard';
    };

    // Helper function to determine if a dashboard should be visible to the current user
    const isDashboardVisibleToUser = (embed, userPersona) => {
      const embedId = embed.embedId;

      // Template dashboards (like dbn-demo) are visible to everyone
      if (embedId === 'dbn-demo') {
        return true;
      }

      // User-created dashboards should only be visible to the creator
      // We'll use embedId to determine ownership since dashboard names might not be reliable

      // If userPersona is provided, check if this dashboard belongs to them
      if (userPersona) {
        const userName = userPersona.toLowerCase().replace(/\s+/g, '');
        const embedIdLower = embedId.toLowerCase();

        // Check if dashboard ID contains user identifier (e.g., "michaels-first-dashboard")
        if (embedIdLower.includes('michael') && userName.includes('michael')) {
          return true;
        }
        if (embedIdLower.includes('jake') && userName.includes('jake')) {
          return true;
        }
      }

      // For now, if we can't determine ownership, include it (will be filtered by guest token)
      return false;
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

    // Filter embeds based on user visibility rules
    const embeds = allEmbeds.filter(embed =>
      embed.isDashboard ? isDashboardVisibleToUser(embed.originalData, userPersona) : true
    );

    console.log(`🔍 Filtered embeds for ${userPersona}:`, {
      totalEmbeds: allEmbeds.length,
      visibleEmbeds: embeds.length,
      filteredOut: allEmbeds.length - embeds.length
    });

    // Log which dashboards are included/excluded for debugging
    allEmbeds.forEach(embed => {
      if (embed.isDashboard) {
        const isVisible = isDashboardVisibleToUser(embed.originalData, userPersona);
        console.log(`📊 Dashboard ${embed.embedId}: ${isVisible ? '✅ VISIBLE' : '❌ HIDDEN'} for ${userPersona}`);
        console.log(`   └─ Display Name: "${embed.name}" (Original: "${embed.originalName}")`);
        if (embed.originalData.externalDashboard?.metadata) {
          console.log(`   └─ Metadata: ${JSON.stringify(embed.originalData.externalDashboard.metadata)}`);
        }
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

const PORT = 3001;

app.listen(PORT, () => {
  const isConfigured = DATABRAIN_API_TOKEN && DATABRAIN_API_TOKEN !== 'your-databrain-api-token-here';
  console.log(`DataBrain Demo Backend running on http://localhost:${PORT}`);
  console.log(`API Token: ${isConfigured ? 'Configured' : 'Not configured - Set in backend/server.js line 10'}`);
});

export default app; 