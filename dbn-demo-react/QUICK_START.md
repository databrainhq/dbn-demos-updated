# Quick Start Guide

Complete walkthrough to get the DataBrain React Demo running in minutes.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Get DataBrain Credentials](#get-databrain-credentials)
3. [Download & Install](#download--install)
4. [Configure Credentials](#configure-credentials)
5. [Run the Demo](#run-the-demo)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### What You Need

- **Computer:** Windows, Mac, or Linux
- **Internet connection**
- **DataBrain Account:** [Sign up free](https://app.usedatabrain.com/users/sign-up)
- **Node.js v16+:** [Download here](https://nodejs.org/)

### Install Node.js

1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS version** (recommended)
3. Run the installer and follow prompts
4. Restart your terminal after installation

**Verify Installation:**
```bash
node --version
# Should show: v16.0.0 or higher
```

---

## Get DataBrain Credentials

Before running the demo, set up your DataBrain environment:

### Step 1: Create a Workspace

1. Login to [DataBrain Dashboard](https://app.usedatabrain.com/)
2. Click **"Create Workspace"**
3. Complete the workspace setup
4. Connect your data source (database or data warehouse)

### Step 2: Create a Dashboard

1. In your workspace, click **"New Dashboard"**
2. Add metrics and visualizations using the visual builder
3. Arrange and customize your dashboard
4. Click **Save**

### Step 3: Create a Data App

**This is where you get your API Token!**

1. Navigate to **Data → Data Apps**
2. Click **"New Data App"**
3. Fill in the details:
   - **Name:** e.g., "customer-analytics-app" 
   - **Description:** Optional
   - **Dashboards:** Select the dashboard(s) you created
4. Configure security settings
5. Click **Save** or **Create**
6. **COPY THESE TWO VALUES:**
   - ✅ **API Token** - Automatically generated (looks like `dbn_live_abc123...`)
   - ✅ **Data App Name** - The exact name you entered (case-sensitive!)

> **💡 Important:** The API Token comes from the **Data App**, not from Settings!

**Need more details?** See the [DataBrain Production-Ready Embedding Guide](https://docs.usedatabrain.com/developer-docs/embedding-setup/step-by-step-guide)

---

## Download & Install

### Download the Demo

**Option A: Download ZIP**
1. Go to [github.com/databrainhq/dbn-demo-react](https://github.com/databrainhq/dbn-demo-react)
2. Click the green **Code** button
3. Select **Download ZIP**
4. Extract to a folder (e.g., `Documents/dbn-demo-react`)

**Option B: Using Git**
```bash
git clone https://github.com/databrainhq/dbn-demo-react.git
cd dbn-demo-react
```

### Install Dependencies

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```bash
npm install
cd backend
npm install
cd ..
```

The setup will:
- ✅ Install all frontend dependencies
- ✅ Install all backend dependencies
- ✅ Create configuration template

**This may take 2-5 minutes** depending on your internet speed.

---

## Configure Credentials

You have **three ways** to configure. Choose the one that works best for you:

### 🎯 Option 1: Interactive CLI (Easiest)

**Perfect for:** First-time users who want a guided setup

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. If credentials aren't configured, you'll see an interactive prompt:
   ```
   ╔══════════════════════════════════════════════════════╗
   ║      DataBrain Demo - Configuration Setup           ║
   ╚══════════════════════════════════════════════════════╝
   
   🔧 No credentials found. Let's set up your DataBrain configuration!
   ```

3. Follow the prompts:
   - Enter your **API Token**
   - Enter your **Data App Name**
   - Credentials are validated automatically

4. Start the frontend (in a new terminal):
   ```bash
   npm run dev
   ```

✅ **Benefits:**
- Guided step-by-step
- Automatic validation
- No file editing needed

⚠️ **Note:** Credentials are stored in memory only. They'll be lost when the server restarts. For persistence, use Option 2 or 3.

---

### 🎨 Option 2: Settings UI

**Perfect for:** Users who prefer a graphical interface

1. Start the backend (skip prompts if they appear):
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend (in a new terminal):
   ```bash
   npm run dev
   ```

3. Open your browser: [http://localhost:5173](http://localhost:5173)

4. Click **Settings** tab (⚙️ icon)

5. Enter your credentials:
   - **API Token**
   - **Data App Name**

6. Click **Save Configuration**

✅ **Benefits:**
- User-friendly interface
- Real-time validation
- Update credentials anytime

⚠️ **Note:** Settings UI credentials are also memory-only. For permanent storage, add them to `.env` file.

---

### 📝 Option 3: .env File (Persistent)

**Perfect for:** Developers who want permanent configuration

1. Create the `.env` file:
   ```bash
   cp backend/env.example backend/.env
   ```

2. Open `backend/.env` in your text editor

3. Replace the placeholder values:
   ```bash
   DATABRAIN_API_KEY=your-actual-api-token-here
   DATABRAIN_DATA_APP_NAME=your-data-app-name-here
   DATABRAIN_API_BASE_URL=https://api.usedatabrain.com
   DATABRAIN_WORKSPACE_NAME=Demo Workspace
   ```

4. Save the file

5. Start the backend:
   ```bash
   cd backend
   npm start
   ```

6. Start the frontend (in a new terminal):
   ```bash
   npm run dev
   ```

✅ **Benefits:**
- Credentials persist across restarts
- No need to reconfigure
- Standard practice for environment variables

---

## Run the Demo

### Starting the Servers

You need to run **TWO terminals**:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

✅ You should see:
```
🚀 Server is running on http://localhost:3002
💡 Frontend should be running on: http://localhost:5173
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

✅ You should see:
```
  Local:   http://localhost:5173/
```

### Open Your Browser

1. Open your web browser
2. Go to: **http://localhost:5173**
3. You should see the DataBrain Demo! 🎉

### Exploring the Demo

**Try these features:**
- 🔄 **Switch Tenants** - Use the tenant dropdown (top left)
- 👤 **Switch Users** - Change user personas to see different permissions
- 📊 **View Dashboards** - Click "Dashboard" tab
- ➕ **Create Dashboard** - Click "Create New" tab
- 📈 **View Reports** - Navigate to "Reports" section
- ⚙️ **Settings** - Update credentials anytime

---

## Troubleshooting

### "npm: command not found"

**Problem:** Node.js is not installed

**Solution:**
1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Restart your terminal
3. Try again

---

### "Failed to connect to backend"

**Problem:** Backend server isn't running

**Solution:**
1. Check that you started the backend: `cd backend && npm start`
2. Verify you see: "Server is running on http://localhost:3002"
3. Keep that terminal window open

---

### "Port 3001 is already in use"

**Problem:** Another program is using port 3001

**Solution:**

**Find what's using the port:**
```bash
# Mac/Linux
lsof -ti:3001

# Windows
netstat -ano | findstr :3001
```

**Kill the process or change the port:**
- Edit `backend/server.js` line 1230
- Change `const PORT = 3001;` to another port

---

### "INVALID_TOKEN" or "401 Unauthorized"

**Problem:** API token is incorrect or expired

**Solution:**
1. Go to Settings tab
2. Re-enter your API Token
3. Make sure there are no extra spaces
4. Verify token came from **Data App** (not Settings)
5. Try generating a new token in DataBrain

---

### "Data App Name not found"

**Problem:** Data App name doesn't match exactly

**Solution:**
1. Check the exact name in DataBrain dashboard
2. Copy and paste it (don't type manually)
3. Names are case-sensitive: "My App" ≠ "my app"

---

### Dashboard shows blank/empty

**Possible causes:**

1. **Check browser console:**
   - Press F12 to open Developer Tools
   - Look for red errors in Console tab

2. **Verify dashboard ID:**
   - The demo expects a dashboard ID: `chat-mode-dash`
   - Create a dashboard with this ID, OR
   - Update `src/App.tsx:51` with your dashboard ID

3. **Check dashboard has content:**
   - Dashboard must have at least one metric/visualization
   - Verify in DataBrain dashboard editor

4. **Network access:**
   - Ensure you can access DataBrain API
   - Check firewall settings

---

### "npm install" fails

**Solutions:**

1. **Delete node_modules and try again:**
   ```bash
   rm -rf node_modules backend/node_modules
   npm install
   cd backend && npm install
   ```

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   npm install
   ```

3. **Check Node.js version:**
   ```bash
   node --version
   # Should be v16.0.0 or higher
   ```

---

### Windows-Specific Issues

**setup.sh doesn't work:**
- Windows doesn't support .sh scripts by default
- Use manual installation (see [Download & Install](#download--install))

**Path separators:**
- Use forward slashes `/` in commands
- Or use PowerShell instead of Command Prompt

---

### Still Having Issues?

1. **Check configuration:** See [CONFIGURATION.md](CONFIGURATION.md) for detailed checklist
2. **Developer docs:** See [docs/DEVELOPER.md](docs/DEVELOPER.md) for advanced troubleshooting
3. **Search GitHub issues:** [github.com/databrainhq/dbn-demo-react/issues](https://github.com/databrainhq/dbn-demo-react/issues)
4. **Contact support:** support@usedatabrain.com

---

## 🎉 Success!

If everything is working, you should see:

- ✅ Backend running on port 3001
- ✅ Frontend running on port 5173
- ✅ Browser showing the DataBrain demo
- ✅ Dashboards loading correctly

### Next Steps

**Explore the demo:**
- Test all features
- Switch between users and tenants
- Create custom dashboards
- Try the reports section

**Customize for your needs:**
- Update user/tenant data in `src/types/user.ts`
- Modify dashboard IDs to match yours
- Adjust permissions for different roles
- See [docs/DEVELOPER.md](docs/DEVELOPER.md) for advanced customization

---

## Additional Resources

- **Configuration Checklist:** [CONFIGURATION.md](CONFIGURATION.md)
- **API Reference:** [docs/API.md](docs/API.md)
- **Developer Guide:** [docs/DEVELOPER.md](docs/DEVELOPER.md)
- **DataBrain Documentation:** [docs.usedatabrain.com](https://docs.usedatabrain.com)
- **Embedding Guide:** [Production-Ready Embedding](https://docs.usedatabrain.com/developer-docs/embedding-setup/step-by-step-guide)

---

**Happy Dashboarding! 🚀**

Made with ❤️ using [DataBrain](https://www.usedatabrain.com/)

