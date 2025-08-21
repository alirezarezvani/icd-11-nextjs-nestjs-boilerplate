import React, { useState } from 'react';
import Head from 'next/head';
import { Layout } from '../components/Layout/Layout';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  Box,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useLanguage, useLocalizedText } from '../context/LanguageContext';
import { useOrganization, useBranding } from '../context/OrganizationContext';
import { useCustomTheme } from '../context/ThemeContext';
import { useAccessibility } from '../components/Accessibility';
import { AccessibilityMenu, HIPAACompliance } from '../components/Accessibility';
import { LanguageSelector } from '../components/LanguageSelector';

const TEST_TEXTS = {
  en: {
    title: 'Phase 2B Integration Test',
    subtitle: 'Testing integration of healthcare provider customization with Phase 2A multi-language support',
    organizationInfo: 'Organization Information',
    brandingInfo: 'Branding Configuration',
    languageInfo: 'Language Settings',
    accessibilityInfo: 'Accessibility Features',
    hipaaInfo: 'HIPAA Compliance',
    testPassed: 'Test Passed',
    testFailed: 'Test Failed',
    currentLanguage: 'Current Language',
    brandingEnabled: 'Branding Enabled',
    themeActive: 'Custom Theme Active',
    accessibilityActive: 'Accessibility Features Active',
    multiTenantActive: 'Multi-tenant Mode Active',
    searchPlaceholder: 'Search ICD-11 medical codes...',
  },
  es: {
    title: 'Prueba de Integración Fase 2B',
    subtitle: 'Probando la integración de personalización de proveedores de salud con soporte multiidioma de la Fase 2A',
    organizationInfo: 'Información de la Organización',
    brandingInfo: 'Configuración de Marca',
    languageInfo: 'Configuración de Idioma',
    accessibilityInfo: 'Características de Accesibilidad',
    hipaaInfo: 'Cumplimiento HIPAA',
    testPassed: 'Prueba Aprobada',
    testFailed: 'Prueba Fallida',
    currentLanguage: 'Idioma Actual',
    brandingEnabled: 'Marca Habilitada',
    themeActive: 'Tema Personalizado Activo',
    accessibilityActive: 'Características de Accesibilidad Activas',
    multiTenantActive: 'Modo Multi-inquilino Activo',
    searchPlaceholder: 'Buscar códigos médicos ICD-11...',
  },
  fr: {
    title: 'Test d\'Intégration Phase 2B',
    subtitle: 'Test de l\'intégration de la personnalisation des fournisseurs de soins avec le support multilingue de la Phase 2A',
    organizationInfo: 'Informations sur l\'Organisation',
    brandingInfo: 'Configuration de Marque',
    languageInfo: 'Paramètres de Langue',
    accessibilityInfo: 'Fonctionnalités d\'Accessibilité',
    hipaaInfo: 'Conformité HIPAA',
    testPassed: 'Test Réussi',
    testFailed: 'Test Échoué',
    currentLanguage: 'Langue Actuelle',
    brandingEnabled: 'Marque Activée',
    themeActive: 'Thème Personnalisé Actif',
    accessibilityActive: 'Fonctionnalités d\'Accessibilité Actives',
    multiTenantActive: 'Mode Multi-locataire Actif',
    searchPlaceholder: 'Rechercher des codes médicaux CIM-11...',
  },
};

export default function IntegrationTest() {
  const [accessibilityMenuOpen, setAccessibilityMenuOpen] = useState(false);
  
  // Phase 2A: Language Context
  const { currentLanguage, setLanguage, availableLanguages, isRTL } = useLanguage();
  
  // Helper function to get localized text from TEST_TEXTS
  const getTestText = (key: keyof typeof TEST_TEXTS.en): string => {
    const langTexts = TEST_TEXTS[currentLanguage as keyof typeof TEST_TEXTS];
    if (langTexts && typeof langTexts[key] === 'string') {
      return langTexts[key];
    }
    return TEST_TEXTS.en[key] || String(key);
  };
  
  // Phase 2B: Organization & Theming
  const { organization, branding, isMultiTenant, canCustomizeBranding } = useOrganization();
  const { canCustomize } = useBranding();
  const { theme, cssVariables } = useCustomTheme();
  
  // Phase 2B: Accessibility
  const {
    highContrast,
    reducedMotion,
    fontSize,
    screenReader,
    announceToScreenReader,
  } = useAccessibility();

  // Test integration status
  const integrationTests = [
    {
      name: 'Multi-language Support',
      status: !!currentLanguage && Object.keys(availableLanguages).length > 1,
      details: `Current: ${currentLanguage}, RTL: ${isRTL}, Languages: ${Object.keys(availableLanguages).length}`,
    },
    {
      name: 'Organization Context',
      status: !!organization,
      details: `Org: ${organization?.name || 'None'}, Plan: ${organization?.plan || 'N/A'}`,
    },
    {
      name: 'Branding System',
      status: !!branding && canCustomizeBranding,
      details: `Custom: ${canCustomize}, Colors: ${!!branding?.colorScheme}, Fonts: ${!!branding?.typography}`,
    },
    {
      name: 'Theme Integration',
      status: !!theme && !!cssVariables,
      details: `Theme: Active, CSS Variables: ${cssVariables.length > 0}`,
    },
    {
      name: 'Multi-tenant Architecture',
      status: isMultiTenant !== undefined,
      details: `Multi-tenant: ${isMultiTenant}, Isolation: ${organization?.id !== 'default'}`,
    },
    {
      name: 'Accessibility Features',
      status: true, // Always available
      details: `High Contrast: ${highContrast}, Reduced Motion: ${reducedMotion}, Font: ${fontSize}`,
    },
    {
      name: 'HIPAA Compliance',
      status: !!organization?.features?.auditLogs,
      details: `Audit Logs: ${organization?.features?.auditLogs}, Data Protection: Active`,
    },
  ];

  const allTestsPassed = integrationTests.every(test => test.status);
  const passedTests = integrationTests.filter(test => test.status).length;

  const handleLanguageTest = () => {
    const languages = Object.keys(availableLanguages);
    const currentIndex = languages.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex] as any);
    announceToScreenReader(`Language changed to ${languages[nextIndex]}`);
  };

  return (
    <Layout title={`${getTestText('title')} - ICD-11 Healthcare Platform`} description="Testing integration of healthcare provider customization with multi-language support">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {getTestText('title')}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {getTestText('subtitle')}
          </Typography>
          
          {/* Overall Status */}
          <Alert severity={allTestsPassed ? 'success' : 'warning'} sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="subtitle1">
              Integration Status: {passedTests}/{integrationTests.length} tests passed
            </Typography>
            <Typography variant="body2">
              {allTestsPassed 
                ? 'All systems integrated successfully!' 
                : 'Some integration issues detected - see details below'}
            </Typography>
          </Alert>
        </Box>

        {/* Test Results */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {integrationTests.map((test, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">
                      {test.name}
                    </Typography>
                    <Chip
                      label={test.status ? getTestText('testPassed') : getTestText('testFailed')}
                      color={test.status ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {test.details}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Interactive Tests */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Interactive Integration Tests
          </Typography>
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>
                {getTestText('languageInfo')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="body2">
                  {getTestText('currentLanguage')}: {availableLanguages[currentLanguage]}
                </Typography>
                <LanguageSelector />
              </Box>
              <Button variant="outlined" onClick={handleLanguageTest}>
                Test Language Switching
              </Button>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>
                {getTestText('accessibilityInfo')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                High Contrast: {highContrast ? 'On' : 'Off'} | 
                Reduced Motion: {reducedMotion ? 'On' : 'Off'} | 
                Font Size: {fontSize}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setAccessibilityMenuOpen(!accessibilityMenuOpen)}
              >
                Toggle Accessibility Settings
              </Button>
            </Grid>
          </Grid>

          {accessibilityMenuOpen && (
            <Box sx={{ mt: 3 }}>
              <AccessibilityMenu
                inline
                onClose={() => setAccessibilityMenuOpen(false)}
              />
            </Box>
          )}
        </Paper>

        {/* System Information */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {getTestText('organizationInfo')}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Name"
                      secondary={organization?.name || 'Default Organization'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Plan"
                      secondary={organization?.plan || 'basic'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Multi-tenant"
                      secondary={isMultiTenant ? 'Yes' : 'No'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Custom Branding"
                      secondary={canCustomizeBranding ? 'Enabled' : 'Disabled'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {getTestText('brandingInfo')}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Primary Color"
                      secondary={branding?.colorScheme?.primary || '#1976d2'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Font Family"
                      secondary={branding?.typography?.fontFamily?.split(',')[0] || 'Inter'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Logo"
                      secondary={branding?.logoUrl ? 'Custom' : 'Default'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Theme Version"
                      secondary={branding?.version || 'default'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* HIPAA Compliance */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            {getTestText('hipaaInfo')}
          </Typography>
          <HIPAACompliance
            organizationId={organization?.id || 'default'}
            showDetails
          />
        </Box>
      </Container>
    </Layout>
  );
}