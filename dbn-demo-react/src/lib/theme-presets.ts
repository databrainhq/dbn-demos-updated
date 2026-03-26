/* eslint-disable @typescript-eslint/no-explicit-any */

// --- AdminThemeOptions presets ---

export type AdminThemePreset = {
  general: {
    name: string;
    fontFamily: string;
  };
  dashboard: {
    backgroundColor?: string;
    ctaColor?: string;
    ctaTextColor?: string;
    selectBoxSize?: 'small' | 'medium' | 'large';
    selectBoxVariant?: 'floating' | 'static';
    selectBoxBorderRadius?: string;
    selectBoxTextColor?: string;
    metricCardColor?: string;
  };
  cardTitle: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
  };
  cardDescription: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
  };
  chart: {
    palettes?: { name: string; colors: string[] }[];
    paletteOptions?: string[];
    selected?: string;
  };
  cardCustomization: {
    padding?: string;
    borderRadius?: string;
    shadow?: string;
    disableShadowOnHover?: boolean;
    disableStroke?: boolean;
    metricStrokeColor?: boolean;
  };
};

export const ADMIN_THEME_PRESETS: Record<string, AdminThemePreset> = {
  'Clean Light': {
    general: { name: 'Clean Light', fontFamily: 'Inter' },
    dashboard: {
      backgroundColor: '#ffffff',
      ctaColor: '#2563eb',
      ctaTextColor: '#ffffff',
      selectBoxSize: 'medium',
      selectBoxVariant: 'static',
      selectBoxBorderRadius: '6px',
      selectBoxTextColor: '#334155',
      metricCardColor: '#ffffff',
    },
    cardTitle: { fontSize: '16px', fontWeight: '600', color: '#0f172a' },
    cardDescription: { fontSize: '13px', fontWeight: '400', color: '#64748b' },
    chart: {
      palettes: [
        { name: 'Default', colors: ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'] },
      ],
      paletteOptions: ['Default'],
      selected: 'Default',
    },
    cardCustomization: {
      padding: '16px',
      borderRadius: '8px',
      shadow: '0 1px 3px rgba(0,0,0,0.1)',
      disableShadowOnHover: false,
      disableStroke: false,
    },
  },

  'Dark Mode': {
    general: { name: 'Dark Mode', fontFamily: 'Inter' },
    dashboard: {
      backgroundColor: '#0f172a',
      ctaColor: '#60a5fa',
      ctaTextColor: '#0f172a',
      selectBoxSize: 'medium',
      selectBoxVariant: 'static',
      selectBoxBorderRadius: '6px',
      selectBoxTextColor: '#e2e8f0',
      metricCardColor: '#1e293b',
    },
    cardTitle: { fontSize: '16px', fontWeight: '600', color: '#f1f5f9' },
    cardDescription: { fontSize: '13px', fontWeight: '400', color: '#94a3b8' },
    chart: {
      palettes: [
        { name: 'Neon', colors: ['#60a5fa', '#a78bfa', '#f472b6', '#fb923c', '#4ade80', '#22d3ee'] },
      ],
      paletteOptions: ['Neon'],
      selected: 'Neon',
    },
    cardCustomization: {
      padding: '16px',
      borderRadius: '8px',
      shadow: '0 1px 3px rgba(0,0,0,0.4)',
      disableShadowOnHover: true,
      disableStroke: true,
    },
  },

  'Corporate Blue': {
    general: { name: 'Corporate Blue', fontFamily: 'system-ui' },
    dashboard: {
      backgroundColor: '#f0f4f8',
      ctaColor: '#1e40af',
      ctaTextColor: '#ffffff',
      selectBoxSize: 'small',
      selectBoxVariant: 'floating',
      selectBoxBorderRadius: '4px',
      selectBoxTextColor: '#1e3a5f',
      metricCardColor: '#ffffff',
    },
    cardTitle: { fontSize: '14px', fontWeight: '700', color: '#1e3a5f' },
    cardDescription: { fontSize: '12px', fontWeight: '400', color: '#475569' },
    chart: {
      palettes: [
        { name: 'Corporate', colors: ['#1e40af', '#3b82f6', '#93c5fd', '#1d4ed8', '#60a5fa', '#bfdbfe'] },
      ],
      paletteOptions: ['Corporate'],
      selected: 'Corporate',
    },
    cardCustomization: {
      padding: '12px',
      borderRadius: '4px',
      shadow: '0 1px 2px rgba(0,0,0,0.06)',
      disableShadowOnHover: false,
      disableStroke: false,
    },
  },

  'Warm Brand': {
    general: { name: 'Warm Brand', fontFamily: 'Georgia' },
    dashboard: {
      backgroundColor: '#faf5ff',
      ctaColor: '#7c3aed',
      ctaTextColor: '#ffffff',
      selectBoxSize: 'medium',
      selectBoxVariant: 'static',
      selectBoxBorderRadius: '12px',
      selectBoxTextColor: '#4c1d95',
      metricCardColor: '#fefce8',
    },
    cardTitle: { fontSize: '18px', fontWeight: '600', color: '#4c1d95' },
    cardDescription: { fontSize: '14px', fontWeight: '400', color: '#6b21a8' },
    chart: {
      palettes: [
        { name: 'Warm', colors: ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6'] },
      ],
      paletteOptions: ['Warm'],
      selected: 'Warm',
    },
    cardCustomization: {
      padding: '20px',
      borderRadius: '16px',
      shadow: '0 4px 12px rgba(124,58,237,0.1)',
      disableShadowOnHover: false,
      disableStroke: false,
    },
  },

  Minimal: {
    general: { name: 'Minimal', fontFamily: 'ui-monospace' },
    dashboard: {
      backgroundColor: '#fafafa',
      ctaColor: '#18181b',
      ctaTextColor: '#fafafa',
      selectBoxSize: 'small',
      selectBoxVariant: 'static',
      selectBoxBorderRadius: '2px',
      selectBoxTextColor: '#18181b',
      metricCardColor: '#ffffff',
    },
    cardTitle: { fontSize: '13px', fontWeight: '500', color: '#18181b' },
    cardDescription: { fontSize: '11px', fontWeight: '400', color: '#71717a' },
    chart: {
      palettes: [
        { name: 'Mono', colors: ['#18181b', '#52525b', '#a1a1aa', '#d4d4d8', '#71717a', '#3f3f46'] },
      ],
      paletteOptions: ['Mono'],
      selected: 'Mono',
    },
    cardCustomization: {
      padding: '8px',
      borderRadius: '0px',
      shadow: 'none',
      disableShadowOnHover: true,
      disableStroke: false,
    },
  },
};

// --- Chart color palettes ---

export const CHART_COLOR_PALETTES: Record<string, string[]> = {
  Default: ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'],
  Ocean: ['#0ea5e9', '#06b6d4', '#14b8a6', '#0284c7', '#0d9488', '#0369a1'],
  Sunset: ['#f43f5e', '#f97316', '#eab308', '#ec4899', '#fb923c', '#facc15'],
  Neon: ['#a855f7', '#ec4899', '#06b6d4', '#84cc16', '#f43f5e', '#6366f1'],
  Earth: ['#78716c', '#92400e', '#365314', '#1c1917', '#a16207', '#166534'],
  Pastel: ['#93c5fd', '#c4b5fd', '#fbcfe8', '#fed7aa', '#86efac', '#a5f3fc'],
};

// --- Component theme (ThemeType) presets ---

export type ComponentThemePreset = {
  button?: { primary?: string; secondary?: string; primaryText?: string; secondaryText?: string };
  checkbox?: { checked?: string; unChecked?: string };
  switch?: { enabled?: string; disabled?: string };
  drillBreadCrumbs?: { fontFamily?: string; fontColor?: string; activeColor?: string };
  multiSelectFilterDropdown?: { badgeColor?: string; badgeTextColor?: string };
  datePickerColor?: string;
  breakpoint?: { xl?: number; lg?: number; md?: number; sm?: number; xs?: number };
  metricLayoutCols?: { xl?: number; lg?: number; md?: number; sm?: number; xs?: number; xxs?: number };
};

export const COMPONENT_THEME_PRESETS: Record<string, ComponentThemePreset> = {
  'Brand Blue': {
    button: { primary: '#2563eb', primaryText: '#ffffff', secondary: '#e2e8f0', secondaryText: '#334155' },
    checkbox: { checked: '#2563eb', unChecked: '#cbd5e1' },
    switch: { enabled: '#2563eb', disabled: '#e2e8f0' },
    drillBreadCrumbs: { fontFamily: 'Inter', fontColor: '#64748b', activeColor: '#2563eb' },
    multiSelectFilterDropdown: { badgeColor: '#dbeafe', badgeTextColor: '#1e40af' },
    datePickerColor: '#2563eb',
  },
  'Purple Accent': {
    button: { primary: '#7c3aed', primaryText: '#ffffff', secondary: '#f3e8ff', secondaryText: '#6b21a8' },
    checkbox: { checked: '#7c3aed', unChecked: '#e9d5ff' },
    switch: { enabled: '#7c3aed', disabled: '#f3e8ff' },
    drillBreadCrumbs: { fontFamily: 'Inter', fontColor: '#7c3aed', activeColor: '#5b21b6' },
    multiSelectFilterDropdown: { badgeColor: '#ede9fe', badgeTextColor: '#5b21b6' },
    datePickerColor: '#7c3aed',
  },
  'Dark Teal': {
    button: { primary: '#0d9488', primaryText: '#ffffff', secondary: '#1e293b', secondaryText: '#94a3b8' },
    checkbox: { checked: '#14b8a6', unChecked: '#334155' },
    switch: { enabled: '#14b8a6', disabled: '#334155' },
    drillBreadCrumbs: { fontFamily: 'Inter', fontColor: '#94a3b8', activeColor: '#14b8a6' },
    multiSelectFilterDropdown: { badgeColor: '#134e4a', badgeTextColor: '#5eead4' },
    datePickerColor: '#14b8a6',
  },
};

// --- Default empty states ---

export const DEFAULT_ADMIN_THEME: AdminThemePreset = {
  general: { name: '', fontFamily: '' },
  dashboard: {},
  cardTitle: {},
  cardDescription: {},
  chart: {},
  cardCustomization: {},
};

export const DEFAULT_COMPONENT_THEME: ComponentThemePreset = {};
