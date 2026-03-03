# Use Cases Analysis & Implementation Plan

Analysis of three key use cases for the DataBrain React Demo based on the [DataBrain Create Dashboard Embed API](https://docs.usedatabrain.com/developer-docs/helpers/api-reference/create-dashboard-embed).

---

## 📊 Use Case Summary

| Use Case | Description | Status | Notes |
|----------|-------------|--------|-------|
| **1** | End user creates a metric to an existing dashboard | ✅ **IMPLEMENTED** | Widget creation working |
| **2** | End user creates their own dashboard - visible to everyone in tenant | ⚠️ **PARTIALLY IMPLEMENTED** | Creates dashboard but no visibility control |
| **3** | End user creates private dashboard - visible only to them | ❌ **NOT IMPLEMENTED** | Missing `isAllowPrivateMetricsByDefault` |

---

## Use Case 1: Create Metric to Existing Dashboard

### ✅ Status: **IMPLEMENTED**

### Current Implementation

**Frontend:**
- Component: `src/components/WidgetManager.tsx`
- Permission gate: `create_widgets` permission
- Creates widgets/metrics on existing dashboards

**Backend:**
- Endpoint: `POST /api/create-widget`
- Located: `backend/server.js` (not shown in snippet but referenced in WidgetManager)

**Permissions in Guest Token:**
```javascript
// backend/server.js:247-248
permissions: {
  isEnableManageMetrics: true,
  isEnableCreateDashboardView: true,
  isEnableCustomizeLayout: true,
  isEnableUnderlyingData: true,
  isEnableDownloadMetrics: true
}
```

**User Permission:**
```typescript
// src/types/user.ts:58-62
CREATE_WIDGETS: {
  id: 'create_widgets',
  name: 'Create new widgets',
  description: 'Ability to create new widgets in existing customer\'s dashboard (private view)',
  enabled: false
}
```

### ✅ **What Works:**
- All Store Managers have `create_widgets: true`
- WidgetManager component allows creating widgets
- Widgets are saved to the dashboard via API

### 🎯 Verification:
**To test:**
1. Login as any Store Manager (e.g., "Store Manager - Ramirez Ltd")
2. Select a dashboard
3. Use WidgetManager to create a new metric
4. Metric appears on the dashboard

---

## Use Case 2: Create Dashboard - Visible to Everyone in Tenant

### ⚠️ Status: **PARTIALLY IMPLEMENTED**

### Current Implementation

**Frontend:**
- Component: `src/components/CreateDashboard.tsx`
- Permission gate: `create_dashboards` permission
- Creates new dashboards via API

**Backend:**
- Endpoint: `POST /api/v2/create-dashboard`
- Located: `backend/server.js:615-759`

**Current API Call:**
```javascript
// backend/server.js:674-700
const requestBody = {
  dashboardId: newDashboardId,
  clientId: clientId,
  templateDashboardId: 'chat-mode-dash',
  metadata: {
    name: dashboardName,
    description: description || '',
    createdAt: new Date().toISOString(),
    createdBy: 'API',
    userIdentifier: userIdentifier, // Store Name for grouping
    originalName: dashboardName
  },
  workspaceName: workspaceName,
  accessSettings: {
    datamartName: datamartName,
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
  // ⚠️ MISSING: isAllowPrivateMetricsByDefault
};
```

### ❌ **What's Missing:**

According to the [DataBrain API docs](https://docs.usedatabrain.com/developer-docs/helpers/api-reference/create-dashboard-embed), the request body supports:

```javascript
{
  // ... other fields
  isAllowPrivateMetricsByDefault: boolean // ← MISSING!
}
```

**Current behavior:**
- Creates dashboards with `userIdentifier` (Store Name)
- No explicit visibility control
- Unclear if dashboard is tenant-wide or private

### 🔧 **What Needs to Be Fixed:**

1. **Add `isAllowPrivateMetricsByDefault: false`** to make metrics public by default
2. **Remove or adjust `userIdentifier`** - it's being used for "dashboard grouping" but may create isolation

**Updated code should be:**
```javascript
const requestBody = {
  dashboardId: newDashboardId,
  clientId: clientId, // Tenant-level ID (e.g., "101")
  templateDashboardId: 'chat-mode-dash',
  metadata: {
    name: dashboardName,
    description: description || '',
    createdAt: new Date().toISOString(),
    createdBy: user.name, // Track who created it
    createdByUserId: user.id,
    tenantId: clientId, // Make it clear this is tenant-scoped
    isPublic: true // Metadata flag for UI filtering
  },
  workspaceName: workspaceName,
  isAllowPrivateMetricsByDefault: false, // ← ADD THIS!
  accessSettings: {
    datamartName: datamartName,
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
```

---

## Use Case 3: Create Private Dashboard - Visible Only to Creator

### ❌ Status: **NOT IMPLEMENTED**

### What Needs to Be Implemented

According to the [DataBrain API docs](https://docs.usedatabrain.com/developer-docs/helpers/api-reference/create-dashboard-embed):

**For private dashboards:**
```javascript
{
  dashboardId: "user-private-dashboard-id",
  clientId: "101", // Tenant ID
  isAllowPrivateMetricsByDefault: true, // ← KEY DIFFERENCE!
  metadata: {
    name: "My Private Dashboard",
    userIdentifier: "user-101-1", // User-specific ID
    isPrivate: true,
    createdBy: "user-101-1"
  },
  // ... rest of config
}
```

### 🔧 Implementation Plan

#### 1. Update CreateDashboard Component

**Add privacy toggle:**
```typescript
// src/components/CreateDashboard.tsx

interface FormData {
  embedName: string;
  description: string;
  sourceDashboardId: string;
  isPrivate: boolean; // ← ADD THIS
}

const [formData, setFormData] = useState<FormData>({
  embedName: '',
  description: '',
  sourceDashboardId: 'chat-mode-dash',
  isPrivate: false // ← ADD THIS (default to public)
});

// In form JSX:
<div className="flex items-center space-x-2">
  <input
    type="checkbox"
    id="isPrivate"
    checked={formData.isPrivate}
    onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
  />
  <Label htmlFor="isPrivate">
    Make this dashboard private (visible only to me)
  </Label>
</div>
```

#### 2. Update Backend Endpoint

**Modify `/api/v2/create-dashboard`:**
```javascript
// backend/server.js

app.post('/api/v2/create-dashboard', async (req, res) => {
  try {
    let { 
      dashboardName, 
      description, 
      datamartName, 
      dashboardId, 
      userIdentifier, 
      clientId,
      isPrivate // ← ADD THIS
    } = req.body;

    // Generate dashboard ID
    const newDashboardId = generateDashboardId(dashboardName);

    const requestBody = {
      dashboardId: newDashboardId,
      clientId: clientId, // Tenant ID (e.g., "101")
      templateDashboardId: 'chat-mode-dash',
      
      // ⭐ KEY CHANGE: Set based on user's choice
      isAllowPrivateMetricsByDefault: isPrivate || false,
      
      metadata: {
        name: dashboardName,
        description: description || '',
        createdAt: new Date().toISOString(),
        createdBy: 'API',
        
        // ⭐ If private, use user-specific identifier
        // If public, use tenant identifier or omit
        userIdentifier: isPrivate ? userIdentifier : null,
        
        isPrivate: isPrivate || false, // Track in metadata
        visibility: isPrivate ? 'private' : 'tenant' // Clear visibility level
      },
      workspaceName: workspaceName,
      accessSettings: {
        datamartName: datamartName,
        isAllowAiPilot: true,
        isAllowEmailReports: true,
        isAllowManageMetrics: true,
        isAllowMetricCreation: true,
        isAllowMetricDeletion: isPrivate, // Allow deletion only for private
        isAllowMetricLayoutChange: true,
        isAllowMetricUpdate: true,
        isAllowUnderlyingData: true,
        isAllowCreateDashboardView: true,
        metricCreationMode: 'DRAG_DROP'
      }
    };

    // Rest of the code...
  }
});
```

#### 3. Update Dashboard Listing/Filtering

**Modify `DashboardSelector.tsx` to filter based on visibility:**
```typescript
// src/components/DashboardSelector.tsx

const filterDashboardsByVisibility = (dashboards, currentUser) => {
  return dashboards.filter(dashboard => {
    const isPrivate = dashboard.metadata?.isPrivate;
    const dashboardOwner = dashboard.metadata?.userIdentifier;
    const visibility = dashboard.metadata?.visibility;
    
    // Template dashboard - visible to all
    if (dashboard.embedId === 'chat-mode-dash') {
      return true;
    }
    
    // Public/tenant dashboard - visible to all in tenant
    if (!isPrivate || visibility === 'tenant') {
      return dashboard.clientId === currentUser.clientId;
    }
    
    // Private dashboard - only visible to creator
    if (isPrivate || visibility === 'private') {
      return dashboardOwner === currentUser.id || 
             dashboardOwner === currentUser.storeName;
    }
    
    return true; // Fallback: show it
  });
};
```

#### 4. Update UI to Show Privacy Status

**Add badges/indicators:**
```typescript
// In dashboard list
{dashboard.metadata?.isPrivate && (
  <Badge variant="secondary">
    🔒 Private
  </Badge>
)}

{!dashboard.metadata?.isPrivate && dashboard.embedId !== 'chat-mode-dash' && (
  <Badge variant="outline">
    👥 Shared with Tenant
  </Badge>
)}
```

---

## 🎯 User Permission Matrix

Based on current `src/types/user.ts` implementation:

| Permission | All Store Managers | Purpose |
|------------|-------------------|---------|
| `create_widgets` | ✅ Enabled | Create metrics on existing dashboards |
| `create_dashboards` | ✅ Enabled | Create new dashboards |
| `publish_dashboards` | ❌ Disabled | Publish dashboards system-wide |
| `manage_custom_widgets` | ✅ Enabled | Edit/delete own widgets |
| `manage_custom_dashboards` | ❌ Disabled | Edit/delete dashboards |

**Perfect for our use cases!**
- ✅ Users CAN create metrics (Use Case 1)
- ✅ Users CAN create dashboards (Use Cases 2 & 3)
- ✅ Users CANNOT delete dashboards (prevents accidents)

---

## ✅ Implementation Complete

### Use Case 2 (Public Dashboard) - IMPLEMENTED

- ✅ Added `isAllowPrivateMetricsByDefault: false` to `backend/server.js:678`
- ✅ Updated metadata with `visibility: 'tenant'`
- ✅ Dashboard appears for all users in same tenant
- ✅ Other tenants cannot see it (filtered by clientId)

### Use Case 3 (Private Dashboard) - FULLY IMPLEMENTED

- ✅ Added `isPrivate` field to CreateDashboard form interface
- ✅ Added checkbox/toggle in UI for privacy setting with help text
- ✅ Updated backend to accept `isPrivate` parameter
- ✅ Set `isAllowPrivateMetricsByDefault: true` when `isPrivate === true`
- ✅ Store `userIdentifier` as `creatorId` for access control
- ✅ Updated `DashboardSelector` to filter private dashboards based on creator
- ✅ Added visual indicators (🔒 Private badge) on dashboard tabs
- ✅ Ready to test: private dashboard only visible to creator
- ✅ Ready to test: switching users hides private dashboards

### Documentation

- ✅ Created [PRIVACY_FEATURE.md](./PRIVACY_FEATURE.md) with complete technical documentation
- ✅ Updated [SUMMARY.md](./SUMMARY.md) with privacy feature reference

### Testing Matrix

| Test Case | User | Action | Expected Result |
|-----------|------|--------|-----------------|
| 1.1 | Store Manager 1 | Create metric on "chat-mode-dash" | ✅ Metric added |
| 1.2 | Store Manager 2 | View same dashboard | ✅ Sees the metric |
| 2.1 | Store Manager 1 | Create public dashboard | ✅ Dashboard created |
| 2.2 | Store Manager 2 (same tenant) | View dashboards | ✅ Sees public dashboard |
| 2.3 | Store Manager (different tenant) | View dashboards | ❌ Does NOT see it |
| 3.1 | Store Manager 1 | Create private dashboard | ✅ Dashboard created |
| 3.2 | Store Manager 1 | View dashboards | ✅ Sees private dashboard |
| 3.3 | Store Manager 2 (same tenant) | View dashboards | ❌ Does NOT see private dashboard |
| 3.4 | Store Manager 1 | Add metric to private dashboard | ✅ Metric added |
| 3.5 | Store Manager 2 | Cannot access private dashboard URL | ❌ Access denied |

---

## 🔍 Code Locations for Changes

### Files to Modify

1. **Frontend - CreateDashboard Component**
   - File: `src/components/CreateDashboard.tsx`
   - Lines: 32-36 (add `isPrivate` to FormData)
   - Lines: 46-50 (initialize with `isPrivate: false`)
   - Lines: 107-114 (add `isPrivate` to request body)
   - Lines: 164-165 (add privacy toggle in form)

2. **Backend - Create Dashboard Endpoint**
   - File: `backend/server.js`
   - Lines: 620 (add `isPrivate` to destructuring)
   - Lines: 674-700 (add `isAllowPrivateMetricsByDefault`)
   - Lines: 678-684 (update metadata with privacy info)

3. **Frontend - Dashboard Filtering**
   - File: `src/components/DashboardSelector.tsx`
   - Add filtering logic based on privacy
   - Add privacy badges/indicators

4. **Documentation**
   - Update `README.md` to mention privacy feature
   - Update `QUICK_START.md` with privacy examples
   - Update `docs/DEVELOPER.md` with privacy implementation details

---

## 📚 References

- [DataBrain Create Dashboard Embed API](https://docs.usedatabrain.com/developer-docs/helpers/api-reference/create-dashboard-embed)
- [Guest Token API](https://docs.usedatabrain.com/developer-docs/helpers/api-reference/token)
- [Multi-Tenant Access Control](https://docs.usedatabrain.com/developer-docs/embedding-setup/multi-tenant-access-control)

---

## 🎯 Summary

**Current State:**
- ✅ Use Case 1: Fully working
- ⚠️ Use Case 2: Works but needs `isAllowPrivateMetricsByDefault: false`
- ❌ Use Case 3: Not implemented, needs privacy toggle

**Effort Required:**
- Use Case 2 fix: **5 minutes** (add one line)
- Use Case 3 implementation: **2-3 hours** (frontend + backend + testing)

**Priority:**
1. Fix Use Case 2 (quick win)
2. Implement Use Case 3 (new feature)
3. Add comprehensive testing

---

**Ready to implement? Let me know and I'll help with the code changes!**

