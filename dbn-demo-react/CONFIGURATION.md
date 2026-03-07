# Configuration Checklist

Quick checklist to get the DataBrain React Demo running.

---

## ✅ Required Setup (Must Complete)

### 1️⃣ DataBrain Account Setup

**Before running this demo, set up your DataBrain environment:**

- [ ] **Sign up** for DataBrain at [app.usedatabrain.com](https://app.usedatabrain.com/)
- [ ] **Create a Workspace** and connect your data source
- [ ] **Create a Dashboard** with some visualizations
- [ ] **Create a Data App** (this generates your API token)
  - Go to: Data → Data Apps → New Data App
  - Add your dashboard to the Data App
  - Copy the **API Token** (starts with `dbn_live_...`)
  - Note your **Data App Name** (case-sensitive!)

**Need detailed instructions?** See the [DataBrain Production-Ready Embedding Guide](https://docs.usedatabrain.com/developer-docs/embedding-setup/step-by-step-guide)

---

### 2️⃣ Install Dependencies

- [ ] **Node.js v16+** is installed ([download](https://nodejs.org/))
- [ ] Run the setup script:
  ```bash
  chmod +x setup.sh
  ./setup.sh
  ```

---

### 3️⃣ Configure Environment Variables

- [ ] Create `backend/.env` from the template:
  ```bash
  cp backend/env.example backend/.env
  ```

- [ ] Edit `backend/.env` and set these **required** values:
  ```bash
  DATABRAIN_API_KEY=your-api-token-from-data-app
  DATABRAIN_DATA_APP_NAME=your-data-app-name
  ```

**⚠️ Important:** 
- API Token comes from your **Data App**, not from Settings
- Data App Name must match **exactly** (case-sensitive)
- Never commit the `.env` file to git

---

### 4️⃣ Dashboard Configuration

**The demo expects a dashboard with ID:** `chat-mode-dash`

**Choose one option:**

**Option A: Create Dashboard with This ID** (Recommended)
1. In DataBrain, create a dashboard
2. Set the Dashboard ID to: `chat-mode-dash`
3. Add it to your Data App

**Option B: Use Your Existing Dashboard**
1. Open `src/App.tsx`
2. Find line 51: `dashboardId: "chat-mode-dash"`
3. Replace with your actual dashboard ID
4. Save the file

**Option C: Let It Auto-Detect**
The app will try to fetch and use the first available dashboard from your Data App.

---

## 🚀 Start the Demo

Once configuration is complete:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Open browser:** [http://localhost:5173](http://localhost:5173)

---

## 🔧 Optional Configuration

These have sensible defaults but can be customized:

### Change API Base URL
```bash
# backend/.env
DATABRAIN_API_BASE_URL=https://api.usedatabrain.com  # Default
```

### Change Workspace Name
```bash
# backend/.env
DATABRAIN_WORKSPACE_NAME=Demo Workspace  # Default
```

### Change Backend Port
```javascript
// backend/server.js line 1230
const PORT = 3001;  // Change to your preferred port
```

### Change Frontend URLs
The frontend uses `http://localhost:3002` for the backend API by default (configurable via `VITE_API_URL` in root `.env`).

**For production**, replace with environment variable:
```typescript
// Create src/config.ts
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
```

---

## ✅ Verification Checklist

Before reporting issues, verify:

- [ ] Backend server is running (shows: "Server is running on http://localhost:3002")
- [ ] Frontend dev server is running (shows: "Local: http://localhost:5173")
- [ ] No errors in backend terminal
- [ ] Browser console shows no red errors (F12 to open)
- [ ] You can access: http://localhost:3002/api/config/status
- [ ] API Token and Data App Name are correct (no typos)

---

## 🆘 Quick Troubleshooting

### "Failed to connect to backend"
- ✅ Make sure backend is running on port 3001
- ✅ Check for port conflicts
- ✅ Verify backend/.env file exists and has values

### "INVALID_TOKEN" or "401 Unauthorized"
- ✅ Check API token is correct
- ✅ Ensure no extra spaces in .env file
- ✅ Verify token came from Data App (not Settings)
- ✅ Check token hasn't expired

### "Data App Name not found"
- ✅ Verify exact spelling (case-sensitive)
- ✅ Check Data App exists in DataBrain
- ✅ Ensure dashboards are added to Data App

### Dashboard shows blank/empty
- ✅ Check browser console for errors (F12)
- ✅ Verify dashboard ID matches your DataBrain dashboard
- ✅ Ensure dashboard has at least one metric/visualization
- ✅ Check that data source is connected properly

### Port 3001 already in use
```bash
# Find what's using the port
lsof -ti:3001

# Kill that process (or change PORT in backend/server.js)
```

---

## 📚 Additional Resources

- **Full Setup Guide:** [QUICK_START.md](QUICK_START.md)
- **Developer Reference:** [docs/DEVELOPER.md](docs/DEVELOPER.md)
- **API Documentation:** [docs/API.md](docs/API.md)
- **DataBrain Docs:** [docs.usedatabrain.com](https://docs.usedatabrain.com)

---

## 🎯 Still Having Issues?

1. Check the [QUICK_START.md](QUICK_START.md) for detailed troubleshooting
2. Review [docs/DEVELOPER.md](docs/DEVELOPER.md) for advanced configuration
3. Search existing issues on GitHub
4. Contact DataBrain support: support@usedatabrain.com

---

**Happy Dashboarding! 🚀**

