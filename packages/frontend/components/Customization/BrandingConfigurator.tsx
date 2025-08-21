import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Snackbar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Palette as PaletteIcon,
  TextFields as TextFieldsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useBranding, useOrganization, OrganizationBranding } from '../../context/OrganizationContext';
import { ColorPicker } from './ColorPicker';

const FONT_FAMILIES = [
  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  'Open Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  'Lato, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  'Source Sans Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
];

const FONT_SIZES = {
  xs: { label: 'Extra Small', default: '0.75rem' },
  sm: { label: 'Small', default: '0.875rem' },
  base: { label: 'Base', default: '1rem' },
  lg: { label: 'Large', default: '1.125rem' },
  xl: { label: 'Extra Large', default: '1.25rem' },
  '2xl': { label: '2X Large', default: '1.5rem' },
  '3xl': { label: '3X Large', default: '1.875rem' },
  '4xl': { label: '4X Large', default: '2.25rem' },
};

export function BrandingConfigurator() {
  const { branding } = useBranding();
  const { organization, refreshBranding } = useOrganization();
  const [localBranding, setLocalBranding] = useState(branding);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({
    colors: true,
    typography: false,
  });

  const handlePanelChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanels(prev => ({ ...prev, [panel]: isExpanded }));
  };

  const handleColorChange = (colorKey: string, value: string) => {
    setLocalBranding(prev => ({
      ...prev,
      colorScheme: {
        ...prev.colorScheme,
        [colorKey]: value,
      },
    }));
  };

  const handleTypographyChange = (field: keyof OrganizationBranding['typography'], subField: string, value: any) => {
    setLocalBranding(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        [field]: {
          ...(prev.typography[field] as any),
          [subField]: value,
        },
      },
    }));
  };

  const handleFontFamilyChange = (value: string) => {
    setLocalBranding(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        fontFamily: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // In a real implementation, this would call the API
      // await fetch(`/api/organizations/${organization?.id}/branding`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(localBranding),
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await refreshBranding();
      setSaveMessage('Branding saved successfully!');
      
      // Apply changes immediately for preview
      const event = new CustomEvent('brandingUpdated', { detail: localBranding });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('Failed to save branding:', error);
      setSaveMessage('Failed to save branding. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalBranding(branding);
    setSaveMessage('Branding reset to saved version');
  };

  const colorSections = [
    {
      title: 'Primary Colors',
      colors: [
        { key: 'primary', label: 'Primary', description: 'Main brand color' },
        { key: 'secondary', label: 'Secondary', description: 'Secondary brand color' },
        { key: 'accent', label: 'Accent', description: 'Accent color for highlights' },
      ],
    },
    {
      title: 'Background Colors',
      colors: [
        { key: 'background', label: 'Background', description: 'Main background color' },
        { key: 'surface', label: 'Surface', description: 'Card and panel background' },
      ],
    },
    {
      title: 'Text Colors',
      colors: [
        { key: 'text', label: 'Text', description: 'Primary text color' },
        { key: 'textSecondary', label: 'Text Secondary', description: 'Secondary text color' },
      ],
    },
    {
      title: 'Status Colors',
      colors: [
        { key: 'error', label: 'Error', description: 'Error state color' },
        { key: 'warning', label: 'Warning', description: 'Warning state color' },
        { key: 'info', label: 'Info', description: 'Information state color' },
        { key: 'success', label: 'Success', description: 'Success state color' },
      ],
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Brand Configuration
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            disabled={isSaving}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      {/* Color Configuration */}
      <Accordion 
        expanded={expandedPanels.colors} 
        onChange={handlePanelChange('colors')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaletteIcon />
            <Typography variant="h6">Color Scheme</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {colorSections.map((section, sectionIndex) => (
            <Box key={section.title} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                {section.title}
              </Typography>
              <Grid container spacing={3}>
                {section.colors.map((color) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={color.key}>
                    <ColorPicker
                      label={color.label}
                      description={color.description}
                      value={localBranding.colorScheme[color.key as keyof typeof localBranding.colorScheme]}
                      onChange={(value) => handleColorChange(color.key, value)}
                    />
                  </Grid>
                ))}
              </Grid>
              {sectionIndex < colorSections.length - 1 && <Divider sx={{ mt: 3 }} />}
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Typography Configuration */}
      <Accordion 
        expanded={expandedPanels.typography} 
        onChange={handlePanelChange('typography')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextFieldsIcon />
            <Typography variant="h6">Typography</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Font Family */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Font Family</InputLabel>
                <Select
                  value={localBranding.typography.fontFamily}
                  label="Font Family"
                  onChange={(e) => handleFontFamilyChange(e.target.value)}
                >
                  {FONT_FAMILIES.map((font, index) => (
                    <MenuItem key={index} value={font}>
                      <Box sx={{ fontFamily: font }}>
                        {font.split(',')[0]}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Font Sizes */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                Font Sizes
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(FONT_SIZES).map(([size, config]) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={size}>
                    <TextField
                      label={config.label}
                      size="small"
                      value={localBranding.typography.fontSize[size as keyof typeof localBranding.typography.fontSize]}
                      onChange={(e) => handleTypographyChange('fontSize', size, e.target.value)}
                      placeholder={config.default}
                      fullWidth
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Font Weights */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                Font Weights
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(localBranding.typography.fontWeight).map(([weight, value]) => (
                  <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={weight}>
                    <TextField
                      label={weight.charAt(0).toUpperCase() + weight.slice(1)}
                      size="small"
                      type="number"
                      value={value}
                      onChange={(e) => handleTypographyChange('fontWeight', weight, parseInt(e.target.value))}
                      fullWidth
                      inputProps={{ min: 100, max: 900, step: 100 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Line Heights */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                Line Heights
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(localBranding.typography.lineHeight).map(([height, value]) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={height}>
                    <TextField
                      label={height.charAt(0).toUpperCase() + height.slice(1)}
                      size="small"
                      value={value}
                      onChange={(e) => handleTypographyChange('lineHeight', height, e.target.value)}
                      fullWidth
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Success Message */}
      <Snackbar
        open={!!saveMessage}
        autoHideDuration={6000}
        onClose={() => setSaveMessage(null)}
      >
        <Alert 
          onClose={() => setSaveMessage(null)} 
          severity={saveMessage?.includes('Failed') ? 'error' : 'success'}
        >
          {saveMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}