# DataBrain React Demo - Customizability Showcase

A comprehensive React application demonstrating DataBrain's advanced customizability features through a realistic A360 (Automation 360) scenario. This demo showcases permission-based UI, custom widget creation, dashboard publishing, and user role management.

## 🌟 New Demo Features

### 👥 User Personas & Permissions
- **Michael Thompson** (Process Owner) & **Jake Rodriguez** (Automation Admin)
- **User Switching** - Easy persona switching for demos
- **Permission Gates** - UI elements appear/disappear based on user permissions

### 🎨 Custom Widget Creation
- **Multi-step Wizard** - Data selection → Chart type → Configuration → Preview
- **10+ Chart Types** - Bar, Line, Pie, Gauge, KPI, Heatmap, and more
- **Privacy by Default** - Widgets are private until dashboard is published

### 📊 Dashboard Management  
- **Save As Feature** - Create dashboard copies (e.g., "Overview_Finance")
- **Publishing System** - Publish to All users, Specific roles, or Specific users
- **OOTB Protection** - System dashboards protected, custom ones manageable

### 🔐 Security & Governance
- **Role-based Access Control** - Granular permissions per user
- **Content Separation** - Clear OOTB vs custom content distinction
- **Data Access Control** - Users only see permitted data sources

## 📖 Demo Guide
See [DEMO_GUIDE.md](./DEMO_GUIDE.md) for complete demo script and usage instructions.

## 🚀 Quick Start

### 1. Install Dependencies

**Frontend (React app):**
```bash
npm install
```

**Backend (Node.js server):**
```bash
cd backend
npm install
```

### 2. Configure DataBrain API Token

Set your DataBrain API token as an environment variable:

```bash
export DATABRAIN_API_TOKEN=your-actual-api-token-here
```

### 3. Start the Backend Server

```bash
cd backend
npm start
```

### 4. Start the React App

In a new terminal:
```bash
npm run dev
```

## 🔧 How It Works

### Backend Generation (Recommended)
1. **Dashboard Request**: User enters client ID and dashboard ID from their DataBrain app
2. **Backend Token Generation**: Backend generates guest token using the provided client ID
3. **Dashboard Display**: React app displays dashboard with generated token

### Manual Entry (Testing)
- Manual entry of guest token, client ID, and dashboard ID
- Use the provided shell scripts to generate test tokens

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │  Node.js API    │    │  DataBrain API  │
│  (Frontend)     │───▶│   (Backend)     │───▶│   (External)    │
│                 │    │                 │    │                 │
│ - Dashboard UI  │    │ - Token Gen     │    │ - Guest Tokens  │
│ - Config Forms  │    │ - API Calls     │    │ - Dashboards    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔐 Security Features

- **No Frontend API Tokens**: API tokens never exposed to frontend
- **Unique Client IDs**: Generated per request
- **CORS Protection**: Backend properly configured for security
- **Error Handling**: Comprehensive error handling and logging

## 📁 Project Structure

```
dbn-demo-react/
├── src/
│   ├── App.tsx          # React app with dual mode support
│   ├── App.css          # Professional styling
│   └── main.tsx         # React entry point
├── backend/
│   ├── server.js        # Express server with guest token API
│   └── package.json     # Backend dependencies
├── public/
├── package.json         # Frontend dependencies
└── README.md           # This file
```

## 🛠️ Backend API Endpoints

### `POST /api/guest-token`
Generates guest tokens for dashboard access using your DataBrain client ID.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "clientId": "your-databrain-client-id",
  "dashboardId": "your-dashboard-id"
}
```

**Response:**
```json
{
  "guestToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "clientId": "your-databrain-client-id",
  "dashboardId": "your-dashboard-id"
}
```

## 🧪 Testing with Shell Scripts

For manual entry testing, use the provided scripts:

```bash
# Interactive script
./generate_guest_token.sh

# Quick command-line script  
./quick_token.sh YOUR_API_TOKEN YOUR_CLIENT_ID
```

## 🔧 Configuration

### Environment Variables

- `DATABRAIN_API_TOKEN`: Your DataBrain API token (required)
- `PORT`: Backend server port (default: 3001)

### DataBrain Setup

1. Get your API token from DataBrain dashboard
2. Create a data app in DataBrain
3. Get your client ID from your DataBrain app configuration
4. Get your dashboard ID (embed ID)
5. Configure the `data_app_name` in `backend/server.js`

## 🚨 Troubleshooting

**Backend Issues:**
- **"API Token: ❌ Not configured"**: Set the `DATABRAIN_API_TOKEN` environment variable
- **"Failed to connect to backend"**: Make sure backend is running on port 3001
- **"INVALID_REQUEST_BODY"**: Check that `data_app_name` matches your DataBrain setup

**Frontend Issues:**
- **"INVALID_TOKEN"**: Token may be expired or invalid
- **Dashboard not loading**: Check browser console for detailed errors

## 📚 Next Steps

1. **Production Deployment**: 
   - Add authentication (JWT, OAuth, etc.)
   - Add database for user management
   - Implement proper session management
   - Add HTTPS and security headers

2. **Enhanced Features**:
   - Token caching for performance
   - User permission checks
   - Dashboard access controls
   - Audit logging

3. **Scale Considerations**:
   - Rate limiting on token generation
   - Load balancing for multiple backend instances
   - Redis for session storage
   - Database connection pooling

## 🔗 Resources

- [DataBrain Documentation](https://docs.usedatabrain.com)
- [Official Embedding Guide](https://docs.usedatabrain.com/developer-docs/how-to-embed)
- [DataBrain Plugin NPM](https://www.npmjs.com/package/@databrainhq/plugin)
- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)

---

**Note:** This is a demo application. For production use, implement proper authentication, error handling, and security measures according to your requirements. 