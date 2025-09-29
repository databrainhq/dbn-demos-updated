export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: Permission[];
  avatar?: string;
  customerId: string; // Maps to customer_id in the database for data filtering
  clientId: string;   // Top-level tenant ID (101 for our demo)
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  isOOTB: boolean; // Out of the box dashboard
  isPrivate: boolean;
  createdBy: string;
  publishedTo: PublishTarget[];
  widgets: Widget[];
  lastModified: string;
  visibleToRoles?: string[]; // Roles that can see this dashboard
  requiredPermissions?: string[]; // Required permissions to access
}

export interface Widget {
  id: string;
  name: string;
  type: 'chart' | 'metric' | 'table' | 'kpi';
  isOOTB: boolean; // Out of the box widget
  createdBy: string;
  config: any;
  position: { x: number; y: number; w: number; h: number };
}

export interface PublishTarget {
  type: 'all' | 'role' | 'user';
  value?: string; // role name or user id
}

// Predefined permissions
export const PERMISSIONS = {
  CREATE_WIDGETS: {
    id: 'create_widgets',
    name: 'Create new widgets',
    description: 'Ability to create new widgets in existing customer\'s dashboard (private view)',
    enabled: false
  },
  CREATE_DASHBOARDS: {
    id: 'create_dashboards',
    name: 'Create new dashboards',
    description: 'Ability to create new dashboard (private view)',
    enabled: false
  },
  PUBLISH_DASHBOARDS: {
    id: 'publish_dashboards',
    name: 'Publish dashboards',
    description: 'Ability to publish a dashboard to ALL users / specific roles / specific users (public view)',
    enabled: false
  },
  MANAGE_CUSTOM_WIDGETS: {
    id: 'manage_custom_widgets',
    name: 'Manage custom widgets',
    description: 'Ability to manage custom widgets (edit/delete)',
    enabled: false
  },
  MANAGE_CUSTOM_DASHBOARDS: {
    id: 'manage_custom_dashboards',
    name: 'Manage custom dashboards',
    description: 'Ability to manage custom dashboards (edit/delete)',
    enabled: false
  }
} as const;

// Predefined users mapped to actual customer IDs from the database
export const USERS: User[] = [
  {
    id: 'michael',
    name: 'Michael Thompson',
    email: 'michael.thompson@acmecorp.com',
    role: 'Process Owner',
    avatar: '👨‍💼',
    customerId: '285407', // Maps to customer_id in demo_sales table
    clientId: '101',      // Top-level tenant ID
    permissions: [
      { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
      { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
      { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: true },
      { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: false }, // Process Owner has limited management rights
      { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: false } // Can't manage custom dashboards
    ]
  },
  {
    id: 'jake',
    name: 'Jake Rodriguez',
    email: 'jake.rodriguez@acmecorp.com',
    role: 'Automation Admin',
    avatar: '👨‍💻',
    customerId: '440422', // Maps to customer_id in demo_sales table
    clientId: '101',      // Top-level tenant ID
    permissions: [
      { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
      { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
      { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: true }, // Automation Admin has full publish rights
      { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: true },
      { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: true } // Can manage others' dashboards
    ]
  }
];

// OOTB Dashboards that come with the system with role-based visibility
export const OOTB_DASHBOARDS: Dashboard[] = [
  {
    id: 'overview',
    name: 'Overview',
    description: 'Main overview dashboard with key metrics',
    isOOTB: true,
    isPrivate: false,
    createdBy: 'system',
    publishedTo: [{ type: 'all' }],
    visibleToRoles: ['Process Owner', 'Automation Admin'], // Visible to all roles
    widgets: [
      {
        id: 'my-automations',
        name: 'My Automations',
        type: 'metric',
        isOOTB: true,
        createdBy: 'system',
        config: {},
        position: { x: 0, y: 0, w: 6, h: 4 }
      }
    ],
    lastModified: '2024-01-01T00:00:00Z'
  },
  {
    id: 'automations',
    name: 'Automations',
    description: 'Automation management and monitoring',
    isOOTB: true,
    isPrivate: false,
    createdBy: 'system',
    publishedTo: [{ type: 'all' }],
    visibleToRoles: ['Process Owner', 'Automation Admin'], // Visible to all roles
    widgets: [],
    lastModified: '2024-01-01T00:00:00Z'
  },
  {
    id: 'devices',
    name: 'Devices',
    description: 'Device management and status',
    isOOTB: true,
    isPrivate: false,
    createdBy: 'system',
    publishedTo: [{ type: 'all' }],
    visibleToRoles: ['Automation Admin'], // Only visible to Automation Admins
    requiredPermissions: ['manage_custom_widgets'],
    widgets: [],
    lastModified: '2024-01-01T00:00:00Z'
  },
  {
    id: 'api-tasks',
    name: 'API Tasks',
    description: 'API task monitoring and management',
    isOOTB: true,
    isPrivate: false,
    createdBy: 'system',
    publishedTo: [{ type: 'all' }],
    visibleToRoles: ['Automation Admin'], // Only visible to Automation Admins
    requiredPermissions: ['manage_custom_widgets'],
    widgets: [],
    lastModified: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ai-governance',
    name: 'AI Governance',
    description: 'AI governance and compliance monitoring',
    isOOTB: true,
    isPrivate: false,
    createdBy: 'system',
    publishedTo: [{ type: 'all' }],
    visibleToRoles: ['Process Owner'], // Only visible to Process Owners
    requiredPermissions: ['publish_dashboards'],
    widgets: [],
    lastModified: '2024-01-01T00:00:00Z'
  }
];

// Utility function to check if a user can see a dashboard
export const canUserSeeDashboard = (user: User, dashboard: Dashboard): boolean => {
  // If it's the user's own private dashboard, they can always see it
  if (dashboard.isPrivate && dashboard.createdBy === user.id) {
    return true;
  }

  // If it's published to all, everyone can see it (unless role-restricted)
  if (dashboard.publishedTo.some(target => target.type === 'all')) {
    // Check role restrictions if any
    if (dashboard.visibleToRoles && dashboard.visibleToRoles.length > 0) {
      return dashboard.visibleToRoles.includes(user.role);
    }
    return true;
  }

  // Check if published to user's specific role
  if (dashboard.publishedTo.some(target => target.type === 'role' && target.value === user.role)) {
    return true;
  }

  // Check if published to specific user
  if (dashboard.publishedTo.some(target => target.type === 'user' && target.value === user.id)) {
    return true;
  }

  // Check role-based visibility
  if (dashboard.visibleToRoles && dashboard.visibleToRoles.includes(user.role)) {
    // Check required permissions if any
    if (dashboard.requiredPermissions && dashboard.requiredPermissions.length > 0) {
      return dashboard.requiredPermissions.every(permission =>
        user.permissions.some(userPerm => userPerm.id === permission && userPerm.enabled)
      );
    }
    return true;
  }

  return false;
};

// Utility function to filter dashboards based on user permissions
export const getVisibleDashboards = (user: User, dashboards: Dashboard[]): Dashboard[] => {
  return dashboards.filter(dashboard => canUserSeeDashboard(user, dashboard));
};

