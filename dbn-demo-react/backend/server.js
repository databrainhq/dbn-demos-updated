const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// DataBrain Configuration - Set these values for your app
const DATABRAIN_API_TOKEN = '8b414240-91fb-4844-ab65-2303e58be363';
const dataAppName = 'Demo Embed';
const workspaceName = 'Demo Workspace'; // Set your workspace name here

// Guest token generation endpoint
// Create metric-specific guest token
app.post('/api/metric-guest-token', async (req, res) => {
  try {
    if (!DATABRAIN_API_TOKEN || DATABRAIN_API_TOKEN === 'your-databrain-api-token-here') {
      return res.status(500).json({
        error: 'API Token not configured. Please set DATABRAIN_API_TOKEN in backend/server.js line 10.',
        details: 'Replace "your-databrain-api-token-here" with your actual DataBrain API token'
      });
    }

    const { clientId, metricId, embedId } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }

    if (!metricId) {
      return res.status(400).json({ error: 'metricId is required' });
    }

    console.log('API Call: Creating metric-specific guest token');

    // Try metric-specific token generation
    const response = await fetch('https://api.usedatabrain.com/api/v2/guest-token/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATABRAIN_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: clientId,
        metricId: metricId, // Add metric-specific scope
        embedId: embedId,   // Add embed context
        dataAppName: dataAppName,
      })
    });

    const data = await response.json();

    if (response.ok && (data.guest_token || data.token)) {
      const guestToken = data.guest_token || data.token;

      res.json({
        success: true,
        guestToken: guestToken,
        clientId: clientId,
        metricId: metricId,
        embedId: embedId
      });
    } else {
      res.status(400).json({
        error: 'Failed to create metric-specific guest token',
        details: data,
        apiResponse: {
          status: response.status,
          statusText: response.statusText
        }
      });
    }

  } catch (apiError) {
    res.status(500).json({
      error: 'Failed to connect to DataBrain API for metric token',
      details: apiError.message
    });
  }
});

// Guest token for Reports (workspace-based, v1 API)
app.post('/api/guest-token', async (req, res) => {
  try {
    // Check if API token is configured
    if (!DATABRAIN_API_TOKEN || DATABRAIN_API_TOKEN === 'your-databrain-api-token-here') {
      return res.status(500).json({
        error: 'API Token not configured. Please set DATABRAIN_API_TOKEN in backend/server.js line 10.',
        details: 'Replace "your-databrain-api-token-here" with your actual DataBrain API token'
      });
    }

    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }

    // Use configured workspace name
    const workspaceToUse = workspaceName;

    console.log('API Call: Creating workspace-based guest token for Reports');

    // Call DataBrain v1 API for workspace-based token
    const response = await fetch('https://api.usedatabrain.com/api/v1/guest-token/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATABRAIN_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: clientId,
        workspaceName: workspaceToUse,
      })
    });

    const data = await response.json();

    if (response.ok && (data.guest_token || data.token)) {
      const guestToken = data.guest_token || data.token;

      res.json({
        success: true,
        guestToken: guestToken,
        clientId: clientId
      });
    } else {
      res.status(400).json({
        error: 'Failed to create workspace-based guest token',
        details: data,
        apiResponse: {
          status: response.status,
          statusText: response.statusText
        }
      });
    }

  } catch (apiError) {
    res.status(500).json({
      error: 'Failed to connect to DataBrain API',
      details: apiError.message
    });
  }
});

// Guest token for Dashboards (data app-based, v2 API)
app.post('/api/dashboard-guest-token', async (req, res) => {
  try {
    // Check if API token is configured
    if (!DATABRAIN_API_TOKEN || DATABRAIN_API_TOKEN === 'your-databrain-api-token-here') {
      return res.status(500).json({
        error: 'API Token not configured. Please set DATABRAIN_API_TOKEN in backend/server.js line 10.',
        details: 'Replace "your-databrain-api-token-here" with your actual DataBrain API token'
      });
    }

    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }

    console.log('API Call: Creating data app-based guest token for Dashboards');

    // Call DataBrain v2 API for data app-based token
    const response = await fetch('https://api.usedatabrain.com/api/v2/guest-token/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATABRAIN_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: clientId,
        dataAppName: dataAppName,
      })
    });

    const data = await response.json();

    if (response.ok && (data.guest_token || data.token)) {
      const guestToken = data.guest_token || data.token;

      res.json({
        success: true,
        guestToken: guestToken,
        clientId: clientId
      });
    } else {
      res.status(400).json({
        error: 'Failed to create data app-based guest token',
        details: data,
        apiResponse: {
          status: response.status,
          statusText: response.statusText
        }
      });
    }

  } catch (apiError) {
    res.status(500).json({
      error: 'Failed to connect to DataBrain API',
      details: apiError.message
    });
  }
});

// New endpoint to fetch dashboards from data app
app.post('/api/dashboards', async (req, res) => {
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
    const response = await fetch('https://api.usedatabrain.com/api/v2/dataApp/dashboards', {
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
          externalDashboardId: 'features-demo'
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
        externalDashboardId: 'features-demo'
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
app.post('/api/embeddable-metrics', async (req, res) => {
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
    const response = await fetch('https://api.usedatabrain.com/api/metrics', {
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

// Fetch metrics by workspace and dashboard using DataBrain Embedding API
app.post('/api/metrics', async (req, res) => {
  try {
    console.log('🔄 /api/metrics - Request received');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));

    // Check if API token is configured
    if (!DATABRAIN_API_TOKEN || DATABRAIN_API_TOKEN === 'your-databrain-api-token-here') {
      console.log('❌ API Token not configured');
      return res.status(500).json({
        error: 'API Token not configured. Please set DATABRAIN_API_TOKEN in backend/server.js line 10.'
      });
    }

    const { embedId, clientId, dashboardId } = req.body;
    const dashboardToUse = dashboardId || embedId || 'features-demo';
    const workspaceToUse = workspaceName;

    console.log('📝 Parameters:', {
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

    console.log('🌐 API Call: Fetching metrics by workspace and dashboard');
    console.log('📤 Request URL: https://api.usedatabrain.com/api/v2/workspace/dashboard/metrics');
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

    // Use the DataBrain Embedding API for metrics by workspace and dashboard
    const response = await fetch('https://api.usedatabrain.com/api/v2/workspace/dashboard/metrics', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATABRAIN_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Response status:', response.status, response.statusText);

    const data = await response.json();
    console.log('📥 Response data:', JSON.stringify(data, null, 2));

    if (response.ok && data.data && Array.isArray(data.data)) {
      console.log('✅ API response successful, processing metrics');

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

      console.log(`✅ Processed ${metrics.length} metrics successfully`);
      console.log('📊 Sample metric:', JSON.stringify(metrics[0], null, 2));

      return res.json({
        success: true,
        metrics: metrics,
        source: 'workspace-dashboard-metrics-api'
      });
    } else if (data.error) {
      console.log('❌ DataBrain API returned error:', data.error);
      return res.status(400).json({
        error: 'DataBrain API Error',
        details: data.error
      });
    } else {
      console.log('❌ Invalid API response structure:', {
        responseOk: response.ok,
        hasData: !!data.data,
        isDataArray: Array.isArray(data.data),
        dataKeys: Object.keys(data)
      });
    }

    throw new Error('Invalid API response structure');

  } catch (apiError) {
    console.log('❌ Exception in /api/metrics:', apiError);
    console.log('❌ Error details:', {
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

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  const isConfigured = DATABRAIN_API_TOKEN && DATABRAIN_API_TOKEN !== 'your-databrain-api-token-here';
  console.log(`🚀 DataBrain Demo Backend running on http://localhost:${PORT}`);
  console.log(`🔧 API Token: ${isConfigured ? '✅ Configured' : '❌ Not configured - Set in backend/server.js line 10'}`);
});

module.exports = app; 