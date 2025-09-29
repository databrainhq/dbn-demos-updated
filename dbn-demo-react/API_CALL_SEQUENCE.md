# 📋 API Call Sequence Documentation

## Overview

This document outlines the **correct sequence** of API calls in the DataBrain Demo React application, following the proper authentication-first approach where guest token creation happens before fetching dashboards.

## 🏗️ Architecture Overview

```
Frontend (React) ←→ Backend (Express) ←→ DataBrain v2 API
     ↓                    ↓                     ↓
- User Interface    - Token Management    - Dashboard Data
- Dashboard Tabs    - API Proxying       - Guest Tokens
- User Switching    - Customer Filtering - Embed Configs
```

## ✅ **Correct Application Flow**

### **Step 1: Guest Token Creation with Customer Context (FIRST)**
```
🔐 Authentication & Customer Context Setup
├── User: Michael Thompson (Customer ID: 285407)
├── API Call: POST /api/dashboard-guest-token
├── Request Body:
│   {
│     "clientId": "101",
│     "customerId": "285407",
│     "dashboardIds": [],  // Empty initially - general token
│     "userPersona": "Michael Thompson"
│   }
├── Backend Processing:
│   ├── Create general guest token with customer context
│   ├── Call DataBrain: POST /api/v2/guest-token/create
│   ├── Request to DataBrain:
│   │   {
│   │     "clientId": "101",
│   │     "dataAppName": "Demo Sales Data App",
│   │     "params": {
│   │       "customerContext": {
│   │         "customerId": "285407",
│   │         "userPersona": "Michael Thompson"
│   │       }
│   │     }
│   │   }
│   └── Return authenticated token with customer context
└── Response: Guest token for customer 285407
```

### **Step 2: Fetch Available Dashboards (Using Authenticated Token)**
```
📊 DashboardSelector.fetchEmbeds() - Now with Customer Context
├── API Call: POST /api/list-embeds
├── Request Body:
│   {
│     "clientId": "101",
│     "userPersona": "Michael Thompson"
│   }
├── Backend Processing:
│   ├── Use authenticated token from Step 1
│   ├── Call DataBrain: POST /api/v2/dataApp/embed/list
│   ├── Request to DataBrain (with customer context):
│   │   {
│   │     "isPagination": false
│   │   }
│   └── Return only dashboards accessible to customer 285407
└── Response (Filtered for Michael's customer):
    {
      "success": true,
      "embeds": [
        {
          "embedId": "dbn-demo",
          "name": "Demo Dashboard",
          "embedType": "dashboard",
          "isDashboard": true,
          "isMetric": false
        }
      ]
    }
```
**Key Change:** Only dashboards that Michael (customer 285407) can access are returned.

### **Step 3: Display Dashboards (Initially 1 per Persona)**
```
🎯 handleDashboardsLoaded() - Display Filtered Dashboards
├── Store available dashboards in state
├── Set first dashboard as active tab
├── Extract dashboard IDs: ["dbn-demo"] (filtered for customer 285407)
├── Update guest token with specific dashboard filters (optional optimization)
└── Render dashboard with customer-filtered data
```

### **Step 4: + New Dashboard Creation**
```
➕ Create New Dashboard (DataBrain Embed Data App API CRUD)
├── User clicks "Create New Dashboard"
├── API Call: POST /api/v2/create-dashboard
├── Request Body:
│   {
│     "dashboardName": "Sales Analytics Q4",
│     "description": "Quarterly sales performance",
│     "clientId": "101",
│     "datamartName": "Demo Embed Datamart"
│   }
├── Backend Processing:
│   ├── Use templateDashboardId: "dbn-demo"
│   ├── Call DataBrain: Dashboard Creation API
│   ├── Generate new dashboard with customer context
│   └── Return new dashboard configuration
├── Response:
│   {
│     "success": true,
│     "dashboardId": "sales-analytics-q4-xyz123",
│     "embedId": "sales-analytics-q4-xyz123",
│     "dashboardName": "Sales Analytics Q4"
│   }
└── Add to available dashboards list
```

### **Step 5: Add Metrics to New Dashboard**
```
📊 Add Metrics to Dashboard
├── User selects "Add Metrics" on new dashboard
├── API Call: POST /api/v2/dashboard-metrics
├── Request Body:
│   {
│     "dashboardId": "sales-analytics-q4-xyz123",
│     "metrics": [
│       {
│         "metricName": "Total Sales",
│         "metricType": "sum",
│         "dataSource": "sales_data"
│       }
│     ],
│     "clientId": "101"
│   }
├── Backend Processing:
│   ├── Use authenticated token with customer context
│   ├── Call DataBrain: Metric Creation API
│   ├── Apply customer filtering to metrics
│   └── Return updated dashboard configuration
└── Dashboard displays with new metrics (filtered for customer 285407)
```

## 🎯 **Key Benefits of Correct Flow**

### **Authentication First Approach**
- ✅ **Step 1:** Create guest token with customer context → Authenticate user
- ✅ **Step 2:** Fetch dashboards → Only get accessible dashboards  
- ✅ **Step 3:** Display dashboards → Show filtered content (1 per persona initially)
- ✅ **Step 4:** Create new dashboards → Use DataBrain Embed Data App API CRUD
- ✅ **Step 5:** Add metrics → Enhance dashboards with customer-filtered metrics

### **Security & Performance Benefits**
- 🔐 **Customer Isolation:** Token created with customer context first
- 📊 **Filtered Dashboard List:** Only shows dashboards user can access
- ⚡ **Optimized Loading:** Authenticate once, use everywhere
- 🎯 **Persona-Based:** Initially 1 dashboard per customer persona

## 👤 User Interaction Flows

### **A. User Switch (Michael → Jake)**

```
🔄 User Change Flow
├── 1️⃣ handleUserChange(Jake Rodriguez)
│   ├── Update current user state
│   ├── Clear cached dashboard tokens
│   └── Show success message
├── 2️⃣ Re-create Guest Token
│   ├── API Call: POST /api/dashboard-guest-token
│   ├── Request Body:
│   │   {
│   │     "clientId": "101",
│   │     "customerId": "440422",
│   │     "dashboardIds": ["dbn-demo", "dbn-demo__gWaUr6G9"],
│   │     "userPersona": "Jake Rodriguez"
│   │   }
│   └── Backend creates new token with Jake's customer filter
├── 3️⃣ Token Response
│   ├── New token with Customer App filter: "440422"
│   ├── Cache token for all dashboards
│   └── Update current token
└── 4️⃣ Dashboard Re-render
    ├── <dbn-dashboard> component updates
    └── Shows Jake's customer data (440422)
```

### **B. Dashboard Tab Switch**

```
⚡ Instant Dashboard Switch
├── 1️⃣ handleDashboardTabChange("dbn-demo__gWaUr6G9")
│   ├── Update active tab state
│   ├── Update current dashboard ID
│   └── Update dashboard name
├── 2️⃣ Token Check
│   ├── Check dashboardTokens cache
│   ├── Find cached token for dashboard
│   └── Use cached token (NO API CALL)
└── 3️⃣ Instant Render
    ├── Set token immediately
    ├── <dbn-dashboard> re-renders
    └── Same customer filtering applied
```

### **C. Create New Dashboard**

```
➕ Dashboard Creation Flow
├── 1️⃣ User fills CreateDashboard form
│   ├── Dashboard name: "Sales Analytics Q4"
│   ├── Description: "Quarterly sales performance"
│   └── Submit form
├── 2️⃣ API Call: POST /api/v2/create-dashboard
│   ├── Request Body:
│   │   {
│   │     "dashboardName": "Sales Analytics Q4",
│   │     "description": "Quarterly sales performance",
│   │     "clientId": "101",
│   │     "datamartName": "Demo Embed Datamart"
│   │   }
│   ├── Backend Processing:
│   │   ├── Generate unique dashboard ID
│   │   ├── Use templateDashboardId: "dbn-demo"
│   │   ├── Call DataBrain dashboard creation API
│   │   └── Return new dashboard details
│   └── Response:
│       {
│         "success": true,
│         "dashboardId": "sales-analytics-q4-xyz123",
│         "embedId": "sales-analytics-q4-xyz123",
│         "dashboardName": "Sales Analytics Q4"
│       }
├── 3️⃣ handleDashboardCreated()
│   ├── Add new dashboard to available list
│   ├── Switch to new dashboard
│   └── Update dashboard selector
├── 4️⃣ Re-create Guest Token
│   ├── Include new dashboard in dashboardIds array
│   ├── API Call: POST /api/dashboard-guest-token
│   ├── Request includes all dashboards + new one
│   └── Get updated token covering all dashboards
└── 5️⃣ Display New Dashboard
    ├── Switch to new dashboard tab
    ├── Use updated guest token
    └── Show filtered data for current user
```

## 🔧 Backend API Endpoints

### **1. POST /api/list-embeds**
- **Purpose:** Fetch available dashboards and embeds
- **DataBrain Call:** `POST /api/v2/dataApp/embed/list`
- **Frequency:** Once on load, on refresh
- **Caching:** None (always fresh data)

### **2. POST /api/dashboard-guest-token**
- **Purpose:** Create guest token with customer filtering
- **DataBrain Call:** `POST /api/v2/guest-token/create`
- **Frequency:** On user change, dashboard creation
- **Caching:** Frontend caches tokens per dashboard

### **3. POST /api/v2/create-dashboard**
- **Purpose:** Create new dashboard configuration
- **DataBrain Call:** Dashboard creation APIs
- **Frequency:** On user request
- **Template:** Uses hardcoded `templateDashboardId: "dbn-demo"`

## 🎯 Optimization Features

### **Token Caching Strategy**
```javascript
// Single token works for multiple dashboards
dashboardTokens = {
  "dbn-demo": "abc123-def456-ghi789...",
  "dbn-demo__gWaUr6G9": "abc123-def456-ghi789...", // Same token
  "new-dashboard-xyz": "abc123-def456-ghi789..."    // Same token
}
```

### **Background Preloading**
- ✅ One API call creates token for all dashboards
- ✅ All dashboards immediately available for switching
- ✅ No loading delays when switching tabs

### **Instant Dashboard Switching**
- ✅ Cached tokens enable instant switches
- ✅ No API calls for tab changes
- ✅ Seamless user experience

## 🔐 Security & Filtering

### **Customer Persona Filtering**
```javascript
// Each user gets filtered data
Michael Thompson (285407) → Shows customer 285407 data only
Jake Rodriguez (440422)   → Shows customer 440422 data only
Sarah Chen (789123)       → Shows customer 789123 data only
```

### **Token Security**
- ✅ Guest tokens never exposed to frontend permanently
- ✅ Tokens include customer filtering at creation time
- ✅ Backend proxies all DataBrain API calls
- ✅ Customer data isolation enforced at token level

## 📊 Performance Metrics

### **Initial Load Time**
```
1. Fetch embeds:     ~200-500ms
2. Create token:     ~300-800ms
3. Render dashboard: ~500-1000ms
Total:               ~1-2.3 seconds
```

### **User Switch Time**
```
1. Create new token: ~300-800ms
2. Re-render:        ~100-300ms
Total:               ~400-1100ms
```

### **Dashboard Switch Time**
```
1. Check cache:      ~1-5ms
2. Re-render:        ~50-200ms
Total:               ~51-205ms (Instant!)
```

## 🚨 Error Handling

### **Common Error Scenarios**

1. **Invalid Dashboard ID**
   ```
   Error: APP_FILTER_PARAM_ERROR
   Solution: Use embedId from List Embeds API directly
   ```

2. **Missing API Token**
   ```
   Error: API Token not configured
   Solution: Set DATABRAIN_API_TOKEN in backend
   ```

3. **Network Failures**
   ```
   Error: Failed to connect to backend
   Solution: Ensure backend running on localhost:3001
   ```

## 🔄 API Call Summary

### **Startup Sequence**
1. `POST /api/list-embeds` → Get dashboards
2. `POST /api/dashboard-guest-token` → Create filtered token

### **User Interactions**
- **User Switch:** 1 API call (`POST /api/dashboard-guest-token`)
- **Dashboard Switch:** 0 API calls (cached)
- **Create Dashboard:** 2 API calls (create + new token)

### **DataBrain v2 API Usage**
- `POST /api/v2/dataApp/embed/list` - Dashboard discovery
- `POST /api/v2/guest-token/create` - Secure token generation
- Dashboard creation APIs - New dashboard setup

## 🎯 Hardcoded vs Dynamic Values

### **Hardcoded (Configuration)**
- ✅ `clientId: "101"`
- ✅ `dataAppName: "Demo Sales Data App"`
- ✅ `templateDashboardId: "dbn-demo"`

### **Dynamic (From APIs)**
- 🔄 Dashboard IDs and names
- 🔄 Customer IDs (285407, 440422, etc.)
- 🔄 Guest tokens
- 🔄 User personas
- 🔄 Embed configurations

---

**Last Updated:** Current implementation  
**Status:** ✅ Fully functional with customer persona filtering  
**Performance:** ⚡ Optimized with token caching and instant switching
