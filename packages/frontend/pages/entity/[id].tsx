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
import Layout from '@/components/Layout';
import { Breadcrumb, ChildrenBrowser } from '@/components';
import { icd11Service } from '../../services/api';
import { ICD11Entity } from '@shared/types/icd11';
import config from '../../config';

export default function EntityDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [entity, setEntity] = useState<ICD11Entity | null>(null);
  const [parent, setParent] = useState<ICD11Entity | null>(null);
  const [ancestors, setAncestors] = useState<ICD11Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingBreadcrumb, setLoadingBreadcrumb] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchEntity = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const rawId = Array.isArray(id) ? id[0] : id;
        const entityId = decodeURIComponent(rawId);
        const entityData = await icd11Service.getEntity(entityId);
        setEntity(entityData);
        
        // Load parent for breadcrumb
        await fetchParent(entityId);
      } catch (err: any) {
        console.error('Error fetching entity:', err);
        setError(err.message || 'Failed to load entity details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEntity();
  }, [id]);
  
  const fetchParent = async (entityId: string) => {
    setLoadingBreadcrumb(true);
    try {
      const parentData = await icd11Service.getEntityParent(
        entityId, 
        config.app.defaultLanguage
      );
      setParent(parentData);
    } catch (err: any) {
      console.error('Error fetching parent:', err);
      // 404 means no parent exists (root entity or leaf entity)
      if (err?.response?.status === 404) {
        setParent(null);
      }
    } finally {
      setLoadingBreadcrumb(false);
    }
  };

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
    <Layout title={`${entity.title} | ICD-11 Healthcare Search`}>
      <Box sx={{ maxWidth: '6xl', mx: 'auto', p: 2 }}>
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          currentEntity={entity}
          ancestors={parent ? [parent] : []}
          loading={loadingBreadcrumb}
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
            
            {entity.isLeaf === false && (
              <Chip 
                label="Has children" 
                color="secondary"
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
          <Grid item xs={12} md={8}>
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
                    No description available for this ICD-11 entity. The WHO API does not provide a definition for "{entity.title}".
                  </Typography>
                )}
              </CardContent>
            </Card>
            
            {/* Children Browser - only show for non-leaf entities */}
            {!entity.isLeaf && (
              <ChildrenBrowser 
                parentEntity={entity}
                language={config.app.defaultLanguage}
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
          <Grid item xs={12} md={4}>
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
                    {entity.isLeaf ? "Leaf entity (no children)" : "Category (has children)"}
                  </Typography>
                </Box>
                
                {parent && (
                  <Box sx={{ mt: 3 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Parent Category
                    </Typography>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => router.push(`/entity/${encodeURIComponent(parent.id)}`)}
                    >
                      {parent.title || 'View parent category'}
                    </Button>
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