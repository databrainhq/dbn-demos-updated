# 🔧 Fixed Token Flow - Based on Actual Logs

## 🔍 **Issues Identified from Logs:**

### **Issue 1: Invalid `customerContext` Parameter**
```
ERROR: "params.customerContext" is not allowed
```
**Problem:** DataBrain API doesn't support custom `customerContext` parameter.

### **Issue 2: Invalid Dashboard ID for Filtering**
```
ERROR: Invalid dashboard Id: dbn-demo__gWaUr6G9 in dashboard appFilter
```
**Problem:** `dbn-demo__gWaUr6G9` is an embed configuration, not a valid dashboard ID for filtering.

### **Issue 3: Correct Flow but Wrong Implementation**
The sequence was right, but the implementation had invalid parameters.

## ✅ **Fixed Approach:**

### **Step 1: Create General Guest Token (No Custom Params)**
```javascript
// For initial authentication - just basic token
{
  "clientId": "101",
  "dataAppName": "Demo Sales Data App"
  // No params - just basic authentication
}
```

### **Step 2: Fetch Embed List (Works Fine)**
```javascript
// This already works correctly
POST /api/v2/dataApp/embed/list
Response: ["dbn-demo", "dbn-demo__gWaUr6G9"]
```

### **Step 3: Create Filtered Token (Only Valid Dashboard IDs)**
```javascript
// Filter out invalid IDs, only use valid ones
{
  "clientId": "101",
  "dataAppName": "Demo Sales Data App",
  "params": {
    "dashboardAppFilters": [
      {
        "dashboardId": "dbn-demo",  // ✅ Valid - no '__'
        "values": {
          "Customer App filter": "285407"
        },
        "isShowOnUrl": false
      }
      // ❌ Skip "dbn-demo__gWaUr6G9" - contains '__'
    ]
  }
}
```

## 🎯 **Expected New Flow:**

### **Call 1: Initial Token (Empty dashboardIds)**
```
Request: { clientId: "101", customerId: "285407", dashboardIds: [] }
Backend: Creates basic token without params
DataBrain: { clientId: "101", dataAppName: "Demo Sales Data App" }
Result: ✅ Basic guest token created
```

### **Call 2: Fetch Embeds**
```
Request: POST /api/list-embeds
Backend: Uses basic token to fetch embeds
DataBrain: POST /api/v2/dataApp/embed/list
Result: ✅ Returns ["dbn-demo", "dbn-demo__gWaUr6G9"]
```

### **Call 3: Enhanced Token (Valid dashboardIds only)**
```
Request: { clientId: "101", customerId: "285407", dashboardIds: ["dbn-demo", "dbn-demo__gWaUr6G9"] }
Backend: Filters to valid IDs only: ["dbn-demo"]
DataBrain: Creates token with dashboardAppFilters for "dbn-demo" only
Result: ✅ Filtered token for customer 285407 on valid dashboard
```

## 📊 **Expected Logs After Fix:**

```
🔐 Step 1: Creating initial guest token...
Creating general guest token for initial authentication (no dashboard-specific filters)
Customer filtering will be applied at the application level
Actual request body: { "clientId": "101", "dataAppName": "Demo Sales Data App" }
DataBrain API Response Status: 200 OK ✅

📊 Step 2: Fetching embeds...
DataBrain List Embeds API Response Status: 200 OK ✅
Found 2 embeds: ["dbn-demo", "dbn-demo__gWaUr6G9"]

🎯 Step 3: Creating enhanced token with valid dashboard filters...
Dashboard app filters configured for valid dashboards only:
- originalCount: 2
- validCount: 1  
- validDashboardIds: ["dbn-demo"]
- skippedIds: ["dbn-demo__gWaUr6G9"]
Actual request body: {
  "clientId": "101",
  "dataAppName": "Demo Sales Data App", 
  "params": {
    "dashboardAppFilters": [{
      "dashboardId": "dbn-demo",
      "values": { "Customer App filter": "285407" },
      "isShowOnUrl": false
    }]
  }
}
DataBrain API Response Status: 200 OK ✅
```

## 🔧 **Code Changes Made:**

### **Backend Logic:**
```javascript
// Fixed approach - filter invalid dashboard IDs
if (customerId && dashboardIds && dashboardIds.length > 0) {
  const validDashboardIds = dashboardIds.filter(id => !id.includes('__'));
  
  if (validDashboardIds.length > 0) {
    // Only create filters for valid dashboard IDs
    requestBody.params = {
      dashboardAppFilters: validDashboardIds.map(dashboardId => ({
        dashboardId: dashboardId,
        values: { 'Customer App filter': customerId },
        isShowOnUrl: false
      }))
    };
  }
} else if (customerId) {
  // Create basic token without any special params
  console.log('Creating general guest token for initial authentication');
}
```

## 🎭 **User Experience:**

### **Michael Thompson (Customer 285407):**
- ✅ **Step 1:** Gets basic authentication token
- ✅ **Step 2:** Sees both dashboard options in UI
- ✅ **Step 3:** Gets filtered token for `dbn-demo` dashboard only
- ✅ **Result:** `dbn-demo` shows customer 285407 data, `dbn-demo__gWaUr6G9` shows unfiltered data

### **Jake Rodriguez (Customer 440422):**
- ✅ **Step 1:** Gets basic authentication token  
- ✅ **Step 2:** Sees both dashboard options in UI
- ✅ **Step 3:** Gets filtered token for `dbn-demo` dashboard only
- ✅ **Result:** `dbn-demo` shows customer 440422 data, `dbn-demo__gWaUr6G9` shows unfiltered data

## ⚠️ **Known Limitation:**

**`dbn-demo__gWaUr6G9` Dashboard:**
- Cannot be filtered using `dashboardAppFilters` (invalid ID)
- Will show unfiltered data for all users
- Consider hiding this dashboard or implementing application-level filtering

## 🚀 **Next Steps:**

1. **Test the fix** - Should see 200 OK responses for all API calls
2. **Verify filtering** - `dbn-demo` should show customer-specific data
3. **Handle unfiltered dashboard** - Decide what to do with `dbn-demo__gWaUr6G9`
4. **Monitor performance** - Should be much faster with working tokens

---

**Status:** 🔧 **Fixed Implementation**  
**Expected Result:** All API calls succeed, customer filtering works for valid dashboards  
**Limitation:** Some dashboards may not support filtering (embed configurations)
