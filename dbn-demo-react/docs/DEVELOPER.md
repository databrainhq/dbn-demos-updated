# Developer Reference - Hardcoded Values

> **👨‍💻 FOR DEVELOPERS ONLY**  
> This is internal documentation for developers who need to modify or understand the demo's internals.
> 
> **👤 Looking to run the demo?** See:
> - [CONFIGURATION.md](../CONFIGURATION.md) - Simple setup checklist
> - [QUICK_START.md](../QUICK_START.md) - Complete walkthrough
> 
> **📚 Other Developer Docs:**
> - [API.md](API.md) - Backend API reference

---

This document lists all hardcoded values in the demo application. If you're customizing the demo for your own use case, this reference helps you understand what needs to be changed.

---

## 🔧 Configuration Values (Environment-Based)

These are configurable via environment variables but have defaults:

| Variable | Default Value | Location | Notes |
|----------|---------------|----------|-------|
| **DATABRAIN_API_KEY** | (none) | `backend/env.example` | **REQUIRED** - Get from Data App |
| **DATABRAIN_DATA_APP_NAME** | (none) | `backend/env.example` | **REQUIRED** - Your Data App name |
| **DATABRAIN_API_BASE_URL** | `https://api.usedatabrain.com` | `backend/server.js:14` | Production API endpoint |
| **DATABRAIN_WORKSPACE_NAME** | `Demo Workspace` | `backend/server.js:15` | Used in some API calls |
| **PORT** | `3001` | `backend/server.js:1230` | Backend server port |

---

## 📊 DataBrain Resource Names

### Default Dashboard ID
**Value:** `chat-mode-dash`

**Locations:**
- `src/App.tsx:51` - Default dashboard config
- `backend/server.js:217` - Known dashboards with filters
- `backend/server.js:367, 390, 677` - Template dashboard references
- `backend/server.js:1101, 1124` - Special handling logic
- `src/components/CreateDashboard.tsx:49, 75` - Source dashboard for cloning

**Usage:** This is the main template dashboard that:
- Has app filters configured
- Serves as the default dashboard to display
- Acts as the template when creating new dashboards
- Has special handling for filtering logic

**⚠️ IMPORTANT:** This dashboard ID must exist in your DataBrain Data App for the demo to work!

---

### Datamart Name
**Value:** `Sales Management Datamart`

**Locations:**
- `backend/server.js:650, 654` - Fallback when creating dashboards
- `backend/server.js:804, 807` - Fallback when copying dashboards
- `src/components/CreateDashboard.tsx:111` - Default datamart for new dashboards

**Usage:** 
- Used when creating new dashboards
- Fallback value if auto-fetch from API fails
- If you don't have a datamart with this exact name, the app will try to auto-select the first available datamart

**Note:** The app will attempt to auto-fetch available datamarts from your DataBrain account, so this acts as a fallback only.

---

## 🌐 Network Configuration

### API Endpoints

#### Backend URL (hardcoded in frontend)
**Value:** `http://localhost:3002` (configurable via `VITE_API_URL`)

**Locations:** All frontend API calls use `API_BASE_URL` from `src/lib/config.ts` (env: `VITE_API_URL`, default `http://localhost:3002`).
- `src/App.tsx` - Guest token endpoint
- `src/components/CreateDashboard.tsx` - Create dashboard
- `src/components/DashboardSelector.tsx` - Fetch dashboards/embeds
- `src/components/DashboardActions.tsx` - Copy/publish dashboard (optional, not mounted)
- `src/components/Reports.tsx` - Fetch metrics, metric data, CSV
- `src/components/Settings.tsx` - Config endpoints
- `src/components/AiPilotPanel.tsx` - AI Pilot

**Note:** Widget CRUD is not implemented in this template (no backend routes). Set `VITE_API_URL` in root `.env` for production.

#### Frontend URL
**Value:** `http://localhost:5173`

**Locations:**
- Documentation only (README.md, QUICK_START.md)
- `backend/server.js:1256` - Helpful console message

**Usage:** Default Vite dev server port

---

## 👥 Demo Data (Mock Users & Tenants)

### Tenant Structure
**File:** `src/types/user.ts`

**Hardcoded Tenants:** 5 tenants (Client 101-105)

Each tenant has:
- **Client ID:** `101`, `102`, `103`, `104`, `105`
- **4 Store Managers** per tenant (20 users total)

#### Example User Structure:
```typescript
{
  id: 'user-101-1',
  name: 'Store Manager - Ramirez Ltd',
  email: 'manager1@client101.com',
  role: 'Store Manager',
  customerId: '101-1',      // Used for row-level filtering
  clientId: '101',          // Top-level tenant
  storeName: 'Ramirez Ltd', // Used for app filtering
  permissions: [...]
}
```

### Store Names (20 stores across 5 tenants)
**Tenant 101:**
- Ramirez Ltd
- Reese, Allen and Fisher
- Jenkins-Cook
- Vance Inc

**Tenant 102:**
- Holt, Simpson and Bowman
- Green, Smith and Wang
- Rivas LLC
- Ramirez-Olson

**Tenant 103:**
- Chang and Sons
- Gibson Ltd
- Davis, Johnson and Cobb
- Nelson-Shea

**Tenant 104:**
- Lawrence-Medina
- Sutton Inc
- Lopez Group
- Carroll Inc

**Tenant 105:**
- Lucas-Wright
- Carter, Blackburn and Franklin
- Baxter-Dixon
- Gonzalez Group

**Usage:** These store names are used for:
- Demo user switching
- Multi-tenancy demonstration
- Dashboard app filtering (filterValue)

---

## 🔐 Permissions System

**File:** `src/types/user.ts:57-88`

**Hardcoded Permissions:**
- `create_widgets` - Create new widgets in customer's dashboard (private view)
- `create_dashboards` - Create new dashboard (private view)
- `publish_dashboards` - Publish dashboard to all/specific roles/users
- `manage_custom_widgets` - Manage custom widgets (edit/delete)
- `manage_custom_dashboards` - Manage custom dashboards (edit/delete)

**Default Permission Set:** All Store Managers have:
- ✅ `create_widgets`
- ✅ `create_dashboards`
- ❌ `publish_dashboards` (disabled)
- ✅ `manage_custom_widgets`
- ❌ `manage_custom_dashboards` (disabled)

---

## 🎯 Dashboard Filtering

### App Filter Configuration

**Known Dashboards with Filters:**
- `chat-mode-dash` (line `backend/server.js:217`)

**Filter Field Name:** Dynamic (passed from frontend)
- Typically: `store_name` or similar field in your datamart

**Filter Values:** Store names from user data (e.g., "Ramirez Ltd")

**Logic:**
```javascript
// Only apply app filters to dashboards that have filter config
const knownDashboardsWithFilters = ['chat-mode-dash'];
```

**⚠️ IMPORTANT:** 
- Only dashboards in `knownDashboardsWithFilters` will have app filters applied
- Newly created dashboards won't inherit app filter configuration automatically
- To add filters to new dashboards, you need to configure them in DataBrain dashboard settings

---

## 📝 OOTB (Out-of-the-Box) Dashboards

**File:** `src/types/user.ts:483-530`

**Hardcoded Demo Dashboards:**
1. **Overview** - Main overview dashboard with key metrics
2. **Stores** - Store management and monitoring
3. **Analytics** - Store analytics and performance

**Usage:** These represent system dashboards in the demo UI (shown vs custom dashboards)

**Note:** These are mock data for demo purposes and don't affect actual DataBrain API calls

---

## 🚀 Recommended Changes for Production

### 1. Environment Variables for URLs
The template uses `src/lib/config.ts`; override with:

```typescript
// Create a config file
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
```

### 2. Dynamic Dashboard Discovery
Instead of hardcoding `chat-mode-dash`, fetch available dashboards and use the first one or allow user selection.

### 3. Datamart Auto-Selection
The app already tries to auto-fetch datamarts. Ensure this works for your setup.

### 4. Custom User/Tenant Data
Replace the hardcoded users in `src/types/user.ts` with:
- Data fetched from your backend
- Your actual tenant/user structure
- Your permission system

### 5. Known Dashboards with Filters
Update `backend/server.js:217` to include all dashboard IDs that have app filters configured:

```javascript
const knownDashboardsWithFilters = [
  'chat-mode-dash',
  'your-dashboard-id-1',
  'your-dashboard-id-2'
];
```

---

## 📌 Summary: What You Need to Configure

### Required (App won't work without these):
1. ✅ **DATABRAIN_API_KEY** - From your Data App
2. ✅ **DATABRAIN_DATA_APP_NAME** - Your exact Data App name
3. ✅ **Dashboard ID** - Create a dashboard named `chat-mode-dash` OR update all references to match your dashboard ID

### Recommended:
4. **Datamart Name** - Either create "Sales Management Datamart" or let it auto-fetch
5. **User/Tenant Data** - Customize `src/types/user.ts` to match your structure
6. **Store Names** - Update to match your actual store/customer names in your database

### Optional (Works with defaults):
7. API Base URL - Defaults to production
8. Workspace Name - Defaults to "Demo Workspace"
9. Port numbers - Default 3001 (backend) and 5173 (frontend)

---

## 🔍 Quick Search Commands

To find all instances of a specific hardcoded value:

```bash
# Find dashboard ID references
grep -r "chat-mode-dash" .

# Find datamart references
grep -r "Sales Management" .

# Find localhost URLs
grep -r "localhost:3002" .

# Find tenant/client IDs
grep -r "clientId: '10" .
```

---

**Last Updated:** $(date)
**Demo Version:** 1.0.0

