# 🎯 DataBrain Customizability Demo Guide

## 🌟 Overview

This demo showcases DataBrain's advanced customizability features through a realistic A360 (Automation 360) scenario. The demo demonstrates how users can create private dashboards, custom widgets, and publish content with granular permissions.

## 👥 Demo Personas

### Michael Thompson (Process Owner)
- **Role**: Process Owner
- **Avatar**: 👨‍💼
- **Email**: michael.thompson@acmecorp.com
- **Permissions**: All permissions enabled
  - ✅ Create new widgets
  - ✅ Create new dashboards
  - ✅ Publish dashboards
  - ✅ Manage custom widgets
  - ✅ Manage custom dashboards

### Jake Rodriguez (Automation Admin)
- **Role**: Automation Admin
- **Avatar**: 👨‍💻
- **Email**: jake.rodriguez@acmecorp.com
- **Permissions**: All permissions enabled
  - ✅ Create new widgets
  - ✅ Create new dashboards
  - ✅ Publish dashboards
  - ✅ Manage custom widgets
  - ✅ Manage custom dashboards

## 🎬 Demo Script

### Scene 1: User Authentication & Overview
1. **Start as Michael**: The demo begins with Michael Thompson logged in
2. **Navigate to Analytics**: Click on the "Analytics" tab in the sidebar
3. **Show Overview Dashboard**: Display the main "Overview" dashboard with OOTB widgets

**Key Points to Highlight**:
- User switcher in the top-left shows current user and permissions
- Debug info shows user context and permissions
- Overview dashboard contains OOTB widgets like "My Automations"

### Scene 2: Creating Custom Widgets (Private View)
1. **Show Widget Creation Button**: Point out the "Create Custom Widget" button (only visible to users with permission)
2. **Click Create Widget**: Open the widget creation panel
3. **Step through Widget Creation**:
   - **Step 1 - Data Selection**: Choose "Sales Database" → "Orders" table → Select columns (order_date, total_amount, region)
   - **Step 2 - Chart Selection**: Choose "Bar Chart" from basic charts
   - **Step 3 - Configuration**: Name it "Regional Sales Analysis", add description
   - **Step 4 - Preview**: Show the widget preview with privacy notice
4. **Create Widget**: Complete the creation process

**Key Points to Highlight**:
- Widget is private to Michael initially
- Only data sources accessible to Michael are shown
- Step-by-step wizard makes widget creation intuitive
- Privacy notice explains the widget is private until dashboard is published

### Scene 3: Dashboard Management (Save As)
1. **Show Dashboard Actions**: Point out Save, Save As, and Publish buttons
2. **Use Save As**: Click "Save As" to create a copy
3. **Name New Dashboard**: "Overview_Finance"
4. **Show Privacy Notice**: Explain the new dashboard is private initially

**Key Points to Highlight**:
- Save As creates a complete copy of the dashboard
- New dashboard inherits all widgets from the original
- Dashboard is private to the creator initially

### Scene 4: Publishing Dashboards
1. **Click Publish**: Open the publish modal
2. **Show Publishing Options**:
   - All Users (everyone in organization)
   - Specific Role (Finance, Claims Approvers, etc.)
   - Specific Users (individual email addresses)
3. **Select Role**: Choose "Finance" role
4. **Publish Dashboard**: Complete the publishing process

**Key Points to Highlight**:
- Granular publishing controls
- Role-based access control
- Dashboard becomes visible to selected audience after publishing

### Scene 5: User Switching Demo
1. **Switch to Jake**: Use the user switcher to become Jake Rodriguez
2. **Show Jake's View**: Demonstrate that Jake can see published dashboards
3. **Show Permissions**: Jake has the same permissions as Michael
4. **Create Jake's Widget**: Have Jake create a different widget to show user-specific content

**Key Points to Highlight**:
- Different users see different private content
- Published dashboards are visible to appropriate users
- Each user can create their own private widgets and dashboards

### Scene 6: OOTB vs Custom Content Management
1. **Show OOTB Restrictions**: Try to edit/delete "My Automations" widget (should be disabled)
2. **Show Custom Widget Management**: Edit/delete custom widgets (should be enabled)
3. **Show Dashboard Restrictions**: OOTB dashboards can't be deleted, only custom ones can

**Key Points to Highlight**:
- OOTB content is protected from modification
- Users can only manage their own custom content
- Clear distinction between system and user-generated content

## 🔧 Technical Features Demonstrated

### ✅ **Real DataBrain API Integration**
- **Widget Creation**: Uses real DataBrain metric creation API (`/api/v2/dataApp/embed/create`)
- **Dashboard Copy**: Uses real DataBrain embed configuration API for "Save As"
- **Dashboard Rendering**: Real DataBrain web components with live data
- **Authentication**: Real guest token generation and management

### 🎭 **Custom Implementation Concepts**
- **Publishing System**: Custom workflow for role-based publishing (we would build this)
- **Permission Gates**: UI elements appear/disappear based on user permissions
- **User Management**: Role-based user switching and authentication integration
- **Governance**: Custom permission management around DataBrain's core APIs

### **Hybrid Architecture Benefits**
- **Real Technical Proof**: Actual DataBrain APIs working with real data
- **Business Value Demo**: Complete workflows showing enterprise capabilities
- **Implementation Roadmap**: Clear path from demo to production

## 🎯 Key Demo Messages

### For Business Users
1. **Self-Service Analytics**: Users can create their own widgets and dashboards without IT involvement
2. **Privacy Control**: Content is private by default, published when ready
3. **Collaboration**: Easy sharing with specific teams or the entire organization
4. **Governance**: OOTB content is protected, custom content is manageable

### For IT/Administrators
1. **Permission Management**: Granular control over who can do what
2. **Data Security**: Users only see data they have access to
3. **Content Governance**: Clear separation between system and user content
4. **Scalability**: System supports multiple users with different roles

### For DataBrain
1. **Embedded Analytics**: Seamless integration into existing applications
2. **Customizability**: Extensive customization without code changes
3. **User Empowerment**: Business users can be self-sufficient
4. **Enterprise Ready**: Role-based security and governance built-in

## 🚀 Running the Demo

### Prerequisites
1. Node.js installed
2. DataBrain API token configured in `backend/server.js`
3. Both frontend and backend servers running

### Starting the Demo
```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend  
npm run dev
```

### Demo URL
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 🎨 Customization Options

### Adding New Users
Edit `src/types/user.ts` to add new personas with different permission sets.

### Adding New Permissions
1. Add to `PERMISSIONS` object in `src/types/user.ts`
2. Use `PermissionGate` component to control UI visibility
3. Update user permission arrays

### Adding New Chart Types
Edit the `CHART_TYPES` array in `src/components/MetricCreatorPanel.tsx`.

### Adding New Data Sources
Edit the `MOCK_DATA_SOURCES` array in `src/components/MetricCreatorPanel.tsx`.

## 🐛 Troubleshooting

### Common Issues
1. **API Token Error**: Ensure DataBrain API token is configured in `backend/server.js`
2. **CORS Issues**: Backend includes CORS middleware for local development
3. **Port Conflicts**: Frontend runs on 5173, backend on 3001
4. **Permission Issues**: Check user permissions in `src/types/user.ts`

### Debug Information
The demo includes debug information showing:
- Current user and role
- Active permissions
- Token status
- Dashboard context

## 📝 Demo Notes

### Timing
- Full demo: 15-20 minutes
- Quick overview: 5-10 minutes
- Deep dive: 30+ minutes

### Audience Adaptation
- **Business Users**: Focus on ease of use and self-service capabilities
- **Technical Users**: Highlight architecture and integration points
- **Decision Makers**: Emphasize ROI and user empowerment

### Follow-up Questions
Be prepared to discuss:
- Integration complexity
- Performance at scale
- Security and compliance
- Pricing and licensing
- Implementation timeline

## 🎉 Success Metrics

### Demo Success Indicators
- Audience engagement during widget creation
- Questions about implementation
- Requests for follow-up meetings
- Interest in specific features
- Discussion of use cases

### Key Takeaways for Audience
1. DataBrain enables true self-service analytics
2. Granular permissions provide security and governance
3. Integration is seamless and non-disruptive
4. Users can be productive immediately
5. IT maintains control while empowering users

---

**Happy Demoing! 🚀**

