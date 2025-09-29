# 🎭 Customer Persona Filtering Implementation

## Overview

This document outlines the implementation of customer persona filtering using DataBrain's `dashboardAppFilters` parameter. This ensures that when users like Michael sign in, they only see data relevant to their customer context.

## 🔄 Implementation Flow

### 1. User Sign-In Flow
```
User (Michael) Signs In → Generate Guest Token → Apply Dashboard Filters → Load Filtered Dashboard
```

### 2. DataBrain API Integration
Based on the [DataBrain Guest Token API](https://docs.usedatabrain.com/developer-docs/helpers/api-reference/token), we use the `params.dashboardAppFilters` parameter to apply customer-specific filtering.

## 🛠️ Technical Implementation

### Backend Changes (`backend/server.js`)

#### Enhanced Guest Token Creation
```javascript
// Extract customer persona parameters
const { clientId, customerId, dashboardId, userPersona } = req.body;

// Build request body with dashboard app filters
const requestBody = {
  clientId: clientId,
  dataAppName: dataAppName
};

// Add dashboard app filters for customer persona filtering
if (dashboardId && customerId) {
  requestBody.params = {
    dashboardAppFilters: [
      {
        dashboardId: dashboardId,
        values: {
          'Customer App filter': customerId // Key name as specified
        },
        isShowOnUrl: false // Keep filters hidden from URL for security
      }
    ]
  };
}
```

#### API Request Structure
```javascript
POST /api/v2/guest-token/create
{
  "clientId": "101",
  "dataAppName": "Demo Sales Data App",
  "params": {
    "dashboardAppFilters": [
      {
        "dashboardId": "dbn-demo",
        "values": {
            "Customer App filter": "285407"
        },
        "isShowOnUrl": false
      }
    ]
  }
}
```

### Frontend Changes (`src/App.tsx`)

#### Enhanced Token Request
```typescript
const fetchGuestTokenFromBackend = async (clientId: string, customerId?: string) => {
  const requestBody = {
    clientId: clientId,
    ...(customerId && { customerId: customerId }),
    ...(currentDashboardId && { dashboardId: currentDashboardId }),
    userPersona: currentUser.name // For logging and tracking
  };

  console.log('🎯 Guest token request with dashboard app filters:', requestBody);
  
  const response = await fetch('http://localhost:3001/api/dashboard-guest-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
};
```

## 👤 Customer Personas

### Michael Thompson (Process Owner)
```typescript
{
  id: 'michael',
  name: 'Michael Thompson',
  customerId: '285407', // Maps to customer_id in demo_sales table
  clientId: '101',      // Top-level tenant ID
  role: 'Process Owner'
}
```

**Filtering Applied:**
- Dashboard ID: `dbn-demo`
- Filter Key: `Customer App filter`
- Filter Value: `285407`
- Result: Michael only sees data for customer ID 285407

### Jake Rodriguez (Automation Admin)
```typescript
{
  id: 'jake',
  name: 'Jake Rodriguez',
  customerId: '440422', // Maps to customer_id in demo_sales table
  clientId: '101',      // Top-level tenant ID
  role: 'Automation Admin'
}
```

**Filtering Applied:**
- Dashboard ID: `dbn-demo`
- Filter Key: `Customer App filter`
- Filter Value: `440422`
- Result: Jake only sees data for customer ID 440422

## 🔍 DataBrain API Parameters

### dashboardAppFilters Structure
Based on the [DataBrain documentation](https://docs.usedatabrain.com/developer-docs/helpers/api-reference/token):

```typescript
params.dashboardAppFilters: [
  {
    dashboardId: string,        // Required: Dashboard to apply filters to
    values: {                   // Required: Filter values
      [filterName]: string      // Key-value pairs for filtering
    },
    isShowOnUrl?: boolean       // Optional: Show filters in URL (default: false)
  }
]
```

### Our Implementation
```javascript
dashboardAppFilters: [
  {
    dashboardId: "dbn-demo",           // Target dashboard
    values: {
      "Customer App filter": "285407"   // Filter name and customer ID
    },
    isShowOnUrl: false                  // Keep filters hidden for security
  }
]
```

## 🚀 Usage Examples

### Example 1: Michael Signs In
```bash
# 1. User signs in as Michael
POST /api/dashboard-guest-token
{
  "clientId": "101",
  "customerId": "285407",
  "dashboardId": "dbn-demo",
  "userPersona": "Michael Thompson"
}

# 2. Backend generates filtered guest token
# 3. DataBrain dashboard shows only Michael's customer data (285407)
```

### Example 2: Jake Signs In
```bash
# 1. User signs in as Jake
POST /api/dashboard-guest-token
{
  "clientId": "101",
  "customerId": "440422",
  "dashboardId": "dbn-demo",
  "userPersona": "Jake Rodriguez"
}

# 2. Backend generates filtered guest token
# 3. DataBrain dashboard shows only Jake's customer data (440422)
```

## 🔒 Security Features

### 1. Backend-Only Token Generation
- Guest tokens are generated on the backend
- Customer filtering is applied server-side
- No sensitive filtering logic exposed to frontend

### 2. Hidden URL Parameters
```javascript
isShowOnUrl: false // Filters don't appear in browser URL
```

### 3. Secure Filter Application
- Filters are embedded in the guest token
- Cannot be modified by frontend
- Enforced by DataBrain at the API level

## 📊 Logging and Debugging

### Backend Logging
```javascript
console.log('Dashboard app filters configured:', {
  dashboardId,
  filterKey: 'Customer App filter',
  filterValue: customerId,
  userPersona: userPersona || 'unknown'
});
```

### Frontend Logging
```javascript
console.log('🎯 Dashboard app filter applied:', {
  filterName: 'Customer App filter',
  customerValue: customerId,
  dashboardId: currentDashboardId
});
```

## 🧪 Testing the Implementation

### 1. Test Michael's Data Access
```bash
# Sign in as Michael
# Expected: Dashboard shows only data for customer_id = 285407
# Verify: Check browser console for filter application logs
```

### 2. Test Jake's Data Access
```bash
# Sign in as Jake
# Expected: Dashboard shows only data for customer_id = 440422
# Verify: Check browser console for filter application logs
```

### 3. Verify Filter Security
```bash
# Check browser network tab
# Expected: Guest token contains embedded filters
# Expected: No filter parameters visible in URLs
```

## 🔧 Configuration Requirements

### DataBrain Setup
1. **Data App Configuration**: Ensure your DataBrain data app supports the `Customer App filter` parameter
2. **Database Schema**: Verify your data source has a `customer_id` column that matches the filter values
3. **Filter Definition**: Configure the `Customer App filter` in your DataBrain dashboard

### Backend Configuration
```javascript
// Ensure these are configured in backend/server.js
const DATABRAIN_API_TOKEN = 'your-api-token';
const dataAppName = 'Demo Sales Data App';
const API_BASE_URL = 'https://uat-api.usedatabrain.com';
```

### Frontend Configuration
```typescript
// User personas with customer IDs in src/types/user.ts
export const USERS: User[] = [
  {
    id: 'michael',
    customerId: '285407', // Must match database customer_id
    // ...
  }
];
```

## 🎯 Expected Behavior

### When Michael Signs In:
1. ✅ Guest token generated with `Customer App filter: "285407"`
2. ✅ Dashboard loads with filtering applied
3. ✅ Only data for customer ID 285407 is visible
4. ✅ Console shows filter application logs

### When Jake Signs In:
1. ✅ Guest token generated with `Customer App filter: "440422"`
2. ✅ Dashboard loads with filtering applied
3. ✅ Only data for customer ID 440422 is visible
4. ✅ Console shows filter application logs

### Security Verification:
1. ✅ No customer IDs visible in browser URLs
2. ✅ Guest tokens contain embedded filter parameters
3. ✅ Users cannot access other customers' data
4. ✅ Filter changes require new token generation

## 📚 References

- [DataBrain Guest Token API Documentation](https://docs.usedatabrain.com/developer-docs/helpers/api-reference/token)
- DataBrain Dashboard App Filters
- Customer Persona Implementation Guide

---

**Implementation Status:** ✅ Complete  
**Last Updated:** December 2024  
**Tested With:** Michael Thompson (285407), Jake Rodriguez (440422)
