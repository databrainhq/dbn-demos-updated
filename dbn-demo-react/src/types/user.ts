export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: Permission[];
  avatar?: string;
  customerId: string; // Maps to customer_id in the database for data filtering
  clientId: string;   // Top-level tenant ID (client/tenant identifier)
  storeName: string;  // Store Name for app filter (e.g., "Ramirez Ltd")
}

export interface Tenant {
  id: string;
  name: string;
  description: string;
  users: User[];
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

// Define tenants with their users
export const TENANTS: Tenant[] = [
  {
    id: '101',
    name: 'Client 101',
    description: 'Client tenant 101 with 4 stores',
    users: [
      {
        id: 'user-101-1',
        name: 'Store Manager - Ramirez Ltd',
        email: 'manager1@client101.com',
        role: 'Store Manager',
        avatar: '👨‍💼',
        customerId: '101-1',
        clientId: '101',
        storeName: 'Ramirez Ltd',
        permissions: [
          { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
          { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
          { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: false },
          { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: true },
          { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: false }
        ]
      },
      {
        id: 'user-101-2',
        name: 'Store Manager - Reese, Allen and Fisher',
        email: 'manager2@client101.com',
        role: 'Store Manager',
        avatar: '👩‍💼',
        customerId: '101-2',
        clientId: '101',
        storeName: 'Reese, Allen and Fisher',
        permissions: [
          { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
          { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
          { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: false },
          { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: true },
          { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: false }
        ]
      },
      {
        id: 'user-101-3',
        name: 'Store Manager - Jenkins-Cook',
        email: 'manager3@client101.com',
        role: 'Store Manager',
        avatar: '👨‍💻',
        customerId: '101-3',
        clientId: '101',
        storeName: 'Jenkins-Cook',
        permissions: [
          { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
          { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
          { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: false },
          { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: true },
          { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: false }
        ]
      },
      {
        id: 'user-101-4',
        name: 'Store Manager - Vance Inc',
        email: 'manager4@client101.com',
        role: 'Store Manager',
        avatar: '👩‍💻',
        customerId: '101-4',
        clientId: '101',
        storeName: 'Vance Inc',
        permissions: [
          { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
          { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
          { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: false },
          { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: true },
          { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: false }
        ]
      }
    ]
  },
  {
    id: '102',
    name: 'Client 102',
    description: 'Client tenant 102 with 4 stores',
    users: [
      {
        id: 'user-102-1',
        name: 'Store Manager - Holt, Simpson and Bowman',
        email: 'manager1@client102.com',
        role: 'Store Manager',
        avatar: '👨‍💼',
        customerId: '102-1',
        clientId: '102',
        storeName: 'Holt, Simpson and Bowman',
        permissions: [
          { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
          { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
          { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: false },
          { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: true },
          { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: false }
        ]
      },
      {
        id: 'user-102-2',
        name: 'Store Manager - Green, Smith and Wang',
        email: 'manager2@client102.com',
        role: 'Store Manager',
        avatar: '👩‍💼',
        customerId: '102-2',
        clientId: '102',
        storeName: 'Green, Smith and Wang',
        permissions: [
          { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
          { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
          { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: false },
          { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: true },
          { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: false }
        ]
      },
      {
        id: 'user-102-3',
        name: 'Store Manager - Rivas LLC',
        email: 'manager3@client102.com',
        role: 'Store Manager',
        avatar: '👨‍💻',
        customerId: '102-3',
        clientId: '102',
        storeName: 'Rivas LLC',
        permissions: [
          { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
          { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
          { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: false },
          { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: true },
          { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: false }
        ]
      },
      {
        id: 'user-102-4',
        name: 'Store Manager - Ramirez-Olson',
        email: 'manager4@client102.com',
        role: 'Store Manager',
        avatar: '👩‍💻',
        customerId: '102-4',
        clientId: '102',
        storeName: 'Ramirez-Olson',
        permissions: [
          { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
          { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
          { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: false },
          { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: true },
          { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: false }
        ]
      }
    ]
  },
  {
    id: '103',
    name: 'Client 103',
    description: 'Client tenant 103 with 4 stores',
    users: [
      {
        id: 'user-103-1',
        name: 'Store Manager - Chang and Sons',
        email: 'manager1@client103.com',
        role: 'Store Manager',
        avatar: '👨‍💼',
        customerId: '103-1',
        clientId: '103',
        storeName: 'Chang and Sons',
        permissions: [
          { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
          { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
          { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: false },
          { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: true },
          { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: false }
        ]
      },
      {
        id: 'user-103-2',
        name: 'Store Manager - Gibson Ltd',
        email: 'manager2@client103.com',
        role: 'Store Manager',
        avatar: '👩‍💼',
        customerId: '103-2',
        clientId: '103',
        storeName: 'Gibson Ltd',
        permissions: [
          { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
          { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
          { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: false },
          { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: true },
          { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: false }
        ]
      },
      {
        id: 'user-103-3',
        name: 'Store Manager - Davis, Johnson and Cobb',
        email: 'manager3@client103.com',
        role: 'Store Manager',
        avatar: '👨‍💻',
        customerId: '103-3',
        clientId: '103',
        storeName: 'Davis, Johnson and Cobb',
        permissions: [
          { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
          { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
          { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: false },
          { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: true },
          { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: false }
        ]
      },
      {
        id: 'user-103-4',
        name: 'Store Manager - Nelson-Shea',
        email: 'manager4@client103.com',
        role: 'Store Manager',
        avatar: '👩‍💻',
        customerId: '103-4',
        clientId: '103',
        storeName: 'Nelson-Shea',
        permissions: [
          { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
          { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
          { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: false },
          { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: true },
          { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: false }
        ]
      }
    ]
  },
  {
    id: '104',
    name: 'Client 104',
    description: 'Client tenant 104 with 4 stores',
    users: [
      {
        id: 'user-104-1',
        name: 'Store Manager - Lawrence-Medina',
        email: 'manager1@client104.com',
        role: 'Store Manager',
        avatar: '👨‍💼',
        customerId: '104-1',
        clientId: '104',
        storeName: 'Lawrence-Medina',
        permissions: [
          { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
          { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
          { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: false },
          { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: true },
          { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: false }
        ]
      },
      {
        id: 'user-104-2',
        name: 'Store Manager - Sutton Inc',
        email: 'manager2@client104.com',
        role: 'Store Manager',
        avatar: '👩‍💼',
        customerId: '104-2',
        clientId: '104',
        storeName: 'Sutton Inc',
        permissions: [
          { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
          { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
          { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: false },
          { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: true },
          { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: false }
        ]
      },
      {
        id: 'user-104-3',
        name: 'Store Manager - Lopez Group',
        email: 'manager3@client104.com',
        role: 'Store Manager',
        avatar: '👨‍💻',
        customerId: '104-3',
        clientId: '104',
        storeName: 'Lopez Group',
        permissions: [
          { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
          { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
          { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: false },
          { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: true },
          { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: false }
        ]
      },
      {
        id: 'user-104-4',
        name: 'Store Manager - Carroll Inc',
        email: 'manager4@client104.com',
        role: 'Store Manager',
        avatar: '👩‍💻',
        customerId: '104-4',
        clientId: '104',
        storeName: 'Carroll Inc',
        permissions: [
          { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
          { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
          { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: false },
          { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: true },
          { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: false }
        ]
      }
    ]
  },
  {
    id: '105',
    name: 'Client 105',
    description: 'Client tenant 105 with 4 stores',
    users: [
      {
        id: 'user-105-1',
        name: 'Store Manager - Lucas-Wright',
        email: 'manager1@client105.com',
        role: 'Store Manager',
        avatar: '👨‍💼',
        customerId: '105-1',
        clientId: '105',
        storeName: 'Lucas-Wright',
        permissions: [
          { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
          { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
          { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: false },
          { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: true },
          { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: false }
        ]
      },
      {
        id: 'user-105-2',
        name: 'Store Manager - Carter, Blackburn and Franklin',
        email: 'manager2@client105.com',
        role: 'Store Manager',
        avatar: '👩‍💼',
        customerId: '105-2',
        clientId: '105',
        storeName: 'Carter, Blackburn and Franklin',
        permissions: [
          { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
          { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
          { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: false },
          { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: true },
          { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: false }
        ]
      },
      {
        id: 'user-105-3',
        name: 'Store Manager - Baxter-Dixon',
        email: 'manager3@client105.com',
        role: 'Store Manager',
        avatar: '👨‍💻',
        customerId: '105-3',
        clientId: '105',
        storeName: 'Baxter-Dixon',
        permissions: [
          { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
          { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
          { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: false },
          { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: true },
          { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: false }
        ]
      },
      {
        id: 'user-105-4',
        name: 'Store Manager - Gonzalez Group',
        email: 'manager4@client105.com',
        role: 'Store Manager',
        avatar: '👩‍💻',
        customerId: '105-4',
        clientId: '105',
        storeName: 'Gonzalez Group',
        permissions: [
          { ...PERMISSIONS.CREATE_WIDGETS, enabled: true },
          { ...PERMISSIONS.CREATE_DASHBOARDS, enabled: true },
          { ...PERMISSIONS.PUBLISH_DASHBOARDS, enabled: false },
          { ...PERMISSIONS.MANAGE_CUSTOM_WIDGETS, enabled: true },
          { ...PERMISSIONS.MANAGE_CUSTOM_DASHBOARDS, enabled: false }
        ]
      }
    ]
  }
];

// Flatten all users for backward compatibility
export const USERS: User[] = TENANTS.flatMap(tenant => tenant.users);

// Helper functions for tenant management
export const getTenantById = (tenantId: string): Tenant | undefined => {
  return TENANTS.find(t => t.id === tenantId);
};

export const getUsersByTenant = (tenantId: string): User[] => {
  const tenant = getTenantById(tenantId);
  return tenant ? tenant.users : [];
};

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
    visibleToRoles: ['Store Manager'], // Visible to all roles
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
    id: 'stores',
    name: 'Stores',
    description: 'Store management and monitoring',
    isOOTB: true,
    isPrivate: false,
    createdBy: 'system',
    publishedTo: [{ type: 'all' }],
    visibleToRoles: ['Store Manager'], // Visible to all roles
    widgets: [],
    lastModified: '2024-01-01T00:00:00Z'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Store analytics and performance',
    isOOTB: true,
    isPrivate: false,
    createdBy: 'system',
    publishedTo: [{ type: 'all' }],
    visibleToRoles: ['Store Manager'], // Visible to all roles
    widgets: [],
    lastModified: '2024-01-01T00:00:00Z'
  }
];