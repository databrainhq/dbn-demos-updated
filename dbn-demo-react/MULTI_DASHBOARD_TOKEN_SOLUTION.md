# 🔧 Multi-Dashboard Token Solution

## Problem Solved

**Issue:** `APP_FILTER_PARAM_ERROR - Invalid dashboard Id: dbn-demo__gWaUr6G9 in dashboard appFilter`

**Root Cause:** Attempting to create guest tokens with dashboard IDs that don't exist in DataBrain, or creating separate tokens for each dashboard.

**Solution:** Create **one guest token** that works for **multiple dashboards** with customer persona filtering applied to all.

## 🎯 New Token Strategy

### Single Token for Multiple Dashboards

Instead of creating individual tokens per dashboard, we now create one token that handles multiple dashboards with their respective filters:

```javascript
// OLD APPROACH (❌ Caused errors)
// Create separate token for each dashboard
dashboards.forEach(dashboard => {
  createTokenForDashboard(dashboard.embedId, customerId);
});

// NEW APPROACH (✅ Works correctly)
// Create one token for all dashboards
const dashboardIds = dashboards.map(d => d.embedId);
createTokenForMultipleDashboards(dashboardIds, customerId);
```

### Backend Implementation

**Updated Guest Token Creation:**
```javascript
// backend/server.js
app.post('/api/dashboard-guest-token', async (req, res) => {
  const { clientId, customerId, dashboardIds, userPersona } = req.body;
  
  const requestBody = {
    clientId: clientId,
    dataAppName: dataAppName
  };

  // Create filters for multiple dashboards
  if (dashboardIds && Array.isArray(dashboardIds) && dashboardIds.length > 0 && customerId) {
    requestBody.params = {
      dashboardAppFilters: dashboardIds.map(dashboardId => ({
        dashboardId: dashboardId,
        values: {
          'Customer App filter': customerId
        },
        isShowOnUrl: false
      }))
    };
  }
  
  // Single API call to DataBrain
  const response = await fetch(`${API_BASE_URL}/api/v2/guest-token/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DATABRAIN_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
});
```

**Request Structure:**
```json
{
  "clientId": "101",
  "dataAppName": "Demo Sales Data App",
  "params": {
    "dashboardAppFilters": [
      {
        "dashboardId": "dashboard-123",
        "values": {
          "Customer App filter": "285407"
        },
        "isShowOnUrl": false
      },
      {
        "dashboardId": "dashboard-456", 
        "values": {
          "Customer App filter": "285407"
        },
        "isShowOnUrl": false
      }
    ]
  }
}
```

### Frontend Implementation

**Updated Token Management:**
```typescript
// src/App.tsx
const fetchGuestTokenForDashboards = useCallback(async (
  dashboardIds: string[], 
  clientId: string, 
  customerId?: string
) => {
  const requestBody = {
    clientId: clientId,
    customerId: customerId,
    dashboardIds: dashboardIds, // Array of dashboard IDs
    userPersona: currentUser.name
  };

  const response = await fetch('http://localhost:3001/api/dashboard-guest-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
  
  if (response.ok) {
    const data = await response.json();
    
    // Cache the same token for all dashboards
    const tokenCache: Record<string, string> = {};
    dashboardIds.forEach(dashboardId => {
      tokenCache[dashboardId] = data.guestToken;
    });
    
    setDashboardTokens(prev => ({ ...prev, ...tokenCache }));
    setToken(data.guestToken);
  }
}, [currentUser.name]);
```

## 🔄 New User Flow

### 1. **Dashboard List Loading**
```typescript
const handleDashboardsLoaded = (dashboards) => {
  // Get all dashboard IDs
  const dashboardIds = dashboards
    .filter(d => d.isDashboard)
    .map(d => d.embedId);
  
  // Create one token for all dashboards
  if (dashboardIds.length > 0) {
    fetchGuestTokenForDashboards(dashboardIds, clientId, currentUser.customerId);
  }
};
```

### 2. **Instant Dashboard Switching**
```typescript
const handleDashboardTabChange = (embedId) => {
  // Update UI immediately
  setCurrentDashboardId(embedId);
  
  // Use cached token (same token works for all dashboards)
  const cachedToken = dashboardTokens[embedId];
  if (cachedToken) {
    setToken(cachedToken); // Instant switch!
  }
};
```

### 3. **User Context Change**
```typescript
const handleUserChange = (user) => {
  setCurrentUser(user);
  setDashboardTokens({}); // Clear cache
  
  // Re-create token for all dashboards with new user context
  const dashboardIds = availableDashboards
    .filter(d => d.isDashboard)
    .map(d => d.embedId);
    
  fetchGuestTokenForDashboards(dashboardIds, clientId, user.customerId);
};
```

### 4. **New Dashboard Creation**
```typescript
const handleDashboardCreated = (dashboard) => {
  // Add new dashboard to list
  setAvailableDashboards(prev => [...prev, newDashboard]);
  
  // Re-create token for ALL dashboards including the new one
  const allDashboardIds = [
    ...availableDashboards.filter(d => d.isDashboard).map(d => d.embedId),
    dashboard.embedId
  ];
  
  fetchGuestTokenForDashboards(allDashboardIds, clientId, currentUser.customerId);
};
```

## 🎯 Benefits

### Performance Improvements
- ✅ **Single API Call:** One token creation instead of multiple
- ✅ **Instant Switching:** All dashboards use the same cached token
- ✅ **Reduced Latency:** No per-dashboard token fetching delays
- ✅ **Better UX:** Seamless dashboard transitions

### Error Prevention
- ✅ **No Invalid Dashboard IDs:** Only uses actual dashboard IDs from List Embeds API
- ✅ **Consistent Filtering:** Same customer filter applied to all dashboards
- ✅ **Atomic Operations:** Single token creation reduces failure points
- ✅ **Better Error Handling:** Centralized token management

### Customer Persona Filtering
- ✅ **Michael (285407):** One token filters all his dashboards to customer 285407
- ✅ **Jake (440422):** One token filters all his dashboards to customer 440422
- ✅ **Data Isolation:** Each user's token only shows their customer data
- ✅ **Security:** Customer filtering embedded at token level

## 🔧 Technical Details

### Token Caching Strategy
```typescript
// Single token cached for all dashboards
const dashboardTokens = {
  'dashboard-123': 'token-abc-xyz', // Same token
  'dashboard-456': 'token-abc-xyz', // Same token  
  'dashboard-789': 'token-abc-xyz'  // Same token
};
```

### Customer Filtering Logic
```javascript
// Each dashboard gets the same customer filter
dashboardAppFilters: [
  { dashboardId: 'dashboard-123', values: { 'Customer App filter': '285407' } },
  { dashboardId: 'dashboard-456', values: { 'Customer App filter': '285407' } },
  { dashboardId: 'dashboard-789', values: { 'Customer App filter': '285407' } }
]
```

### Error Handling
```typescript
// Fallback for missing cached tokens
const cachedToken = dashboardTokens[embedId];
if (cachedToken) {
  setToken(cachedToken);
} else {
  // Re-create token for all dashboards
  const dashboardIds = availableDashboards
    .filter(d => d.isDashboard)
    .map(d => d.embedId);
  fetchGuestTokenForDashboards(dashboardIds, clientId, currentUser.customerId);
}
```

## 📊 Example Usage

### Michael's Journey
1. **Sign In:** Michael Thompson (Customer ID: 285407)
2. **Dashboard Load:** Fetches 3 dashboards from List Embeds API
3. **Token Creation:** One token with filters for all 3 dashboards
4. **Dashboard Switch:** Instant switching using cached token
5. **Data Filtering:** All dashboards show only customer 285407 data

### Jake's Journey  
1. **Sign In:** Jake Rodriguez (Customer ID: 440422)
2. **Dashboard Load:** Same 3 dashboards
3. **Token Creation:** New token with filters for customer 440422
4. **Dashboard Switch:** Instant switching with different data
5. **Data Isolation:** All dashboards show only customer 440422 data

## 🚀 Results

### Before (❌ Issues)
- Multiple API calls per user
- `APP_FILTER_PARAM_ERROR` with invalid dashboard IDs
- Slow dashboard switching
- Complex token management

### After (✅ Fixed)
- Single API call per user
- Valid dashboard IDs from List Embeds API
- Instant dashboard switching
- Simple, efficient token caching
- Proper customer persona filtering

---

**Implementation Status:** ✅ Complete  
**Error Resolution:** APP_FILTER_PARAM_ERROR fixed  
**Performance:** Significantly improved dashboard switching  
**User Experience:** Seamless multi-dashboard navigation with customer filtering
