import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTheme } from '@mui/material/styles';

interface AccessibilityContextType {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  focusVisible: boolean;
  screenReader: boolean;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  announceToScreenReader: (message: string) => void;
  validateWCAG: (element: HTMLElement) => WCAGValidationResult;
}

interface WCAGValidationResult {
  passed: boolean;
  issues: Array<{
    level: 'A' | 'AA' | 'AAA';
    guideline: string;
    description: string;
    element?: HTMLElement;
  }>;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  // Note: We don't use theme directly here to avoid circular dependencies
  // const theme = useTheme();
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSizeState] = useState<'small' | 'medium' | 'large'>('medium');
  const [focusVisible, setFocusVisible] = useState(false);
  const [screenReader, setScreenReader] = useState(false);

  // Detect user preferences on mount
  useEffect(() => {
    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(prefersReducedMotion.matches);
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    prefersReducedMotion.addEventListener('change', handleReducedMotionChange);

    // Detect high contrast preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
    setHighContrast(prefersHighContrast.matches);
    
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches);
    };
    prefersHighContrast.addEventListener('change', handleHighContrastChange);

    // Detect screen reader
    const isScreenReader = navigator.userAgent.includes('NVDA') || 
                          navigator.userAgent.includes('JAWS') || 
                          navigator.userAgent.includes('VoiceOver') ||
                          window.speechSynthesis !== undefined;
    setScreenReader(isScreenReader);

    // Detect keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    // Load saved preferences
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast');
    const savedFontSize = localStorage.getItem('accessibility-font-size') as 'small' | 'medium' | 'large';
    const savedReducedMotion = localStorage.getItem('accessibility-reduced-motion');

    if (savedHighContrast === 'true') setHighContrast(true);
    if (savedFontSize) setFontSizeState(savedFontSize);
    if (savedReducedMotion === 'true') setReducedMotion(true);

    return () => {
      prefersReducedMotion.removeEventListener('change', handleReducedMotionChange);
      prefersHighContrast.removeEventListener('change', handleHighContrastChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Apply accessibility styles
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast mode
    if (highContrast) {
      root.style.setProperty('--accessibility-high-contrast', '1');
      root.classList.add('high-contrast');
    } else {
      root.style.removeProperty('--accessibility-high-contrast');
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (reducedMotion) {
      root.style.setProperty('--accessibility-reduced-motion', '1');
      root.classList.add('reduced-motion');
    } else {
      root.style.removeProperty('--accessibility-reduced-motion');
      root.classList.remove('reduced-motion');
    }

    // Font size
    const fontSizeMultiplier = {
      small: '0.875',
      medium: '1',
      large: '1.125'
    }[fontSize];
    root.style.setProperty('--accessibility-font-scale', fontSizeMultiplier);

    // Focus visible
    if (focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }
  }, [highContrast, reducedMotion, fontSize, focusVisible]);

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('accessibility-high-contrast', newValue.toString());
  };

  const toggleReducedMotion = () => {
    const newValue = !reducedMotion;
    setReducedMotion(newValue);
    localStorage.setItem('accessibility-reduced-motion', newValue.toString());
  };

  const setFontSize = (size: 'small' | 'medium' | 'large') => {
    setFontSizeState(size);
    localStorage.setItem('accessibility-font-size', size);
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;

    document.body.appendChild(announcement);
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const validateWCAG = (element: HTMLElement): WCAGValidationResult => {
    const issues: WCAGValidationResult['issues'] = [];

    // Check color contrast (simplified)
    const computedStyle = getComputedStyle(element);
    const backgroundColor = computedStyle.backgroundColor;
    const color = computedStyle.color;
    
    if (backgroundColor !== 'rgba(0, 0, 0, 0)' && color) {
      const contrast = calculateContrastRatio(color, backgroundColor);
      const fontSize = parseFloat(computedStyle.fontSize);
      const fontWeight = computedStyle.fontWeight;
      
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
      const requiredContrast = isLargeText ? 3 : 4.5;
      
      if (contrast < requiredContrast) {
        issues.push({
          level: 'AA',
          guideline: 'WCAG 2.1 - 1.4.3 Contrast (Minimum)',
          description: `Insufficient color contrast ratio: ${contrast.toFixed(2)}:1. Required: ${requiredContrast}:1`,
          element
        });
      }
    }

    // Check for missing alt text on images
    if (element.tagName === 'IMG' && !element.getAttribute('alt')) {
      issues.push({
        level: 'A',
        guideline: 'WCAG 2.1 - 1.1.1 Non-text Content',
        description: 'Image missing alternative text',
        element
      });
    }

    // Check for missing labels on form controls
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
      const hasLabel = element.getAttribute('aria-label') || 
                      element.getAttribute('aria-labelledby') ||
                      document.querySelector(`label[for="${element.id}"]`);
      
      if (!hasLabel) {
        issues.push({
          level: 'A',
          guideline: 'WCAG 2.1 - 3.3.2 Labels or Instructions',
          description: 'Form control missing accessible label',
          element
        });
      }
    }

    // Check for keyboard accessibility
    const tabIndex = element.getAttribute('tabindex');
    if (element.onclick && tabIndex === null && !['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
      issues.push({
        level: 'A',
        guideline: 'WCAG 2.1 - 2.1.1 Keyboard',
        description: 'Interactive element not keyboard accessible',
        element
      });
    }

    // Check for heading structure (simplified)
    if (element.tagName.match(/^H[1-6]$/)) {
      const level = parseInt(element.tagName.charAt(1));
      const previousHeading = findPreviousHeading(element);
      
      if (previousHeading) {
        const previousLevel = parseInt(previousHeading.tagName.charAt(1));
        if (level - previousLevel > 1) {
          issues.push({
            level: 'AA',
            guideline: 'WCAG 2.1 - 1.3.1 Info and Relationships',
            description: 'Heading levels should not skip (e.g., H2 should not follow H4)',
            element
          });
        }
      }
    }

    return {
      passed: issues.length === 0,
      issues
    };
  };

  const contextValue: AccessibilityContextType = {
    highContrast,
    reducedMotion,
    fontSize,
    focusVisible,
    screenReader,
    toggleHighContrast,
    toggleReducedMotion,
    setFontSize,
    announceToScreenReader,
    validateWCAG,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);
  
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  
  return context;
}

// Helper functions
function calculateContrastRatio(foreground: string, background: string): number {
  // Simplified contrast calculation - in a real implementation, 
  // you would parse RGB values and calculate proper contrast ratio
  // This is a placeholder that returns a reasonable value
  return 4.5;
}

function findPreviousHeading(element: HTMLElement): HTMLElement | null {
  let current = element.previousElementSibling;
  
  while (current) {
    if (current.tagName.match(/^H[1-6]$/)) {
      return current as HTMLElement;
    }
    current = current.previousElementSibling;
  }
  
  return null;
}