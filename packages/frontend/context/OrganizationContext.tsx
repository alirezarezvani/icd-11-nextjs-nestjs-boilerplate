import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface OrganizationBranding {
  id: string;
  logoUrl?: string;
  faviconUrl?: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    warning: string;
    info: string;
    success: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
  };
  layout: {
    headerHeight: string;
    sidebarWidth: string;
    borderRadius: string;
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
  customCss?: string;
  version: string;
  isActive: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  description?: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'basic' | 'professional' | 'enterprise';
  features: {
    customBranding: boolean;
    whiteLabel: boolean;
    apiAccess: boolean;
    auditLogs: boolean;
    ssoIntegration: boolean;
    customDomain: boolean;
  };
  branding?: OrganizationBranding[];
  createdAt: string;
  updatedAt: string;
}

interface OrganizationContextType {
  organization: Organization | null;
  branding: OrganizationBranding | null;
  isLoading: boolean;
  error: string | null;
  setOrganization: (org: Organization) => void;
  setBranding: (branding: OrganizationBranding) => void;
  refreshBranding: () => Promise<void>;
  isMultiTenant: boolean;
  canCustomizeBranding: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
  organizationSlug?: string;
  domain?: string;
}

const DEFAULT_ORGANIZATION: Organization = {
  id: 'default',
  name: 'ICD-11 Healthcare Platform',
  slug: 'default',
  status: 'active',
  plan: 'basic',
  features: {
    customBranding: false,
    whiteLabel: false,
    apiAccess: true,
    auditLogs: false,
    ssoIntegration: false,
    customDomain: false,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_BRANDING: OrganizationBranding = {
  id: 'default',
  colorScheme: {
    primary: '#1976d2',
    secondary: '#dc004e',
    accent: '#ed6c02',
    background: '#fafafa',
    surface: '#ffffff',
    text: '#212121',
    textSecondary: '#757575',
    error: '#d32f2f',
    warning: '#ed6c02',
    info: '#0288d1',
    success: '#2e7d32',
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.625',
    },
  },
  layout: {
    headerHeight: '64px',
    sidebarWidth: '280px',
    borderRadius: '8px',
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
  },
  version: 'default',
  isActive: true,
};

export function OrganizationProvider({ 
  children, 
  organizationSlug,
  domain 
}: OrganizationProviderProps) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [branding, setBranding] = useState<OrganizationBranding | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMultiTenant = !!(organizationSlug || domain);
  const canCustomizeBranding = organization?.features?.customBranding ?? false;

  const loadOrganizationData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let org: Organization = DEFAULT_ORGANIZATION;
      let brand: OrganizationBranding = DEFAULT_BRANDING;

      if (isMultiTenant) {
        // In a real implementation, fetch from API
        // const response = await fetch(`/api/organizations/${organizationSlug || `domain/${domain}`}`);
        // if (response.ok) {
        //   org = await response.json();
        //   const brandingResponse = await fetch(`/api/organizations/${org.id}/branding`);
        //   if (brandingResponse.ok) {
        //     brand = await brandingResponse.json();
        //   }
        // }
        
        // For now, use mock data based on slug/domain
        if (organizationSlug) {
          org = {
            ...DEFAULT_ORGANIZATION,
            id: organizationSlug,
            name: `${organizationSlug.charAt(0).toUpperCase()}${organizationSlug.slice(1)} Healthcare`,
            slug: organizationSlug,
            plan: 'professional',
            features: {
              ...DEFAULT_ORGANIZATION.features,
              customBranding: true,
              auditLogs: true,
            },
          };
        }
      }

      setOrganization(org);
      setBranding(brand);
    } catch (err) {
      console.error('Failed to load organization data:', err);
      setError('Failed to load organization data');
      // Fallback to defaults
      setOrganization(DEFAULT_ORGANIZATION);
      setBranding(DEFAULT_BRANDING);
    } finally {
      setIsLoading(false);
    }
  };

  // Load organization and branding data
  useEffect(() => {
    loadOrganizationData();
  }, [organizationSlug, domain]);

  const refreshBranding = async () => {
    if (!organization) return;
    
    try {
      // In a real implementation, fetch fresh branding data
      // const response = await fetch(`/api/organizations/${organization.id}/branding`);
      // if (response.ok) {
      //   const freshBranding = await response.json();
      //   setBranding(freshBranding);
      // }
      
      // For now, just reload
      await loadOrganizationData();
    } catch (err) {
      console.error('Failed to refresh branding:', err);
    }
  };

  const contextValue: OrganizationContextType = {
    organization,
    branding,
    isLoading,
    error,
    setOrganization,
    setBranding,
    refreshBranding,
    isMultiTenant,
    canCustomizeBranding,
  };

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization(): OrganizationContextType {
  const context = useContext(OrganizationContext);
  
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  
  return context;
}

// Hook to get the current branding configuration
export function useBranding() {
  const { branding, canCustomizeBranding } = useOrganization();
  
  return {
    branding: branding || DEFAULT_BRANDING,
    canCustomize: canCustomizeBranding,
    isDefault: branding?.id === 'default',
  };
}