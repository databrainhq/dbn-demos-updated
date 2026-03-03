# DataBrain React Demo

A demonstration React application showcasing DataBrain's embedded analytics capabilities with multi-tenancy, role-based permissions, and customizable dashboards.

![DataBrain Demo](https://img.shields.io/badge/DataBrain-Demo-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js)

> **Note:** This is a demo repository for testing and learning. Not intended for production deployment.

---

## ✨ Features

- **🚀 Easy Setup** - Three configuration options (CLI, UI, .env file)
- **🔐 Secure** - Guest token authentication with DataBrain API
- **👥 Multi-Tenancy** - Switch between tenants and users
- **📊 Dashboard Management** - Create, view, and customize dashboards
- **🎨 Custom Widgets** - Build visualizations with ease
- **🔑 Role-Based Permissions** - Different access levels per user
- **📈 Reports & Analytics** - Comprehensive reporting features

---

## 🚀 Quick Start

### Prerequisites

- **Node.js v16+** - [Download](https://nodejs.org/)
- **DataBrain Account** - [Sign up free](https://app.usedatabrain.com/users/sign-up)

### 1. Set Up DataBrain

1. Create a **Workspace** and connect your data source
2. Create a **Dashboard** with visualizations
3. Create a **Data App** to get your API token

📖 **Detailed guide:** [Production-Ready Embedding](https://docs.usedatabrain.com/developer-docs/embedding-setup/step-by-step-guide)

### 2. Install & Configure

```bash
# Clone repository
git clone https://github.com/databrainhq/dbn-demo-react.git
cd dbn-demo-react

# Run setup script
chmod +x setup.sh
./setup.sh

# Configure credentials (choose one method)
# Option A: Interactive CLI (when you start backend)
# Option B: Settings UI (in the app)
# Option C: Edit backend/.env file
```

### 3. Run the Demo

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm run dev

# Open browser
# http://localhost:5173
```

---

## 📚 Documentation

- **[CONFIGURATION.md](CONFIGURATION.md)** - Simple setup checklist
- **[QUICK_START.md](QUICK_START.md)** - Complete walkthrough with troubleshooting
- **[docs/API.md](docs/API.md)** - Backend API reference
- **[docs/DEVELOPER.md](docs/DEVELOPER.md)** - Advanced customization guide

---

## 📁 Project Structure

```
dbn-demo-react/
├── src/
│   ├── App.tsx                    # Main application
│   ├── components/                # React components
│   ├── types/                     # TypeScript types
│   └── lib/                       # Utilities
├── backend/
│   ├── server.js                  # Express API server
│   ├── package.json               # Backend dependencies
│   └── .env                       # Configuration (create from env.example)
├── docs/                          # Developer documentation
├── CONFIGURATION.md               # Setup checklist
├── QUICK_START.md                 # Complete guide
└── README.md                      # This file
```

---

## 🎯 What This Demo Shows

### Guest Token Authentication
Learn how to generate secure guest tokens for embedded dashboard access.

### Multi-Tenant Architecture  
See how to implement multi-tenancy with different users and data isolation.

### Dashboard Management
Explore creating, listing, and managing dashboards via API.

### Configuration Flexibility
Test different configuration methods (UI, CLI, environment variables).

---

## 🔧 Configuration

### Required Environment Variables

```bash
DATABRAIN_API_KEY=your-api-token-from-data-app
DATABRAIN_DATA_APP_NAME=your-data-app-name
```

### Optional (Have Defaults)

```bash
DATABRAIN_API_BASE_URL=https://api.usedatabrain.com
DATABRAIN_WORKSPACE_NAME=Demo Workspace
```

**⚠️ Important:** API Token comes from your **Data App**, not from Settings.

---

## 🆘 Troubleshooting

### Common Issues

**"Failed to connect to backend"**
- Ensure backend is running on port 3001
- Check `http://localhost:3001/api/config/status`

**"INVALID_TOKEN" error**
- Verify API Token is from your Data App
- Check for typos or extra spaces
- Ensure Data App Name matches exactly (case-sensitive)

**Dashboard doesn't load**
- Demo expects dashboard ID: `chat-mode-dash`
- Create one with this ID, or update `src/App.tsx:51`
- Or let the app auto-detect your first dashboard

📖 **Full troubleshooting:** See [QUICK_START.md](QUICK_START.md#troubleshooting)

---

## 🔐 Security Best Practices

> **Important:** This is a demo. Never commit API tokens to version control.

- Use `.env` files for sensitive data
- Keep your API tokens secure
- The `.env` file is already in `.gitignore`
- For production, use environment variables or secrets management

---

## 📖 Additional Resources

- **DataBrain Docs:** [docs.usedatabrain.com](https://docs.usedatabrain.com)
- **Guest Token API:** [Token API Reference](https://docs.usedatabrain.com/developer-docs/helpers/api-reference/token)
- **Embedding Guide:** [How to Embed](https://docs.usedatabrain.com/developer-docs/how-to-embed)
- **DataBrain Plugin:** [NPM Package](https://www.npmjs.com/package/@databrainhq/plugin)

---

## 🎨 Customization

Want to adapt this demo for your use case?

- **User/Tenant Data:** Edit `src/types/user.ts`
- **Dashboard IDs:** Update `src/App.tsx` config
- **Backend URLs:** See [docs/DEVELOPER.md](docs/DEVELOPER.md)
- **Permissions:** Modify permission structure in `src/types/user.ts`

---

## 📋 Demo Data

This demo includes sample data for testing:

- **5 Tenants** - Client 101-105
- **20 Store Managers** - 4 per tenant
- **3 OOTB Dashboards** - Overview, Stores, Analytics

All demo users have similar permissions to showcase the multi-tenancy features.

---

## 🤝 Getting Help

- **📖 Documentation:** [docs.usedatabrain.com](https://docs.usedatabrain.com)
- **💬 Community:** [DataBrain Community](https://community.usedatabrain.com)
- **📧 Email:** support@usedatabrain.com
- **🐛 Issues:** [GitHub Issues](https://github.com/databrainhq/dbn-demo-react/issues)

---

## 📄 License

MIT License - feel free to use this code as a reference for your own projects.

---

## 🎉 About This Demo

This demonstration repository showcases DataBrain's API integration patterns. Use it to:

- ✅ Learn how DataBrain APIs work
- ✅ Test integration patterns
- ✅ Explore embedding features
- ✅ Understand multi-tenancy

**This is not a production-ready application.** Use it as a reference for building your own integration.

---

**Made with ❤️ using [DataBrain](https://www.usedatabrain.com/)**
