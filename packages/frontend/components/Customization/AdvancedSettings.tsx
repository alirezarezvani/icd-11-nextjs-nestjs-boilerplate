import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Alert,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Code as CodeIcon,
  ViewQuilt as LayoutIcon,
  Visibility as PreviewIcon,
} from '@mui/icons-material';
import { useBranding, useOrganization } from '../../context/OrganizationContext';

interface AdvancedSettingsProps {
  type: 'layout' | 'css';
}

export function AdvancedSettings({ type }: AdvancedSettingsProps) {
  const { branding } = useBranding();
  const { organization, refreshBranding } = useOrganization();
  const [localBranding, setLocalBranding] = useState(branding);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [customCss, setCustomCss] = useState(branding.customCss || '');
  const [cssPreview, setCssPreview] = useState(false);

  const handleLayoutChange = (section: string, key: string, value: string) => {
    setLocalBranding(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        [section]: typeof (prev.layout as any)[section] === 'object' 
          ? { ...(prev.layout as any)[section], [key]: value }
          : value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const updateData = type === 'layout' 
        ? { layout: localBranding.layout }
        : { customCss };
      
      // In a real implementation, this would call the API
      // await fetch(`/api/organizations/${organization?.id}/branding`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updateData),
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await refreshBranding();
      setSaveMessage(`${type === 'layout' ? 'Layout' : 'CSS'} settings saved successfully!`);
      
      // Apply changes immediately for preview
      const event = new CustomEvent('brandingUpdated', { 
        detail: type === 'layout' ? localBranding : { ...branding, customCss } 
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveMessage(`Failed to save ${type} settings. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewCss = () => {
    setCssPreview(!cssPreview);
    if (!cssPreview && customCss) {
      // Apply CSS preview
      const event = new CustomEvent('brandingUpdated', { 
        detail: { ...branding, customCss } 
      });
      window.dispatchEvent(event);
    }
  };

  if (type === 'layout') {
    return (
      <Box>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LayoutIcon />
            <Typography variant="h5" component="h2">
              Layout & Spacing
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Layout'}
          </Button>
        </Box>

        {/* Layout Dimensions */}
        <Accordion defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Layout Dimensions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Header Height"
                  value={localBranding.layout.headerHeight}
                  onChange={(e) => handleLayoutChange('', 'headerHeight', e.target.value)}
                  fullWidth
                  placeholder="64px"
                  helperText="Height of the main navigation header"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Sidebar Width"
                  value={localBranding.layout.sidebarWidth}
                  onChange={(e) => handleLayoutChange('', 'sidebarWidth', e.target.value)}
                  fullWidth
                  placeholder="280px"
                  helperText="Width of the navigation sidebar"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Border Radius"
                  value={localBranding.layout.borderRadius}
                  onChange={(e) => handleLayoutChange('', 'borderRadius', e.target.value)}
                  fullWidth
                  placeholder="8px"
                  helperText="Default border radius for components"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Spacing */}
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Spacing Scale</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {Object.entries(localBranding.layout.spacing).map(([size, value]) => (
                <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={size}>
                  <TextField
                    label={size.toUpperCase()}
                    value={value}
                    onChange={(e) => handleLayoutChange('spacing', size, e.target.value)}
                    size="small"
                    fullWidth
                  />
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Shadows */}
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Shadow Styles</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {Object.entries(localBranding.layout.shadows).map(([size, value]) => (
                <Grid size={{ xs: 12, sm: 6 }} key={size}>
                  <TextField
                    label={`${size.toUpperCase()} Shadow`}
                    value={value}
                    onChange={(e) => handleLayoutChange('shadows', size, e.target.value)}
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Grid>
              ))}
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

  // CSS Editor
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CodeIcon />
          <Typography variant="h5" component="h2">
            Custom CSS
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={handlePreviewCss}
            disabled={!customCss}
          >
            {cssPreview ? 'Hide Preview' : 'Preview CSS'}
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save CSS'}
          </Button>
        </Box>
      </Box>

      {/* CSS Editor */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" gutterBottom>
            Custom CSS Editor
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add custom CSS to override default styles. Changes will be applied to your organization's interface.
          </Typography>
        </Box>
        
        <Box sx={{ p: 0 }}>
          <TextField
            value={customCss}
            onChange={(e) => setCustomCss(e.target.value)}
            multiline
            rows={20}
            fullWidth
            placeholder={`/* Add your custom CSS here */
.custom-header {
  background: linear-gradient(45deg, #1976d2, #42a5f5);
}

.custom-card {
  border: 2px solid var(--color-primary);
  box-shadow: var(--shadow-lg);
}

/* Available CSS Variables:
 * --color-primary, --color-secondary, --color-accent
 * --color-background, --color-surface, --color-text
 * --font-family, --font-size-*, --font-weight-*
 * --header-height, --sidebar-width, --border-radius
 * --spacing-*, --shadow-*
 */`}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                fontSize: '14px',
                '& fieldset': {
                  border: 'none',
                },
              },
            }}
          />
        </Box>
      </Paper>

      {/* CSS Guidelines */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          CSS Guidelines:
        </Typography>
        <Typography variant="body2" component="div">
          • Use CSS variables (shown in placeholder) for consistency with your brand colors
          <br />
          • Avoid using !important declarations when possible
          <br />
          • Test your CSS in different screen sizes using the preview panel
          <br />
          • Invalid CSS may cause display issues - please validate your code
        </Typography>
      </Alert>

      {/* CSS Variables Reference */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Available CSS Variables</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" gutterBottom>
                Colors:
              </Typography>
              <Box component="pre" sx={{ fontSize: '12px', fontFamily: 'monospace', mb: 2 }}>
{`--color-primary: ${branding.colorScheme.primary}
--color-secondary: ${branding.colorScheme.secondary}
--color-accent: ${branding.colorScheme.accent}
--color-background: ${branding.colorScheme.background}
--color-surface: ${branding.colorScheme.surface}
--color-text: ${branding.colorScheme.text}
--color-text-secondary: ${branding.colorScheme.textSecondary}
--color-error: ${branding.colorScheme.error}
--color-warning: ${branding.colorScheme.warning}
--color-info: ${branding.colorScheme.info}
--color-success: ${branding.colorScheme.success}`}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" gutterBottom>
                Layout & Typography:
              </Typography>
              <Box component="pre" sx={{ fontSize: '12px', fontFamily: 'monospace', mb: 2 }}>
{`--font-family: ${branding.typography.fontFamily}
--header-height: ${branding.layout.headerHeight}
--sidebar-width: ${branding.layout.sidebarWidth}
--border-radius: ${branding.layout.borderRadius}

/* Font sizes: --font-size-xs to --font-size-4xl */
/* Font weights: --font-weight-light to --font-weight-bold */
/* Spacing: --spacing-xs to --spacing-xl */
/* Shadows: --shadow-sm to --shadow-xl */`}
              </Box>
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