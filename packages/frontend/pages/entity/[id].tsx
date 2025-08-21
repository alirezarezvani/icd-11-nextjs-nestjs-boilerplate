import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Button,
  Divider
} from '@mui/material';
import { Home as HomeIcon, ArrowBack } from '@mui/icons-material';
import { Layout } from '../../components/Layout/Layout';
import { Breadcrumb, ChildrenBrowser } from '@/components';
import { icd11Service } from '../../services/api';
import { ICD11Entity, ICD11NavigationContext, ICD11EntityDetails } from '@shared/types/icd11';
import { useLanguage } from '../../context/LanguageContext';
import config from '../../config';

export default function EntityDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { currentLanguage } = useLanguage();
  
  const [navigationContext, setNavigationContext] = useState<ICD11NavigationContext | null>(null);
  const [entityDetails, setEntityDetails] = useState<ICD11EntityDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchEntityData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const rawId = Array.isArray(id) ? id[0] : id;
        // Decode URL-safe base64 encoding
        let entityId: string;
        try {
          // First try to decode as base64 (URL-safe)
          const base64 = rawId.replace(/[-_]/g, (m) => ({ '-': '+', '_': '/' }[m]!));
          const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
          entityId = Buffer.from(padded, 'base64').toString('utf-8');
        } catch {
          // Fallback to URL decoding for backward compatibility
          entityId = decodeURIComponent(rawId);
        }
        
        // Fetch navigation context and entity details in parallel
        const [navContext, details] = await Promise.all([
          icd11Service.getNavigationContext(entityId, currentLanguage),
          icd11Service.getEntityDetails(entityId, currentLanguage)
        ]);
        
        setNavigationContext(navContext);
        setEntityDetails(details);
      } catch (err: any) {
        console.error('Error fetching entity data:', err);
        setError(err.message || 'Failed to load entity details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEntityData();
  }, [id, currentLanguage]);
  
  const entity = navigationContext?.currentEntity || null;
  const parent = navigationContext?.parent || null;
  const ancestors = navigationContext?.ancestors || [];
  const breadcrumbs = navigationContext?.breadcrumbs || [];
  const children = navigationContext?.children || [];

  if (isLoading) {
    return (
      <Layout title="Loading... | ICD-11 Healthcare Search">
        <Box sx={{ maxWidth: '6xl', mx: 'auto', p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Error | ICD-11 Healthcare Search">
        <Box sx={{ maxWidth: 'md', mx: 'auto', p: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Error Loading Entity
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button 
              onClick={() => router.back()} 
              variant="outlined"
              startIcon={<ArrowBack />}
            >
              Go Back
            </Button>
          </Alert>
        </Box>
      </Layout>
    );
  }

  if (!entity) {
    return (
      <Layout title="Not Found | ICD-11 Healthcare Search">
        <Box sx={{ maxWidth: 'md', mx: 'auto', p: 2, textAlign: 'center', py: 8 }}>
          <Typography variant="h4" color="text.secondary" gutterBottom>
            Entity Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The requested entity could not be found.
          </Typography>
          <Button 
            onClick={() => router.back()} 
            variant="outlined"
            startIcon={<ArrowBack />}
          >
            Go Back
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout 
      title={entity ? `${entity.title} | ICD-11 Healthcare Search` : 'Loading... | ICD-11 Healthcare Search'}
      description={entity?.definition ? entity.definition.substring(0, 160) + '...' : 'WHO ICD-11 medical classification entity details'}
    >
      <Box sx={{ maxWidth: '6xl', mx: 'auto', p: 2 }}>
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          currentEntity={entity}
          ancestors={ancestors}
          breadcrumbs={breadcrumbs}
          loading={isLoading}
        />
        
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {entity.title}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {entity.code && (
              <Chip 
                label={`Code: ${entity.code}`} 
                variant="outlined"
                size="small"
              />
            )}
            
            
            <Chip 
              label={entity.isLeaf ? 'Leaf Entity' : 'Category'}
              color={entity.isLeaf ? 'default' : 'secondary'}
              size="small"
            />
          </Box>
        </Box>
        
        {/* Main Content Grid */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Description Card */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                {entity.definition && entity.definition.trim() ? (
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {entity.definition}
                  </Typography>
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No description available for this ICD-11 entity. The WHO API does not provide a definition for &quot;{entity.title}&quot;.
                  </Typography>
                )}
                
                {/* Long definition if available */}
                {entity.longDefinition && entity.longDefinition !== entity.definition && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Detailed Definition
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {entity.longDefinition}
                    </Typography>
                  </Box>
                )}
                
                {/* Coding rules if available */}
                {entityDetails?.codingRules && entityDetails.codingRules.length > 0 && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Coding Rules
                    </Typography>
                    {entityDetails.codingRules.map((rule, index) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {rule.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {rule.content}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
            
            {/* Children Browser - only show for non-leaf entities */}
            {!entity.isLeaf && (
              <ChildrenBrowser 
                parentEntity={entity}
                language={currentLanguage}
              />
            )}
            
            {/* Message for leaf entities */}
            {entity.isLeaf && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Classification Information
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    This is a terminal diagnostic code ({entity.code}) and does not have subcategories.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
          
          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Entity Information
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    ID
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 1, 
                      bgcolor: 'grey.50', 
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      wordBreak: 'break-all'
                    }}
                  >
                    {entity.id}
                  </Paper>
                </Box>
                
                {entity.code && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Code
                    </Typography>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 1, 
                        bgcolor: 'grey.50', 
                        fontFamily: 'monospace',
                        fontSize: '0.875rem'
                      }}
                    >
                      {entity.code}
                    </Paper>
                  </Box>
                )}
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Type
                  </Typography>
                  <Typography variant="body2">
                    {entity.isLeaf ? "Leaf entity (no children)" : "Category"}
                  </Typography>
                </Box>
                
                {/* Classification information */}
                {entity.classKind && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Classification
                    </Typography>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {entity.classKind}
                    </Typography>
                  </Box>
                )}
                
                {/* Children count */}
                {entityDetails?.childrenCount !== undefined && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Child Categories
                    </Typography>
                    <Typography variant="body2">
                      {entityDetails.childrenCount === 0 ? 'None' : entityDetails.childrenCount}
                    </Typography>
                  </Box>
                )}
                
                {/* Navigation */}
                {(parent || ancestors.length > 0) && (
                  <Box sx={{ mt: 3 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Navigation
                    </Typography>
                    
                    {parent && (
                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        sx={{ mb: 1 }}
                        onClick={() => router.push(`/entity/${Buffer.from(parent.id).toString('base64').replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' }[m]!))}`)}
                      >
                        ↑ {parent.title || 'Parent Category'}
                      </Button>
                    )}
                    
                    {ancestors.length > 1 && (
                      <Button
                        variant="text"
                        fullWidth
                        size="small"
                        onClick={() => router.push(`/entity/${Buffer.from(ancestors[0].id).toString('base64').replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' }[m]!))}`)}
                      >
                        ↑↑ {ancestors[0].title || 'Root Category'}
                      </Button>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
} 