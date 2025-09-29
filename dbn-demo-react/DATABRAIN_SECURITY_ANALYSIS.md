# 🔒 DataBrain Frontend Authorization Security Analysis

## Executive Summary

This document analyzes the client's security requirements for DataBrain integration and provides implementation recommendations to ensure guest tokens are never exposed to the frontend while maintaining full DataBrain functionality.

**Key Finding:** DataBrain's current web component architecture requires guest tokens in the frontend, which conflicts with the client's security requirements. Custom solutions are needed to achieve compliance.

---

## 🎯 Client Requirements

### Security Mandate
> "A360 users and thus the security of their data and session is ultimately our AAI responsibility, and therefore 3rd party tokens that access user data cannot be exposed to front end clients."

### Specific Requirements
1. **No Token Exposure:** Guest tokens must never be exposed to the frontend
2. **Backend Control:** All 3rd party tokens must be controlled by AAI backend
3. **API Proxying:** DataBrain API requests must be routed through AAI backend
4. **Maintain Functionality:** Continue using DataBrain's frontend packages for rendering

---

## 🔍 Current Implementation Analysis

### ✅ Security Strengths
- **Backend Token Generation:** Guest tokens are created on the backend via `/api/dashboard-guest-token`
- **API Key Protection:** DataBrain API keys are stored securely on the backend
- **Authentication Layer:** Backend endpoints require proper authentication

### ❌ Critical Security Gap
- **Frontend Token Exposure:** Guest tokens are currently passed to React components
- **Direct API Calls:** DataBrain web components make direct API calls using exposed tokens

```typescript
// CURRENT SECURITY ISSUE
const [token, setToken] = useState('');
// Token is fetched from backend but then exposed in frontend
setToken(data.guestToken); 

// DataBrain component receives token in frontend
<dbn-dashboard token={token} dashboard-id={dashboardId} />
```

---

## 🏗️ DataBrain Architecture Limitation

### The Core Problem
DataBrain's web components (`<dbn-dashboard>`, `<dbn-metric>`) are architecturally designed to:
1. Receive guest tokens as props in the frontend
2. Make direct HTTP requests to DataBrain APIs using these tokens
3. Handle authentication and data fetching internally

```typescript
// DataBrain's intended usage pattern
window.dbn.baseUrl = "https://api.usedatabrain.com";
<dbn-dashboard token={guestToken} dashboard-id={dashboardId} />
```

### Why Standard Proxying Won't Work
- DataBrain components are pre-built web components with internal API logic
- No configuration options exist to route requests through custom backends
- Components expect direct access to DataBrain APIs with valid tokens

---

## 🛡️ Recommended Security Solutions

### **Option 1: Custom Component Wrapper (RECOMMENDED)**

Replace DataBrain web components with custom secure components that fetch data through your backend.

#### Architecture
```
Frontend (No Tokens) → AAI Backend (With Tokens) → DataBrain APIs → Response Data → Frontend
```

#### Implementation

**1. Secure Backend Endpoints**
```javascript
// /api/secure-dashboard-data
app.post('/api/secure-dashboard-data', authenticateUser, async (req, res) => {
  const { dashboardId, clientId } = req.body;
  
  // Generate/retrieve guest token (never exposed)
  const guestToken = await generateGuestToken(clientId);
  
  // Fetch dashboard data from DataBrain
  const dashboardData = await fetch(`${DATABRAIN_API_BASE_URL}/api/dashboard/data`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${guestToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ dashboardId })
  });
  
  const data = await dashboardData.json();
  
  // Return processed data (no tokens)
  res.json({
    success: true,
    dashboardData: data,
    // Token never included in response
  });
});
```

**2. Custom Secure Frontend Components**
```typescript
// SecureDashboard.tsx
const SecureDashboard = ({ dashboardId, clientId }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSecureDashboardData = async () => {
      try {
        // Call YOUR backend with user's JWT token
        const response = await fetch('/api/secure-dashboard-data', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userJWT}`, // Your auth token
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ dashboardId, clientId })
        });
        
        const data = await response.json();
        setDashboardData(data.dashboardData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSecureDashboardData();
  }, [dashboardId, clientId]);
  
  if (loading) return <DashboardSkeleton />;
  
  return (
    <CustomDashboardRenderer 
      data={dashboardData}
      config={{ theme: 'corporate', responsive: true }}
    />
  );
};
```

**3. Custom Visualization Components**
```typescript
// CustomDashboardRenderer.tsx
const CustomDashboardRenderer = ({ data, config }) => {
  return (
    <div className="secure-dashboard">
      {data.metrics?.map(metric => (
        <MetricCard 
          key={metric.id}
          title={metric.name}
          value={metric.value}
          chart={<Chart data={metric.chartData} type={metric.chartType} />}
        />
      ))}
      {data.charts?.map(chart => (
        <ChartContainer key={chart.id}>
          <Chart data={chart.data} type={chart.type} config={config} />
        </ChartContainer>
      ))}
    </div>
  );
};
```

### **Option 2: API Gateway Proxy**

Implement a comprehensive proxy that intercepts DataBrain API calls.

```javascript
// Proxy middleware for DataBrain APIs
app.use('/api/databrain-proxy/*', authenticateUser, async (req, res) => {
  try {
    // Extract user context from your JWT
    const { clientId } = req.user;
    
    // Generate guest token for this user
    const guestToken = await getOrGenerateGuestToken(clientId);
    
    // Forward request to DataBrain with injected token
    const targetUrl = req.originalUrl.replace('/api/databrain-proxy', '');
    const response = await fetch(`${DATABRAIN_API_BASE_URL}${targetUrl}`, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${guestToken}`,
        'Content-Type': 'application/json',
        // Remove client's auth header
        ...Object.fromEntries(
          Object.entries(req.headers).filter(([key]) => key !== 'authorization')
        )
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy request failed' });
  }
});
```

Then configure DataBrain to use your proxy:
```typescript
// Configure DataBrain to use your secure proxy
window.dbn.baseUrl = "https://your-aai-backend.com/api/databrain-proxy";
```

### **Option 3: Server-Side Rendering**

Render DataBrain components on the server and send HTML to frontend.

```javascript
app.get('/api/dashboard-html/:dashboardId', authenticateUser, async (req, res) => {
  const guestToken = await generateGuestToken(req.user.clientId);
  
  // Use DataBrain's server-side rendering (if available)
  const dashboardHtml = await renderDataBrainDashboard({
    token: guestToken,
    dashboardId: req.params.dashboardId,
    theme: 'corporate'
  });
  
  res.json({ 
    html: dashboardHtml,
    // No token in response
  });
});
```

---

## 📊 Solution Comparison

| Aspect | Custom Wrapper | API Proxy | Server-Side |
|--------|---------------|-----------|-------------|
| **Security** | ✅ Excellent | ✅ Good | ✅ Excellent |
| **Development Effort** | 🔶 High | 🔶 Medium | 🔴 Very High |
| **Maintenance** | 🔶 Medium | ✅ Low | 🔴 High |
| **Performance** | ✅ Good | 🔶 Medium | 🔶 Medium |
| **Flexibility** | ✅ Excellent | 🔶 Limited | 🔶 Limited |
| **DataBrain Features** | 🔶 Custom Implementation | ✅ Full Support | ✅ Full Support |

---

## 🎯 Recommended Implementation Plan

### **Phase 1: Enhanced Backend (1-2 weeks)**
1. **Extend existing token management**
   - Add token caching/session management
   - Implement automatic token refresh
   - Add comprehensive logging

2. **Create secure data endpoints**
   - `/api/secure-dashboard-data`
   - `/api/secure-metric-data` 
   - `/api/secure-dashboard-list`
   - `/api/secure-dashboard-create`

3. **Implement proper authentication**
   - Validate JWT tokens on all endpoints
   - Add role-based access control
   - Implement audit logging

### **Phase 2: Custom Frontend Components (2-3 weeks)**
1. **Replace DataBrain components**
   - `<SecureDashboard>` replaces `<dbn-dashboard>`
   - `<SecureMetric>` replaces `<dbn-metric>`
   - `<SecureDashboardList>` for dashboard selection

2. **Implement visualization layer**
   - Choose visualization library (Chart.js, D3, Recharts)
   - Create reusable chart components
   - Implement responsive design

3. **Add loading and error states**
   - Skeleton loaders for better UX
   - Error boundaries and retry logic
   - Offline support considerations

### **Phase 3: Testing & Validation (1 week)**
1. **Security testing**
   - Verify no tokens in frontend
   - Test authentication flows
   - Validate data access controls

2. **Functionality testing**
   - Compare with original DataBrain features
   - Test all dashboard interactions
   - Validate data accuracy

---

## 🔧 Implementation Code Examples

### Backend Token Management
```javascript
// Enhanced token management with caching
class SecureTokenManager {
  constructor() {
    this.tokenCache = new Map();
    this.tokenExpiry = new Map();
  }
  
  async getGuestToken(clientId) {
    // Check cache first
    if (this.isTokenValid(clientId)) {
      return this.tokenCache.get(clientId);
    }
    
    // Generate new token
    const token = await this.generateNewGuestToken(clientId);
    
    // Cache with expiry
    this.tokenCache.set(clientId, token);
    this.tokenExpiry.set(clientId, Date.now() + (55 * 60 * 1000)); // 55 min
    
    return token;
  }
  
  isTokenValid(clientId) {
    return this.tokenCache.has(clientId) && 
           this.tokenExpiry.get(clientId) > Date.now();
  }
  
  async generateNewGuestToken(clientId) {
    const response = await fetch(`${DATABRAIN_API_BASE_URL}/api/v2/guest-token/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DATABRAIN_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId,
        dataAppName: DATA_APP_NAME
      })
    });
    
    const data = await response.json();
    return data.token || data.guest_token;
  }
}
```

### Frontend Component Integration
```typescript
// App.tsx - Updated to use secure components
function App() {
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]);
  const [currentDashboardId, setCurrentDashboardId] = useState('dbn-demo');
  
  // No token state needed - handled securely in backend
  
  return (
    <div className="app">
      <UserSwitcher 
        currentUser={currentUser} 
        onUserChange={setCurrentUser} 
      />
      
      {/* Secure component - no tokens exposed */}
      <SecureDashboard 
        dashboardId={currentDashboardId}
        clientId={currentUser.clientId}
        customerId={currentUser.customerId}
      />
    </div>
  );
}
```

---

## 🚨 Security Considerations

### Data Protection
- **Encryption in Transit:** All API calls use HTTPS
- **Authentication:** JWT tokens for user authentication
- **Authorization:** Role-based access control
- **Audit Logging:** Track all data access and modifications

### Token Security
- **Backend-Only Storage:** Guest tokens never leave the server
- **Automatic Expiry:** Tokens refresh automatically before expiration
- **Session Management:** Tokens tied to user sessions
- **Revocation:** Ability to invalidate tokens immediately

### Compliance
- **Zero Frontend Token Exposure:** Meets AAI security requirements
- **Data Sovereignty:** Full control over user data access
- **Audit Trail:** Complete logging of all data operations
- **Access Controls:** Granular permissions per user/role

---

## 📈 Migration Strategy

### Gradual Migration Approach
1. **Parallel Implementation:** Build secure components alongside existing ones
2. **Feature Parity Testing:** Ensure all DataBrain features work in secure mode
3. **User Acceptance Testing:** Validate UX matches or improves upon current experience
4. **Gradual Rollout:** Deploy to subset of users first
5. **Full Migration:** Replace all DataBrain components once validated

### Rollback Plan
- Keep existing DataBrain integration as fallback
- Feature flags to switch between secure and legacy modes
- Database migrations are reversible
- Quick rollback procedure documented

---

## 🎯 Success Metrics

### Security Compliance
- ✅ Zero guest tokens in frontend code
- ✅ All API calls routed through AAI backend
- ✅ Complete audit trail of data access
- ✅ Successful security penetration testing

### Functionality Preservation
- ✅ All dashboard features working
- ✅ Performance matches or exceeds current implementation
- ✅ User experience maintained or improved
- ✅ Mobile responsiveness preserved

### Operational Excellence
- ✅ Monitoring and alerting in place
- ✅ Error handling and recovery procedures
- ✅ Documentation and runbooks complete
- ✅ Team training completed

---

## 📞 Next Steps

1. **Stakeholder Review:** Present this analysis to security and development teams
2. **Architecture Approval:** Get approval for recommended approach
3. **Resource Planning:** Allocate development resources for 4-6 week project
4. **Proof of Concept:** Build minimal viable secure component
5. **Implementation:** Execute phased migration plan

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Author:** Development Team  
**Reviewed By:** Security Team, Architecture Team


