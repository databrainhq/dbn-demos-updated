# Troubleshooting: Template Dashboard Error

## Error Message
```
ERROR: Failed to create dashboard: {
  error: {
    code: 'TEMPLATE_DASHBOARD_ERROR',
    message: 'invalid workspace or template dashboard id, no template dashboard found.'
  }
}
```

## Cause

This error occurs when:
1. The `DATABRAIN_WORKSPACE_NAME` doesn't match your actual DataBrain workspace
2. The template dashboard ID (`chat-mode-dash`) doesn't exist in your workspace
3. The workspace name is misspelled or has wrong capitalization

---

## Solution 1: Fix Workspace Name (Recommended)

### Step 1: Find Your Workspace Name

1. Go to [https://app.usedatabrain.com](https://app.usedatabrain.com)
2. Log in to your account
3. Look at the **top-left corner** or **workspace selector**
4. Copy your workspace name exactly as it appears

Common workspace names:
- `Default Workspace`
- `Production`
- `Development`
- Your company or project name

### Step 2: Update Environment Variable

Edit `backend/.env`:

```bash
# Before
DATABRAIN_WORKSPACE_NAME=Demo Workspace

# After (use YOUR actual workspace name)
DATABRAIN_WORKSPACE_NAME=Your Actual Workspace Name
```

**Important:** The workspace name is **case-sensitive**!

### Step 3: Restart Backend

```bash
cd backend
node server.js
```

### Step 4: Test

Try creating a private dashboard again. Check backend logs for:
```
📤 Creating dashboard with config: {
  "workspaceName": "Your Actual Workspace Name",
  ...
}
```

---

## Solution 2: Verify Template Dashboard Exists

### Check Dashboard Availability

Run this command to list dashboards in your workspace:

```bash
curl -X POST http://localhost:3002/api/v2/dashboards \
  -H "Content-Type: application/json" \
  -d '{"isPagination": false, "pageNumber": 1}' | python3 -m json.tool
```

**Expected output:**
```json
{
  "success": true,
  "dashboards": [
    {
      "name": "Chat Mode Dashboard",
      "externalDashboardId": "chat-mode-dash",
      ...
    }
  ]
}
```

### If Template Dashboard is Missing

1. **Option A:** Create a dashboard in DataBrain with ID `chat-mode-dash`
2. **Option B:** Use a different template dashboard ID (see Solution 3)
3. **Option C:** Create dashboards without a template (see Solution 4)

---

## Solution 3: Use Different Template Dashboard

If you have a different dashboard you want to use as a template:

### Step 1: Find Your Dashboard ID

List your dashboards (command above), then copy the `externalDashboardId` of the dashboard you want to use.

Example:
```json
{
  "name": "My Sales Dashboard",
  "externalDashboardId": "my-sales-dashboard"
}
```

### Step 2: Update Backend Code

Edit `backend/server.js` around line 680:

```javascript
// Before
templateDashboardId: 'chat-mode-dash',

// After (use your dashboard ID)
templateDashboardId: 'my-sales-dashboard',
```

### Step 3: Restart Backend

```bash
cd backend
node server.js
```

---

## Solution 4: Create Dashboards Without Template (Advanced)

If you don't want to use a template dashboard, you can make it optional:

### Modify Backend

Edit `backend/server.js` around line 674-680:

```javascript
const requestBody = {
  dashboardId: newDashboardId,
  clientId: clientId,
  // Remove or comment out templateDashboardId
  // templateDashboardId: 'chat-mode-dash',
  isAllowPrivateMetricsByDefault: dashboardIsPrivate,
  metadata: {
    // ... rest of metadata
  },
  workspaceName: workspaceName,
  accessSettings: {
    // ... access settings
  }
};
```

**Note:** Without a template, the new dashboard will be empty and won't inherit any metrics or filters from an existing dashboard.

---

## Debugging Tips

### Check Backend Logs

When creating a dashboard, the backend now logs:

```
📤 Creating dashboard with config: {
  "workspaceName": "Demo Workspace",
  "templateDashboardId": "chat-mode-dash",
  "isPrivate": true,
  "clientId": "101"
}

🔍 Debug Info:
   Workspace Name: Demo Workspace
   Template Dashboard ID: chat-mode-dash
   Client ID: 101
```

### Common Issues

| Issue | Solution |
|-------|----------|
| `TEMPLATE_DASHBOARD_ERROR` | Fix workspace name (Solution 1) |
| Workspace name wrong | Check DataBrain UI for exact name |
| Dashboard doesn't exist | Create it or use different template (Solution 3) |
| Want empty dashboards | Remove template requirement (Solution 4) |

### Verify Configuration

Check your current settings:

```bash
cd backend
cat .env | grep DATABRAIN
```

Should show:
```
DATABRAIN_API_KEY=your-api-key-here
DATABRAIN_DATA_APP_NAME=your-data-app-name
DATABRAIN_API_BASE_URL=https://api.usedatabrain.com
DATABRAIN_WORKSPACE_NAME=Your Actual Workspace Name
```

---

## Still Having Issues?

### Check DataBrain API Status

Verify your API credentials are working:

```bash
curl -X POST http://localhost:3002/api/v2/dashboards \
  -H "Content-Type: application/json" \
  -d '{"isPagination": false}'
```

If this fails, your API key or Data App Name might be incorrect.

### Contact Support

If none of these solutions work:

1. **Check the exact error** in backend console logs
2. **Verify workspace name** in DataBrain UI
3. **Confirm dashboard exists** with list command
4. **File an issue** with:
   - Error message from backend
   - Workspace name (redacted)
   - Dashboard list output
   - Backend logs

---

## Quick Reference

**Most Common Fix:**
```bash
# 1. Find your workspace name in DataBrain UI
# 2. Update backend/.env
DATABRAIN_WORKSPACE_NAME=Your Actual Workspace Name
# 3. Restart backend
cd backend && node server.js
# 4. Try again
```

**Test It Works:**
```bash
# Create a test dashboard (check backend logs for config)
# Look for "📤 Creating dashboard with config"
# Verify workspaceName matches your DataBrain workspace
```

---

**Updated:** November 7, 2024  
**Related:** [TESTING_GUIDE.md](./TESTING_GUIDE.md), [docs/PRIVACY_FEATURE.md](./docs/PRIVACY_FEATURE.md)


