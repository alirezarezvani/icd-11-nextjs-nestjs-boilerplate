import React, { createContext, useContext, useEffect, ReactNode, useMemo } from 'react';
import { ThemeProvider, createTheme, Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useBranding } from './OrganizationContext';

interface CustomThemeContextType {
  theme: Theme;
  cssVariables: string;
  updateThemeFromBranding: () => void;
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined);

interface CustomThemeProviderProps {
  children: ReactNode;
}

export function CustomThemeProvider({ children }: CustomThemeProviderProps) {
  const { branding } = useBranding();
  
  // Create Material-UI theme from branding
  const createCustomTheme = () => {
    const theme = createTheme({
      palette: {
        mode: 'light',
        primary: {
          main: branding.colorScheme.primary,
        },
        secondary: {
          main: branding.colorScheme.secondary,
        },
        error: {
          main: branding.colorScheme.error,
        },
        warning: {
          main: branding.colorScheme.warning,
        },
        info: {
          main: branding.colorScheme.info,
        },
        success: {
          main: branding.colorScheme.success,
        },
        background: {
          default: branding.colorScheme.background,
          paper: branding.colorScheme.surface,
        },
        text: {
          primary: branding.colorScheme.text,
          secondary: branding.colorScheme.textSecondary,
        },
      },
      typography: {
        fontFamily: branding.typography.fontFamily,
        fontSize: parseFloat(branding.typography.fontSize.base) * 16,
        fontWeightLight: branding.typography.fontWeight.light,
        fontWeightRegular: branding.typography.fontWeight.normal,
        fontWeightMedium: branding.typography.fontWeight.medium,
        fontWeightBold: branding.typography.fontWeight.bold,
        h1: {
          fontSize: branding.typography.fontSize['4xl'],
          fontWeight: branding.typography.fontWeight.bold,
          lineHeight: branding.typography.lineHeight.tight,
        },
        h2: {
          fontSize: branding.typography.fontSize['3xl'],
          fontWeight: branding.typography.fontWeight.bold,
          lineHeight: branding.typography.lineHeight.tight,
        },
        h3: {
          fontSize: branding.typography.fontSize['2xl'],
          fontWeight: branding.typography.fontWeight.semibold,
          lineHeight: branding.typography.lineHeight.normal,
        },
        h4: {
          fontSize: branding.typography.fontSize.xl,
          fontWeight: branding.typography.fontWeight.semibold,
          lineHeight: branding.typography.lineHeight.normal,
        },
        h5: {
          fontSize: branding.typography.fontSize.lg,
          fontWeight: branding.typography.fontWeight.medium,
          lineHeight: branding.typography.lineHeight.normal,
        },
        h6: {
          fontSize: branding.typography.fontSize.base,
          fontWeight: branding.typography.fontWeight.medium,
          lineHeight: branding.typography.lineHeight.normal,
        },
        body1: {
          fontSize: branding.typography.fontSize.base,
          lineHeight: branding.typography.lineHeight.relaxed,
        },
        body2: {
          fontSize: branding.typography.fontSize.sm,
          lineHeight: branding.typography.lineHeight.normal,
        },
        caption: {
          fontSize: branding.typography.fontSize.xs,
          lineHeight: branding.typography.lineHeight.normal,
        },
      },
      shape: {
        borderRadius: parseFloat(branding.layout.borderRadius),
      },
      spacing: parseFloat(branding.layout.spacing.md) * 16,
      shadows: [
        'none',
        branding.layout.shadows.sm,
        branding.layout.shadows.md,
        branding.layout.shadows.md,
        branding.layout.shadows.lg,
        branding.layout.shadows.lg,
        branding.layout.shadows.xl,
        branding.layout.shadows.xl,
        branding.layout.shadows.xl,
        branding.layout.shadows.xl,
        branding.layout.shadows.xl,
        branding.layout.shadows.xl,
        branding.layout.shadows.xl,
        branding.layout.shadows.xl,
        branding.layout.shadows.xl,
        branding.layout.shadows.xl,
        branding.layout.shadows.xl,
        branding.layout.shadows.xl,
        branding.layout.shadows.xl,
        branding.layout.shadows.xl,
        branding.layout.shadows.xl,
        branding.layout.shadows.xl,
        branding.layout.shadows.xl,
        branding.layout.shadows.xl,
        branding.layout.shadows.xl,
      ],
      components: {
        MuiAppBar: {
          styleOverrides: {
            root: {
              height: branding.layout.headerHeight,
              minHeight: branding.layout.headerHeight,
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              width: branding.layout.sidebarWidth,
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: branding.layout.borderRadius,
              textTransform: 'none',
              fontWeight: branding.typography.fontWeight.medium,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: branding.layout.borderRadius,
              boxShadow: branding.layout.shadows.md,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: branding.layout.borderRadius,
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: branding.layout.borderRadius,
              },
            },
          },
        },
      },
    });

    return theme;
  };

  // Generate CSS variables from branding
  const generateCssVariables = () => {
    const cssVars: string[] = [];

    // Color scheme variables
    Object.entries(branding.colorScheme).forEach(([key, value]) => {
      cssVars.push(`  --color-${kebabCase(key)}: ${value};`);
    });

    // Typography variables
    cssVars.push(`  --font-family: ${branding.typography.fontFamily};`);
    
    Object.entries(branding.typography.fontSize).forEach(([key, value]) => {
      cssVars.push(`  --font-size-${key}: ${value};`);
    });
    
    Object.entries(branding.typography.fontWeight).forEach(([key, value]) => {
      cssVars.push(`  --font-weight-${key}: ${value};`);
    });
    
    Object.entries(branding.typography.lineHeight).forEach(([key, value]) => {
      cssVars.push(`  --line-height-${key}: ${value};`);
    });

    // Layout variables
    cssVars.push(`  --header-height: ${branding.layout.headerHeight};`);
    cssVars.push(`  --sidebar-width: ${branding.layout.sidebarWidth};`);
    cssVars.push(`  --border-radius: ${branding.layout.borderRadius};`);
    
    Object.entries(branding.layout.spacing).forEach(([key, value]) => {
      cssVars.push(`  --spacing-${key}: ${value};`);
    });
    
    Object.entries(branding.layout.shadows).forEach(([key, value]) => {
      cssVars.push(`  --shadow-${key}: ${value};`);
    });

    return `:root {\n${cssVars.join('\n')}\n}`;
  };

  const theme = useMemo(() => createCustomTheme(), [branding]);
  const cssVariables = useMemo(() => generateCssVariables(), [branding]);

  // Apply CSS variables to document
  useEffect(() => {
    const styleElement = document.getElementById('custom-theme-css');
    if (styleElement) {
      styleElement.textContent = cssVariables;
    } else {
      const newStyleElement = document.createElement('style');
      newStyleElement.id = 'custom-theme-css';
      newStyleElement.textContent = cssVariables;
      document.head.appendChild(newStyleElement);
    }

    // Apply font family to body
    document.body.style.fontFamily = branding.typography.fontFamily;

    // Clean up on unmount
    return () => {
      const styleElement = document.getElementById('custom-theme-css');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [cssVariables, branding.typography.fontFamily]);

  const updateThemeFromBranding = () => {
    // Force re-render by updating the key
    window.location.reload();
  };

  const contextValue: CustomThemeContextType = {
    theme,
    cssVariables,
    updateThemeFromBranding,
  };

  return (
    <CustomThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CustomThemeContext.Provider>
  );
}

export function useCustomTheme(): CustomThemeContextType {
  const context = useContext(CustomThemeContext);
  
  if (context === undefined) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider');
  }
  
  return context;
}

// Utility function to convert camelCase to kebab-case
function kebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}