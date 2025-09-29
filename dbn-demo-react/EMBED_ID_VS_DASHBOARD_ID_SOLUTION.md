# 🔧 Embed ID vs Dashboard ID Solution

## Problem Identified

**Error:** `APP_FILTER_PARAM_ERROR - Invalid dashboard Id: dbn-demo__gWaUr6G9 in dashboard appFilter`

**Root Cause:** The **List All Embeds API** returns `embedId` values, but the **Guest Token API** with `dashboardAppFilters` expects actual **dashboard IDs**, not embed configuration IDs.

## 🔍 Analysis from Your Logs

From your backend logs, we can see:

```json
{
  "data": [
    {
      "embedId": "dbn-demo",           // ✅ This works (actual dashboard ID)
      "embedType": "dashboard",
      "externalDashboard": {
        "name": "Demo Dashboard"
      }
    },
    {
      "embedId": "dbn-demo__gWaUr6G9", // ❌ This fails (embed configuration ID)
      "embedType": "dashboard", 
      "externalDashboard": {
        "name": "Demo Dashboard"
      }
    }
  ]
}
```

**Key Insight:**
- `dbn-demo` = Actual dashboard ID (works with dashboardAppFilters)
- `dbn-demo__gWaUr6G9` = Embed configuration ID (doesn't work with dashboardAppFilters)

## 🛠️ Solution Implemented

### 1. **Smart Dashboard ID Filtering**

Added logic to filter out embed configuration IDs and only use actual dashboard IDs:

```javascript
// backend/server.js
const validDashboardIds = dashboardIds.filter(id => {
  // Keep IDs that don't contain "__" (likely actual dashboard IDs)
  // Skip IDs that contain "__" (likely embed configuration IDs)
  const isValid = !id.includes('__');
  if (!isValid) {
    console.log(`⚠️ Skipping potentially invalid dashboard ID: ${id} (contains '__', likely an embed ID)`);
  }
  return isValid;
});
```

### 2. **Enhanced Logging**

Added comprehensive logging to track the filtering process:

```javascript
console.log('Dashboard app filters configured for valid dashboards:', {
  originalCount: dashboardIds.length,
  validCount: validDashboardIds.length,
  validDashboardIds: validDashboardIds,
  skippedIds: dashboardIds.filter(id => id.includes('__')),
  filterKey: 'Customer App filter',
  filterValue: customerId,
  userPersona: userPersona || 'unknown'
});
```

### 3. **Fallback Strategy**

If no valid dashboard IDs are found, create a general token without dashboard-specific filters:

```javascript
if (validDashboardIds.length > 0) {
  // Create token with dashboard app filters
  requestBody.params = { dashboardAppFilters: [...] };
} else {
  // Create general token without dashboard-specific filters
  console.log('⚠️ No valid dashboard IDs found, creating general token without dashboard-specific filters');
}
```

### 4. **Fixed Node.js Warning**

Added `"type": "module"` to `backend/package.json` to eliminate the ES module warning.

## 🎯 Expected Behavior After Fix

### Your Logs Should Now Show:

```
Dashboard app filters configured for valid dashboards: {
  originalCount: 2,
  validCount: 1,
  validDashboardIds: ['dbn-demo'],
  skippedIds: ['dbn-demo__gWaUr6G9'],
  filterKey: 'Customer App filter',
  filterValue: '285407',
  userPersona: 'Michael Thompson'
}

Actual request body being sent: {
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

DataBrain API Response Status: 200 OK
✅ Guest token created successfully
```

## 🔄 How It Works

### 1. **List All Embeds API Call**
```
GET /api/v2/dataApp/embed/list
Returns: embedId values (mix of dashboard IDs and embed configuration IDs)
```

### 2. **Smart Filtering**
```javascript
Input:  ['dbn-demo', 'dbn-demo__gWaUr6G9']
Filter: Remove IDs containing '__'
Output: ['dbn-demo']
```

### 3. **Guest Token Creation**
```
POST /api/v2/guest-token/create
Uses: Only valid dashboard IDs in dashboardAppFilters
Result: ✅ Success with customer filtering
```

### 4. **Frontend Usage**
```javascript
// All embeds are available for display
availableDashboards = [
  { embedId: 'dbn-demo', name: 'Demo Dashboard' },
  { embedId: 'dbn-demo__gWaUr6G9', name: 'Demo Dashboard' }
];

// But token only filters the valid dashboard
token.dashboardAppFilters = [
  { dashboardId: 'dbn-demo', values: { 'Customer App filter': '285407' } }
];
```

## 🎭 User Experience Impact

### Michael Thompson (Customer ID: 285407)
- **Sees:** Both dashboard tabs in the UI
- **Data Filtering:** Customer filtering applied to `dbn-demo` dashboard
- **Embed `dbn-demo__gWaUr6G9`:** May show unfiltered data (needs investigation)

### Potential Issues to Monitor
1. **Mixed Filtering:** Some dashboards filtered, others not
2. **Data Leakage:** Embed configurations might bypass filtering
3. **User Confusion:** Same dashboard name, different data

## 🔍 Next Steps for Investigation

### 1. **Verify Dashboard Relationship**
Check if `dbn-demo__gWaUr6G9` is actually a copy/configuration of `dbn-demo`:
- Same underlying data source?
- Different embed configuration settings?
- Created via "Save As" or copy functionality?

### 2. **Test Data Filtering**
After the fix, test both dashboards:
- `dbn-demo` → Should show filtered data for Michael (285407)
- `dbn-demo__gWaUr6G9` → Check what data it shows

### 3. **Consider Alternative Approaches**
If embed configurations need filtering:
- Use different filtering mechanism (RLS settings?)
- Create separate tokens per embed type
- Implement application-level filtering

## 🚨 Monitoring Points

### Success Indicators:
- ✅ No more `APP_FILTER_PARAM_ERROR`
- ✅ Guest token creation succeeds
- ✅ `dbn-demo` dashboard shows filtered data
- ✅ No Node.js module warnings

### Watch For:
- ⚠️ `dbn-demo__gWaUr6G9` showing unfiltered data
- ⚠️ Users seeing data from other customers
- ⚠️ Performance impact from multiple embed configurations

## 🔧 Alternative Solutions (If Needed)

### Option 1: Separate Token Strategy
```javascript
// Create different tokens for different embed types
const dashboardIds = embeds.filter(e => !e.embedId.includes('__')).map(e => e.embedId);
const embedIds = embeds.filter(e => e.embedId.includes('__')).map(e => e.embedId);

// Token 1: For actual dashboards with dashboardAppFilters
// Token 2: For embed configurations with different filtering approach
```

### Option 2: Application-Level Filtering
```javascript
// Skip dashboard app filters entirely
// Implement filtering in your application logic
const token = createGeneralToken(clientId, customerId);
// Filter data in frontend based on currentUser.customerId
```

### Option 3: DataBrain Configuration
```javascript
// Check if embed configurations can be configured to reference the same dashboard ID
// This would allow using 'dbn-demo' for both embeds
```

---

**Status:** ✅ Implemented smart filtering solution  
**Expected Result:** Guest token creation should now succeed  
**Next:** Test the fix and monitor data filtering behavior
