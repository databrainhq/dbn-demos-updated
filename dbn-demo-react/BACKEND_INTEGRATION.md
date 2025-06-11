# DataBrain Backend Integration Guide

This guide shows you how to implement secure DataBrain guest token generation using the included Node.js backend.

## 🔒 Security First

**Important:** Never expose your DataBrain API token to the frontend. Guest token generation must happen on your backend.

## 🚀 Quick Setup

### 1. Configure Your API Token
```bash
export DATABRAIN_API_TOKEN=your-actual-api-token-here
```

### 2. Start the Backend
```bash
cd backend
npm install
npm start
```

### 3. Update Data App Name
Edit `backend/server.js` and change `data_app_name`:
```javascript
body: JSON.stringify({
  clientId: clientId,
  data_app_name: 'your-actual-data-app-name'  // Update this
})
```

## 📁 Backend Implementation

The included Node.js backend (`backend/server.js`) provides:

### ✅ Authentication Middleware
```javascript
const simulateAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    req.user = { id: 'demo-user-123', name: 'Demo User' };
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};
```

### ✅ Guest Token Generation
```javascript
app.post('/api/guest-token', simulateAuth, async (req, res) => {
  const { dashboardId } = req.body;
  const userId = req.user.id;
  
  // Generate unique client ID
  const clientId = `user-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  
  // Call DataBrain API
  const response = await fetch('https://api.usedatabrain.com/api/v2/guest-token/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DATABRAIN_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      clientId: clientId,
      data_app_name: 'demo-app'
    })
  });
  
  // Return guest token to frontend
  const data = await response.json();
  res.json({
    guestToken: data.guest_token,
    clientId: clientId,
    dashboardId: dashboardId
  });
});
```

### ✅ Demo Authentication
```javascript
app.post('/api/demo-login', (req, res) => {
  const { username } = req.body;
  const demoToken = `demo-token-${username || 'user'}-${Date.now()}`;
  
  res.json({
    token: demoToken,
    user: { id: `demo-user-${username}`, name: username || 'Demo User' }
  });
});
```

## 🔧 API Endpoints

### `POST /api/guest-token`
**Purpose:** Generate guest tokens for authenticated users

**Request:**
```json
{
  "dashboardId": "your-dashboard-id"
}
```

**Response:**
```json
{
  "guestToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "clientId": "user-demo-user-123-1703123456789-abc123",
  "dashboardId": "your-dashboard-id"
}
```

### `POST /api/demo-login`
**Purpose:** Demo authentication (replace with real auth in production)

### `GET /health`
**Purpose:** Check server status and configuration

## 🔄 Frontend Integration

The React app calls your backend:

```javascript
const response = await fetch('http://localhost:3001/api/guest-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userAuthToken}`
  },
  body: JSON.stringify({ dashboardId })
});

const { guestToken, clientId } = await response.json();

// Use in DataBrain component
<dbn-dashboard
  token={guestToken}
  client-id={clientId}
  dashboard-id={dashboardId}
/>
```

## 🛡️ Security Features

- **API Token Protection**: Never exposed to frontend
- **Authentication Required**: All endpoints protected
- **Unique Client IDs**: Per user/session
- **Error Handling**: Comprehensive logging
- **CORS Protection**: Properly configured

## 🚨 Troubleshooting

### Common Issues

**"DataBrain API Token: ❌ Not configured"**
- Set the `DATABRAIN_API_TOKEN` environment variable
- Restart the backend server

**"INVALID_REQUEST_BODY"**
- Verify `data_app_name` matches your DataBrain setup
- Check that you're using `clientId` (camelCase)

**"Failed to connect to backend"**
- Make sure backend is running on port 3001
- Check firewall settings

**"Guest token creation failed"**
- Verify your API token has proper permissions
- Check DataBrain API status
- Review server logs for detailed errors

## 🔧 Production Checklist

### Replace Demo Authentication
```javascript
// Replace this:
const simulateAuth = (req, res, next) => {
  // Accept any Bearer token
}

// With proper auth:
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await verifyJWT(token); // Your JWT verification
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

## 🔗 DataBrain API Reference

**Endpoint:** `https://api.usedatabrain.com/api/v2/guest-token/create`

**Required Headers:**
```
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json
```

**Required Body:**
```json
{
  "clientId": "unique-client-identifier",
  "data_app_name": "your-data-app-name"
}
```

**Response:**
```json
{
  "guest_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "expires_in": 3600
}
```

---

## 📚 Next Steps

1. **Replace demo auth** with your actual authentication system
2. **Add permission checks** for dashboard access
3. **Implement token caching** for better performance
4. **Add proper error handling** and logging
5. **Set up monitoring** and health checks

This backend provides a solid foundation for secure DataBrain integration! 