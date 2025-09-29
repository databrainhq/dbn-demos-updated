# 🎯 User Flow Implementation

## Overview

This document outlines the complete user flow implementation following the DataBrain API best practices and the client's requirements for customer persona filtering.

## 🔄 Complete User Flow

### 1. **User Signs In → Guest Token Creation with App Filters**

**Implementation:** Enhanced guest token creation with customer persona filtering

```typescript
// Step 1: User signs in (Michael Thompson - Process Owner)
const user = {
  id: 'michael',
  name: 'Michael Thompson',
  customerId: '285407', // Customer ID for data filtering
  clientId: '101',
  role: 'Process Owner'
};

// Step 2: Generate guest token with dashboard app filters
const tokenRequest = {
  clientId: '101',
  customerId: '285407',
  dashboardId: 'dashboard-embed-id',
  userPersona: 'Michael Thompson'
};

// Backend creates token with Customer App filter
const guestTokenResponse = {
  clientId: '101',
  dataAppName: 'Demo Sales Data App',
  params: {
    dashboardAppFilters: [{
      dashboardId: 'dashboard-embed-id',
      values: {
        'Customer App filter': '285407'
      },
      isShowOnUrl: false
    }]
  }
};
```

**API Used:** [DataBrain Guest Token API](https://docs.usedatabrain.com/developer-docs/helpers/api-reference/token)

### 2. **Fetch Embed List → Display Dashboards**

**Implementation:** Using DataBrain List All Embeds API

```typescript
// Backend endpoint: /api/list-embeds
app.post('/api/list-embeds', async (req, res) => {
  const response = await fetch(`${API_BASE_URL}/api/v2/dataApp/embed/list`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DATABRAIN_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      isPagination: false
    })
  });
  
  const data = await response.json();
  // Transform embeds according to official API response format
  const embeds = data.data.map(embed => ({
    embedId: embed.embedId,
    name: embed.externalDashboard?.name || embed.externalMetric?.name,
    embedType: embed.embedType,
    isDashboard: embed.embedType === 'dashboard',
    isMetric: embed.embedType === 'metric'
  }));
});
```

**API Used:** [DataBrain List All Embeds API](https://docs.usedatabrain.com/developer-docs/helpers/api-reference/list-embed)

**Response Format:**
```json
{
  "data": [
    {
      "embedId": "dashboard-123",
      "embedType": "dashboard",
      "externalDashboard": {
        "metadata": {
          "createdAt": "2024-01-15T10:30:00Z",
          "updatedAt": "2024-01-20T14:45:00Z"
        },
        "name": "Sales Analytics Dashboard"
      },
      "externalMetric": null
    }
  ]
}
```

### 3. **Display Dashboard Name at Top**

**Implementation:** Enhanced dashboard header with user context

```tsx
// Dashboard Header Component
<div className="border-b bg-slate-50 px-6 py-4">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-xl font-semibold text-slate-900">
        {dashboard.name}
      </h1>
      <p className="text-sm text-slate-600 mt-1">
        Dashboard for {currentUser.name} ({currentUser.role})
      </p>
    </div>
    <div className="text-xs text-slate-500">
      ID: {dashboard.embedId}
    </div>
  </div>
</div>

// DataBrain Component with filtered data
<dbn-dashboard
  token={guestTokenWithFilters}
  dashboard-id={dashboard.embedId}
/>
```

### 4. **+ New Dashboard Creation**

**Implementation:** Using DataBrain Embed Data App API

```typescript
// Create new dashboard embed configuration
const createDashboard = async (dashboardData) => {
  const response = await fetch('/api/v2/create-dashboard', {
    method: 'POST',
    body: JSON.stringify({
      dashboardName: dashboardData.name,
      description: dashboardData.description,
      clientId: '101',
      datamartName: 'Demo Embed Datamart'
    })
  });
  
  // Backend calls DataBrain API
  const databrainResponse = await fetch(`${API_BASE_URL}/api/v2/dataApp/embed/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DATABRAIN_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      embedType: 'dashboard',
      workspaceName: 'Demo Workspace',
      accessSettings: {
        datamartName: 'Demo Embed Datamart',
        isAllowMetricCreation: true,
        isAllowManageMetrics: true,
        metricCreationMode: 'DRAG_DROP'
      }
    })
  });
};
```

**API Used:** [DataBrain Embed Data App API (CRUD)](https://docs.usedatabrain.com/developer-docs/helpers/embed-data-app-api-crud)

### 5. **Add Metrics to Dashboard**

**Implementation:** Metric creation and dashboard integration

```typescript
// Create new metric for dashboard
const createMetric = async (metricData) => {
  const response = await fetch('/api/v2/create-metric', {
    method: 'POST',
    body: JSON.stringify({
      metricName: metricData.name,
      description: metricData.description,
      dataSource: metricData.dataSource,
      table: metricData.table,
      columns: metricData.columns,
      chartType: metricData.chartType,
      clientId: '101',
      dashboardId: metricData.dashboardId
    })
  });
  
  // Backend creates metric embed configuration
  const databrainResponse = await fetch(`${API_BASE_URL}/api/v2/dataApp/embed/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DATABRAIN_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      embedType: 'metric',
      workspaceName: 'Demo Workspace',
      metricConfig: {
        name: metricData.name,
        description: metricData.description,
        dataSource: metricData.dataSource,
        chartType: metricData.chartType
      }
    })
  });
};
```

## 🎯 User Experience Flow

### Michael Thompson (Process Owner) Journey:

1. **Sign In**
   ```
   User: Michael Thompson
   Role: Process Owner
   Customer ID: 285407
   ```

2. **Token Generation**
   ```
   Guest Token with Customer App filter: "285407"
   Dashboard filtering applied automatically
   ```

3. **Dashboard List**
   ```
   Fetches all embeds using List All Embeds API
   Displays dashboards available to Michael
   Shows 1 dashboard per persona initially
   ```

4. **Dashboard Display**
   ```
   Header: "Sales Analytics Dashboard"
   Subheader: "Dashboard for Michael Thompson (Process Owner)"
   Content: DataBrain component with filtered data (Customer ID: 285407)
   ```

5. **Create New Dashboard**
   ```
   Click "+ Create New" tab
   Fill dashboard details
   Creates new embed configuration
   Automatically applies customer filtering
   ```

6. **Add Metrics**
   ```
   Access metric creation within dashboard
   Create custom metrics with drag-drop interface
   Metrics inherit customer filtering from dashboard
   ```

### Jake Rodriguez (Automation Admin) Journey:

1. **Sign In**
   ```
   User: Jake Rodriguez
   Role: Automation Admin
   Customer ID: 440422
   ```

2. **Token Generation**
   ```
   Guest Token with Customer App filter: "440422"
   Different customer data filtering
   ```

3. **Dashboard Experience**
   ```
   Same interface, different data
   Shows Jake's customer data (440422)
   Separate dashboard instances per user
   ```

## 🔧 Technical Implementation Details

### Backend API Endpoints:

1. **Guest Token with Filtering**
   ```
   POST /api/dashboard-guest-token
   Body: { clientId, customerId, dashboardId, userPersona }
   ```

2. **List All Embeds**
   ```
   POST /api/list-embeds
   Body: { clientId, userPersona }
   ```

3. **Create Dashboard**
   ```
   POST /api/v2/create-dashboard
   Body: { dashboardName, description, clientId, datamartName }
   ```

4. **Create Metric**
   ```
   POST /api/v2/create-metric
   Body: { metricName, dataSource, chartType, clientId, dashboardId }
   ```

### Frontend Components:

1. **App.tsx** - Main application with user flow orchestration
2. **DashboardSelector.tsx** - Embed list fetching and display
3. **CreateDashboard.tsx** - New dashboard creation
4. **UserSwitcher.tsx** - User persona switching

### State Management:

```typescript
// User context
const [currentUser, setCurrentUser] = useState<User>(USERS[0]);

// Dashboard state
const [availableDashboards, setAvailableDashboards] = useState([]);
const [currentDashboardId, setCurrentDashboardId] = useState('');
const [activeDashboardTab, setActiveDashboardTab] = useState('');

// Token management with caching
const [token, setToken] = useState('');
const [dashboardTokens, setDashboardTokens] = useState<Record<string, string>>({});
```

## 🔒 Security & Data Isolation

### Customer Persona Filtering:
- **Michael (285407):** Only sees data for customer ID 285407
- **Jake (440422):** Only sees data for customer ID 440422
- **Token-Level Filtering:** Customer filters embedded in guest tokens
- **Backend Security:** All tokens generated securely on backend

### Row-Level Security:
```sql
-- Applied automatically via Customer App filter
SELECT * FROM demo_sales WHERE customer_id = '285407'
```

### Token Security:
- ✅ Guest tokens never exposed in frontend code
- ✅ Customer filtering applied at token generation
- ✅ Tokens cached per dashboard for performance
- ✅ Cache cleared on user context change

## 📊 API Integration Summary

### DataBrain APIs Used:

1. **[Guest Token API](https://docs.usedatabrain.com/developer-docs/helpers/api-reference/token)**
   - Purpose: Generate filtered guest tokens
   - Parameters: clientId, dataAppName, dashboardAppFilters

2. **[List All Embeds API](https://docs.usedatabrain.com/developer-docs/helpers/api-reference/list-embed)**
   - Purpose: Fetch available dashboards and metrics
   - Parameters: isPagination, pageNumber

3. **[Embed Data App API](https://docs.usedatabrain.com/developer-docs/helpers/embed-data-app-api-crud)**
   - Purpose: Create new dashboard and metric embeds
   - Parameters: embedType, workspaceName, accessSettings

### Response Handling:
- ✅ Proper error handling for all API calls
- ✅ Data transformation for frontend compatibility
- ✅ Loading states and user feedback
- ✅ Fallback handling for API failures

## 🎯 Results

### User Experience:
- ✅ **Seamless Sign-In:** Automatic token generation with filtering
- ✅ **Instant Dashboard Access:** Fast embed list loading
- ✅ **Clear Dashboard Headers:** User context and dashboard names
- ✅ **Easy Dashboard Creation:** Streamlined new dashboard flow
- ✅ **Metric Management:** Integrated metric creation capabilities

### Technical Performance:
- ✅ **Optimized API Usage:** Efficient embed list fetching
- ✅ **Smart Token Caching:** Instant dashboard switching
- ✅ **Proper Data Isolation:** Customer-specific data filtering
- ✅ **Scalable Architecture:** Ready for multiple personas

### Security Compliance:
- ✅ **Backend Token Management:** No frontend token exposure
- ✅ **Customer Data Isolation:** Proper row-level security
- ✅ **API Security:** Secure DataBrain API integration
- ✅ **User Context Separation:** Clean user switching

---

**Implementation Status:** ✅ Complete  
**API Integration:** Fully compliant with DataBrain documentation  
**User Flow:** End-to-end implementation with customer persona filtering  
**Performance:** Optimized for production use
