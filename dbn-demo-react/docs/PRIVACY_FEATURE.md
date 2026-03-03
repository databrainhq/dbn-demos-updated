# Dashboard Privacy Feature

This document explains the privacy feature for dashboards, allowing users to create both shared and private dashboards.

## Overview

The demo application supports three dashboard visibility modes:

1. **Template/OOTB Dashboards**: Always visible to all users in all tenants
2. **Tenant Dashboards (Public)**: Visible to all users within the same tenant
3. **Private Dashboards**: Only visible to the creator

## Use Cases

### Use Case 1: Add Metrics to Existing Dashboard
Users can create and add metrics to any dashboard they have access to. The metric visibility is controlled by the dashboard's `isAllowPrivateMetricsByDefault` setting.

**Implementation:**
- Enabled via `isAllowMetricCreation: true` in dashboard access settings
- Metric creation mode: `DRAG_DROP`

### Use Case 2: Create Shared Dashboard (Tenant-Wide)
Users can create new dashboards that are visible to everyone in their tenant.

**Implementation:**
- Dashboard created with `isPrivate: false`
- Set `isAllowPrivateMetricsByDefault: false` (metrics visible to all in tenant)
- Metadata includes `visibility: 'tenant'`

### Use Case 3: Create Private Dashboard
Users can create private dashboards that only they can see.

**Implementation:**
- Dashboard created with `isPrivate: true`
- Set `isAllowPrivateMetricsByDefault: true` (metrics only visible to creator)
- Metadata includes:
  - `visibility: 'private'`
  - `isPrivate: true`
  - `creatorId: <userIdentifier>` (for access control)

## Technical Implementation

### Frontend (CreateDashboard.tsx)

**Privacy Toggle:**
```tsx
<div className="flex items-start space-x-2 p-3 rounded-md border bg-muted/50">
  <input
    type="checkbox"
    id="dashboard-privacy"
    checked={formData.isPrivate}
    onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
  />
  <Label htmlFor="dashboard-privacy">Make this dashboard private</Label>
</div>
```

**Request Payload:**
```json
{
  "dashboardName": "My Dashboard",
  "description": "Dashboard description",
  "clientId": "101",
  "datamartName": "Sales Management Datamart",
  "userIdentifier": "Ramirez Ltd",
  "isPrivate": true
}
```

### Backend (server.js)

**Privacy Logic:**
```javascript
const dashboardIsPrivate = isPrivate === true;

const requestBody = {
  dashboardId: newDashboardId,
  clientId: clientId,
  templateDashboardId: 'chat-mode-dash',
  isAllowPrivateMetricsByDefault: dashboardIsPrivate,
  metadata: {
    name: dashboardName,
    description: description || '',
    userIdentifier: userIdentifier,
    isPrivate: dashboardIsPrivate,
    visibility: dashboardIsPrivate ? 'private' : 'tenant',
    creatorId: userIdentifier
  },
  // ... accessSettings
};
```

### Privacy Filtering (DashboardSelector.tsx)

Dashboards are filtered based on privacy settings before being displayed:

```typescript
const filterDashboardsByPrivacy = (dashboards: Embed[]): Embed[] => {
  if (!currentUser) return dashboards;
  
  return dashboards.filter(dashboard => {
    const metadata = dashboard.metadata || {};
    const isPrivate = metadata.isPrivate === true;
    const visibility = metadata.visibility as string;
    const creatorId = metadata.creatorId as string;
    
    // Template dashboard - always visible
    if (dashboard.embedId === 'chat-mode-dash') {
      return true;
    }
    
    // Public dashboard - visible to all in tenant
    if (!isPrivate || visibility === 'tenant') {
      return true;
    }
    
    // Private dashboard - only visible to creator
    if (isPrivate || visibility === 'private') {
      return creatorId === currentUser.storeName || 
             creatorId === currentUser.id;
    }
    
    return true;
  });
};
```

### Visual Indicators (App.tsx)

Private dashboards are marked with a badge:

```tsx
{availableDashboards.map((dashboard) => {
  const isPrivate = dashboard.metadata?.isPrivate === true || 
                    dashboard.metadata?.visibility === 'private';
  return (
    <TabsTrigger key={dashboard.embedId} value={dashboard.embedId}>
      <span className="flex items-center gap-2">
        {dashboard.name}
        {isPrivate && (
          <Badge variant="secondary">🔒 Private</Badge>
        )}
      </span>
    </TabsTrigger>
  );
})}
```

## API Reference

### Create Dashboard Endpoint

**Endpoint:** `POST /api/v2/create-dashboard`

**Request Body:**
```json
{
  "dashboardName": "string (required)",
  "description": "string (optional)",
  "clientId": "string (required)",
  "datamartName": "string (required)",
  "userIdentifier": "string (required)",
  "isPrivate": "boolean (optional, default: false)"
}
```

**Response:**
```json
{
  "success": true,
  "dashboardId": "my-dashboard-123",
  "embedId": "embed-id-123",
  "dashboardName": "My Dashboard",
  "description": "Dashboard description",
  "clientId": "101",
  "isPrivate": true,
  "visibility": "private",
  "message": "Dashboard created successfully for client (private)",
  "data": { /* DataBrain API response */ }
}
```

## DataBrain API Configuration

### isAllowPrivateMetricsByDefault

This DataBrain API parameter controls metric visibility within a dashboard:

- **false**: Metrics created on this dashboard are visible to all users in the tenant (Use Case 2)
- **true**: Metrics created on this dashboard are only visible to the creator (Use Case 3)

**Documentation:** [DataBrain Create Dashboard Embed API](https://docs.usedatabrain.com/developer-docs/helpers/api-reference/create-dashboard-embed)

## Testing the Feature

### Test Use Case 2: Shared Dashboard
1. Log in as any user
2. Click "Create New" dashboard
3. Enter dashboard name and description
4. **Leave "Make this dashboard private" UNCHECKED**
5. Click "Create Dashboard"
6. Switch to another user in the same tenant
7. ✅ Verify the dashboard is visible to the new user

### Test Use Case 3: Private Dashboard
1. Log in as a specific user (e.g., "John Smith")
2. Click "Create New" dashboard
3. Enter dashboard name and description
4. **CHECK "Make this dashboard private"**
5. Click "Create Dashboard"
6. ✅ Verify the dashboard shows a "🔒 Private" badge
7. Switch to another user in the same tenant
8. ✅ Verify the private dashboard is NOT visible to the new user
9. Switch back to the original creator (John Smith)
10. ✅ Verify the private dashboard is still visible

## Security Considerations

### Access Control
- Private dashboards are filtered at the UI level based on `creatorId` matching
- Backend also stores privacy metadata for future server-side filtering
- Multi-tenancy is enforced via `clientId` filtering at the DataBrain API level

### User Identification
The system uses `userIdentifier` (store name) to track dashboard creators:
- Stored in dashboard metadata as `creatorId`
- Compared against current user's `storeName` or `id`
- Supports multiple matching strategies for flexibility

### Privacy Metadata
Dashboards store multiple privacy indicators:
- `metadata.isPrivate`: Boolean flag (true/false)
- `metadata.visibility`: String enum ('tenant', 'private')
- `metadata.creatorId`: Creator identifier for access control
- `isAllowPrivateMetricsByDefault`: Controls metric visibility within dashboard

## Future Enhancements

1. **Server-Side Filtering**: Move privacy filtering to backend API
2. **Role-Based Access**: Allow admins to see all private dashboards
3. **Sharing Controls**: Let users share private dashboards with specific users
4. **Privacy Audit Log**: Track when users access private dashboards
5. **Bulk Privacy Updates**: Allow changing dashboard privacy after creation
6. **Privacy Settings UI**: Add privacy management in Settings page

## Troubleshooting

### Private Dashboard Visible to Wrong Users
- Check `creatorId` in dashboard metadata matches creator's `storeName`
- Verify `isPrivate: true` and `visibility: 'private'` in metadata
- Ensure `currentUser` prop is passed to `DashboardSelector`

### Shared Dashboard Not Visible
- Verify `isPrivate: false` or `visibility: 'tenant'` in metadata
- Check users are in the same tenant (`clientId` matches)
- Ensure dashboard was created successfully (check backend logs)

### Badge Not Showing
- Verify dashboard metadata includes `isPrivate` or `visibility`
- Check Badge component is imported in App.tsx
- Inspect dashboard object in browser console

