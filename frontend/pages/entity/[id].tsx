import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Container, 
  Typography, 
  Box, 
  Breadcrumbs, 
  CircularProgress, 
  Card, 
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Chip,
  Grid,
  Paper
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { icd11Service } from '../../services/api';
import { ICD11Entity } from '../../types';
import config from '../../config';

export default function EntityDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [entity, setEntity] = useState<ICD11Entity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [children, setChildren] = useState<ICD11Entity[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchEntity = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const entityId = Array.isArray(id) ? id[0] : id;
        const entityData = await icd11Service.getEntityById(entityId);
        setEntity(entityData);
        
        // Load children if not a leaf node
        if (!entityData.isLeaf) {
          await fetchChildren(entityId);
        }
      } catch (err: any) {
        console.error('Error fetching entity:', err);
        setError(err.message || 'Failed to load entity details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEntity();
  }, [id]);
  
  const fetchChildren = async (entityId: string) => {
    setLoadingChildren(true);
    try {
      const response = await icd11Service.getEntityChildren(
        entityId, 
        config.app.defaultLanguage
      );
      setChildren(response.data);
    } catch (err) {
      console.error('Error fetching children:', err);
    } finally {
      setLoadingChildren(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading entity details...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.back()}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!entity) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Entity not found</Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.back()}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>{entity.title} - {config.app.name}</title>
        <meta name="description" content={`Details for ICD-11 entity: ${entity.title}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link href="/" passHref>
              <Button startIcon={<HomeIcon />} size="small">
                Home
              </Button>
            </Link>
            <Typography color="text.primary">Entity Details</Typography>
          </Breadcrumbs>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {entity.title}
          </Typography>
          
          {entity.code && (
            <Chip 
              label={`Code: ${entity.code}`} 
              color="primary" 
              variant="outlined" 
              sx={{ mr: 1, mb: 1 }}
            />
          )}
          
          {entity.isLeaf === false && (
            <Chip 
              label="Has children" 
              color="secondary" 
              variant="outlined" 
              sx={{ mr: 1, mb: 1 }}
            />
          )}
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                
                {entity.definition ? (
                  <Typography variant="body1" paragraph>
                    {entity.definition}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No description available
                  </Typography>
                )}
                
                {entity.longDefinition && (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Extended Description
                    </Typography>
                    <Typography variant="body1">
                      {entity.longDefinition}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
            
            {children.length > 0 && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Child Categories
                  </Typography>
                  
                  <List>
                    {children.map((child, index) => (
                      <Box key={child.id}>
                        {index > 0 && <Divider component="li" />}
                        <ListItem 
                          button 
                          component={Link} 
                          href={`/entity/${encodeURIComponent(child.id)}`}
                        >
                          <ListItemText 
                            primary={child.title} 
                            secondary={child.code ? `Code: ${child.code}` : undefined}
                          />
                        </ListItem>
                      </Box>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
            
            {loadingChildren && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Loading child categories...
                </Typography>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Entity Information
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText primary="ID" secondary={entity.id} />
                </ListItem>
                <Divider component="li" />
                
                {entity.code && (
                  <>
                    <ListItem>
                      <ListItemText primary="Code" secondary={entity.code} />
                    </ListItem>
                    <Divider component="li" />
                  </>
                )}
                
                <ListItem>
                  <ListItemText 
                    primary="Type" 
                    secondary={entity.isLeaf ? "Leaf entity (no children)" : "Category (has children)"}
                  />
                </ListItem>
              </List>
            </Paper>
            
            {entity.parent && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Parent Category
                </Typography>
                
                <Button
                  variant="outlined"
                  component={Link}
                  href={`/entity/${encodeURIComponent(entity.parent.id)}`}
                  fullWidth
                >
                  {entity.parent.title || 'View parent category'}
                </Button>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
} 