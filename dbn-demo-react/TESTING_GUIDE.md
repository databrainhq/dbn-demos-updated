# Testing Guide: Dashboard Privacy Feature

This guide provides step-by-step instructions for testing all three use cases of the dashboard privacy feature.

## Prerequisites

1. **Backend running:** `cd backend && node server.js`
2. **Frontend running:** `npm run dev`
3. **DataBrain credentials configured:** See [CONFIGURATION.md](./CONFIGURATION.md)
4. **Browser open:** Navigate to `http://localhost:5173`

---

## Test Use Case 1: Add Metrics to Existing Dashboard

### Objective
Verify that users can create and add metrics to any dashboard they have access to.

### Test Steps

1. **Open the application** at `http://localhost:5173`

2. **Login** with default user (or any user)
   - User: "John Smith" (Store Manager)
   - Tenant: "101" (Acme Corp)

3. **Navigate to Analytics** tab

4. **Select a dashboard** (e.g., "chat-mode-dash" or any existing dashboard)

5. **Create a metric:**
   - Look for "+ Add Metric" or metric creation button (if available in DataBrain embed)
   - Create a simple metric (e.g., "Total Sales")
   - Save the metric

6. **Switch to another user** in the same tenant:
   - Click "User Switcher"
   - Select different user (e.g., "Jane Doe")

7. **Verify the metric is visible** to the new user
   - Navigate to the same dashboard
   - ✅ **Expected Result:** The metric created by John Smith should be visible to Jane Doe

### Success Criteria

- ✅ Users can create metrics on dashboards
- ✅ Metrics are visible to all users in the tenant
- ✅ Metric creation is enabled via `isAllowMetricCreation: true`

### Troubleshooting

- **Can't create metrics?** 
  - Check `isAllowMetricCreation: true` in dashboard access settings
  - Verify `metricCreationMode: 'DRAG_DROP'` is set

- **Metrics not visible to other users?**
  - Check `isAllowPrivateMetricsByDefault: false` for public dashboards
  - Verify users are in the same tenant

---

## Test Use Case 2: Create Shared Dashboard (Tenant-Wide)

### Objective
Verify that users can create dashboards visible to all users in their tenant.

### Test Steps

1. **Login** with a specific user:
   - User: "John Smith"
   - Tenant: "101" (Acme Corp)

2. **Create a new dashboard:**
   - Click "Analytics" tab
   - Click "+ Create New" tab
   - Enter dashboard name: "Q4 Sales Report"
   - Enter description: "Shared with entire Acme Corp team"
   - **IMPORTANT:** Leave "Make this dashboard private" **UNCHECKED** ☐
   - Click "Create Dashboard"

3. **Verify dashboard created successfully:**
   - ✅ Should see success message
   - ✅ Dashboard should appear in tabs
   - ✅ Dashboard should NOT have a "🔒 Private" badge

4. **Switch to another user** in the SAME tenant:
   - Click "User Switcher"
   - Select "Jane Doe" (same tenant: 101)
   - Stay on "Analytics" tab

5. **Verify dashboard is visible:**
   - ✅ **Expected Result:** "Q4 Sales Report" should be visible in the dashboard tabs
   - ✅ Jane Doe can view and interact with the dashboard
   - ✅ No privacy badge shown

6. **Switch to a user in a DIFFERENT tenant:**
   - Click "Tenant Switcher"
   - Select "102" (Beta Industries)
   - Navigate to "Analytics" tab

7. **Verify dashboard is NOT visible:**
   - ✅ **Expected Result:** "Q4 Sales Report" should NOT appear
   - ✅ Only dashboards for tenant 102 should be visible

### Success Criteria

- ✅ Dashboard created without privacy flag
- ✅ Dashboard visible to all users in tenant 101
- ✅ Dashboard NOT visible to users in tenant 102
- ✅ No "🔒 Private" badge displayed
- ✅ Backend set `isAllowPrivateMetricsByDefault: false`
- ✅ Metadata includes `visibility: 'tenant'`

### Backend Verification

Check backend console logs for:
```json
{
  "isAllowPrivateMetricsByDefault": false,
  "metadata": {
    "visibility": "tenant",
    "isPrivate": false
  }
}
```

### Troubleshooting

- **Dashboard visible to wrong tenant?**
  - Check `clientId` filtering in backend
  - Verify DataBrain multi-tenancy configuration

- **Dashboard not visible to same-tenant users?**
  - Verify `isPrivate: false` in metadata
  - Check `visibility: 'tenant'` in metadata

---

## Test Use Case 3: Create Private Dashboard

### Objective
Verify that users can create private dashboards visible ONLY to themselves.

### Test Steps

1. **Login** with a specific user:
   - User: "John Smith"
   - Tenant: "101" (Acme Corp)

2. **Create a private dashboard:**
   - Click "Analytics" tab
   - Click "+ Create New" tab
   - Enter dashboard name: "My Personal Sales Dashboard"
   - Enter description: "Private dashboard for my eyes only"
   - **IMPORTANT:** CHECK "Make this dashboard private" ☑
   - Read help text: "Private dashboards are only visible to you..."
   - Click "Create Dashboard"

3. **Verify dashboard created with privacy:**
   - ✅ Should see success message: "Dashboard created successfully (private)"
   - ✅ Dashboard should appear in tabs
   - ✅ Dashboard should have a "🔒 Private" badge

4. **Add metrics to private dashboard:**
   - Select the private dashboard
   - Create a metric (e.g., "My Sales Target")
   - ✅ Metric should be created successfully

5. **Switch to another user** in the SAME tenant:
   - Click "User Switcher"
   - Select "Jane Doe" (same tenant: 101)
   - Navigate to "Analytics" tab

6. **Verify private dashboard is NOT visible:**
   - ✅ **Expected Result:** "My Personal Sales Dashboard" should NOT appear in tabs
   - ✅ Jane Doe should only see her own private dashboards (if any) and shared dashboards

7. **Switch back to the original creator:**
   - Click "User Switcher"
   - Select "John Smith"
   - Navigate to "Analytics" tab

8. **Verify dashboard is still visible and private:**
   - ✅ **Expected Result:** "My Personal Sales Dashboard" appears with "🔒 Private" badge
   - ✅ Dashboard is still accessible
   - ✅ Metrics are still there

9. **Test with different user creating their own private dashboard:**
   - Switch to "Jane Doe"
   - Create a new private dashboard: "Jane's Private Analytics"
   - ✅ Jane should see her private dashboard
   - Switch back to "John Smith"
   - ✅ John should NOT see Jane's private dashboard
   - ✅ John should still see his own private dashboard

### Success Criteria

- ✅ Privacy checkbox visible and functional
- ✅ Help text explains privacy clearly
- ✅ Dashboard created with privacy flag
- ✅ "🔒 Private" badge displayed on tab
- ✅ Dashboard visible ONLY to creator
- ✅ Dashboard NOT visible to other users (same tenant)
- ✅ Dashboard NOT visible to other users (different tenant)
- ✅ Backend set `isAllowPrivateMetricsByDefault: true`
- ✅ Metadata includes `visibility: 'private'`, `isPrivate: true`, `creatorId`
- ✅ Privacy filtering works correctly

### Backend Verification

Check backend console logs for:
```json
{
  "isAllowPrivateMetricsByDefault": true,
  "metadata": {
    "visibility": "private",
    "isPrivate": true,
    "creatorId": "Ramirez Ltd"
  }
}
```

### Privacy Filtering Verification

Check browser console for filtering logic:
1. Open DevTools (F12)
2. Navigate to Console
3. Look for dashboard filtering logs
4. Verify `filterDashboardsByPrivacy` function is called
5. Check that `creatorId` matches current user's `storeName`

### Troubleshooting

- **Private dashboard visible to wrong users?**
  - Check `isPrivate: true` in metadata
  - Verify `creatorId` matches creator's `storeName` or `id`
  - Ensure `currentUser` prop is passed to `DashboardSelector`

- **Private badge not showing?**
  - Check `metadata.isPrivate` or `metadata.visibility === 'private'`
  - Verify Badge component is imported in App.tsx

- **Can't create private dashboard?**
  - Check privacy checkbox is rendering
  - Verify `isPrivate` field is in form state
  - Check backend accepts `isPrivate` parameter

---

## Complete Test Matrix

| Test Case | User | Tenant | Action | Expected Result | Status |
|-----------|------|--------|--------|-----------------|--------|
| **1.1** | Store Manager 1 | 101 | Create metric on shared dashboard | ✅ Metric added | Ready to test |
| **1.2** | Store Manager 2 | 101 | View same dashboard | ✅ Sees the metric | Ready to test |
| **2.1** | John Smith | 101 | Create shared dashboard (unchecked) | ✅ Dashboard created | Ready to test |
| **2.2** | Jane Doe | 101 | View dashboards | ✅ Sees John's shared dashboard | Ready to test |
| **2.3** | User from Tenant 102 | 102 | View dashboards | ✅ Does NOT see John's dashboard | Ready to test |
| **3.1** | John Smith | 101 | Create private dashboard (checked) | ✅ Dashboard created with 🔒 badge | Ready to test |
| **3.2** | Jane Doe | 101 | View dashboards | ✅ Does NOT see John's private dashboard | Ready to test |
| **3.3** | John Smith | 101 | Switch back to view | ✅ Still sees own private dashboard | Ready to test |
| **3.4** | Jane Doe | 101 | Create own private dashboard | ✅ Dashboard created | Ready to test |
| **3.5** | John Smith | 101 | View dashboards | ✅ Does NOT see Jane's private dashboard | Ready to test |

---

## Regression Testing

After implementing privacy feature, verify existing functionality still works:

### Checklist

- ☑ **User switching** still works correctly
- ☑ **Tenant switching** still works correctly
- ☑ **Dashboard loading** still works for OOTB dashboards
- ☑ **Token generation** still works
- ☑ **Multi-tenancy** filtering still works
- ☑ **Settings UI** still works
- ☑ **Reports page** still works
- ☑ **Dashboard embedding** still renders correctly

---

## Code Review Checklist

### Frontend Changes

- ☑ `CreateDashboard.tsx`: Privacy checkbox added
- ☑ `CreateDashboard.tsx`: Form state includes `isPrivate`
- ☑ `CreateDashboard.tsx`: Request payload includes `isPrivate`
- ☑ `DashboardSelector.tsx`: Privacy filtering logic added
- ☑ `DashboardSelector.tsx`: `currentUser` prop accepted
- ☑ `App.tsx`: `currentUser` prop passed to DashboardSelector
- ☑ `App.tsx`: Privacy badge shown on dashboard tabs

### Backend Changes

- ☑ `server.js`: Accepts `isPrivate` parameter
- ☑ `server.js`: Sets `isAllowPrivateMetricsByDefault` based on `isPrivate`
- ☑ `server.js`: Stores privacy metadata (`isPrivate`, `visibility`, `creatorId`)
- ☑ `server.js`: Returns privacy info in response

### Documentation

- ☑ `PRIVACY_FEATURE.md`: Complete technical documentation
- ☑ `USE_CASES_ANALYSIS.md`: Updated with implementation status
- ☑ `SUMMARY.md`: Updated with new documentation links
- ☑ `TESTING_GUIDE.md`: This file - comprehensive test guide

---

## Known Limitations

### Current Implementation

1. **UI-Level Filtering Only**: Privacy filtering happens in the frontend. For production, implement server-side filtering.

2. **No Sharing Controls**: Private dashboards cannot be shared with specific users. Future enhancement.

3. **No Bulk Updates**: Cannot change dashboard privacy after creation. Future enhancement.

4. **Creator Identification**: Uses `storeName` for creator matching. May need refinement for complex user systems.

### Future Enhancements

See [PRIVACY_FEATURE.md § Future Enhancements](./docs/PRIVACY_FEATURE.md#future-enhancements) for planned improvements.

---

## Performance Considerations

### Current Load

- Dashboard filtering happens on every render
- Filter function runs on `embeds` array (typically < 20 dashboards)
- Performance impact: Negligible for demo purposes

### Production Recommendations

For production with 100+ dashboards per tenant:
1. Move filtering to backend API
2. Add pagination for dashboard lists
3. Cache filtered results
4. Add loading states for large lists

---

## Security Notes

### Multi-Tenancy

- ✅ `clientId` filtering at DataBrain API level
- ✅ Backend validates tenant access
- ✅ Frontend shows only tenant-specific dashboards

### Private Dashboard Access

- ✅ Creator identifier stored in metadata
- ✅ UI filters based on `creatorId` match
- ⚠️ Backend should also validate access (future enhancement)

### Token Security

- ✅ Guest tokens generated per user/tenant
- ✅ Tokens expire after configured duration
- ✅ Backend never exposes DataBrain API key

---

## Testing Complete Confirmation

After completing all tests above, you should have verified:

- ✅ **Use Case 1**: Users can create metrics on dashboards
- ✅ **Use Case 2**: Users can create tenant-wide shared dashboards
- ✅ **Use Case 3**: Users can create private dashboards
- ✅ **Privacy filtering**: Works correctly for all scenarios
- ✅ **Visual indicators**: Privacy badges display correctly
- ✅ **Multi-tenancy**: Tenant isolation still works
- ✅ **User switching**: Privacy follows the logged-in user

---

## Next Steps

After testing:

1. **If all tests pass:**
   - ✅ Feature is ready for demo
   - ✅ Document any observations in issue tracker
   - ✅ Prepare demo script for clients

2. **If tests fail:**
   - ❌ Document the failure scenario
   - ❌ Check browser console for errors
   - ❌ Check backend logs for errors
   - ❌ Review [PRIVACY_FEATURE.md § Troubleshooting](./docs/PRIVACY_FEATURE.md#troubleshooting)
   - ❌ File bugs with reproduction steps

---

## Automated Testing (Future)

For production deployment, consider adding:

- **Unit tests** for privacy filtering logic
- **Integration tests** for dashboard creation
- **E2E tests** with Playwright/Cypress
- **API tests** for backend endpoints

See `docs/DEVELOPER.md` for customization guidance.

---

**Last Updated:** November 7, 2024  
**Version:** 1.0  
**Status:** Ready for testing

Happy testing! 🚀

