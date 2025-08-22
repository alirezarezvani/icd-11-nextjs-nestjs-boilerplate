import React, { useState } from 'react';
import { NextPage } from 'next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  Alert,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Launch as LaunchIcon,
  LocalHospital as MedicalIcon,
  Category as CategoryIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { withRequiredAuth } from '../components/Auth/withAuth';
import { Layout } from '../components/Layout';

// Mock data for demonstration
const mockBookmarks = [
  {
    id: '1',
    type: 'entity',
    code: '5A11',
    title: 'Type 2 diabetes mellitus',
    category: 'Endocrine, nutritional or metabolic diseases',
    dateAdded: '2025-08-22T09:30:00Z',
    tags: ['diabetes', 'endocrine'],
  },
  {
    id: '2',
    type: 'entity',
    code: 'BA00',
    title: 'Essential hypertension',
    category: 'Diseases of the circulatory system',
    dateAdded: '2025-08-21T14:15:00Z',
    tags: ['hypertension', 'cardiovascular'],
  },
  {
    id: '3',
    type: 'entity',
    code: 'CA40.1',
    title: 'Community acquired pneumonia',
    category: 'Diseases of the respiratory system',
    dateAdded: '2025-08-21T10:45:00Z',
    tags: ['pneumonia', 'respiratory'],
  },
  {
    id: '4',
    type: 'search',
    query: 'cardiac arrest procedures',
    resultsCount: 24,
    dateAdded: '2025-08-20T16:20:00Z',
    tags: ['cardiac', 'emergency'],
  },
  {
    id: '5',
    type: 'entity',
    code: 'NA40.1',
    title: 'Closed fracture of shaft of femur',
    category: 'Injury, poisoning or certain other consequences',
    dateAdded: '2025-08-20T11:30:00Z',
    tags: ['fracture', 'bone', 'trauma'],
  },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`bookmarks-tabpanel-${index}`}
      aria-labelledby={`bookmarks-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const BookmarksPage: NextPage = () => {
  const { t } = useTranslation(['common', 'search']);
  const { user } = useAuth();
  const [searchFilter, setSearchFilter] = useState('');
  const [bookmarks, setBookmarks] = useState(mockBookmarks);
  const [tabValue, setTabValue] = useState(0);

  const filteredBookmarks = bookmarks.filter(item => {
    const searchTerm = searchFilter.toLowerCase();
    const matchesSearch = 
      (item.type === 'entity' && (
        item.title.toLowerCase().includes(searchTerm) ||
        item.code.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
      )) ||
      (item.type === 'search' && item.query.toLowerCase().includes(searchTerm)) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm));

    const matchesTab = 
      tabValue === 0 || // All
      (tabValue === 1 && item.type === 'entity') || // Entities
      (tabValue === 2 && item.type === 'search'); // Searches

    return matchesSearch && matchesTab;
  });

  const handleDeleteBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(item => item.id !== id));
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type: string) => {
    return type === 'entity' ? <MedicalIcon /> : <SearchIcon />;
  };

  const getTypeColor = (type: string) => {
    return type === 'entity' ? 'primary' : 'secondary';
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            <BookmarkIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            {t('common:navigation.bookmarks', 'Bookmarks')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Save and organize your favorite ICD-11 codes and searches
          </Typography>
        </Box>

        {/* Search and Filters */}
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ p: 3 }}>
            <TextField
              fullWidth
              placeholder="Search bookmarks..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchFilter && (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setSearchFilter('')}
                      size="small"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              size="small"
            />
            
            <Box sx={{ mt: 2 }}>
              <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                aria-label="bookmark tabs"
              >
                <Tab label="All Bookmarks" />
                <Tab label="Medical Codes" />
                <Tab label="Saved Searches" />
              </Tabs>
            </Box>
          </Box>
        </Paper>

        {/* Bookmarks Content */}
        <TabPanel value={tabValue} index={0}>
          {/* All Bookmarks */}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {/* Entity Bookmarks */}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          {/* Search Bookmarks */}
        </TabPanel>

        {/* Bookmarks Grid */}
        {filteredBookmarks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <BookmarkBorderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {bookmarks.length === 0 ? 'No bookmarks yet' : 'No bookmarks match your filter'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {bookmarks.length === 0 
                ? 'Start saving your favorite ICD-11 codes and searches'
                : `No bookmarks found for "${searchFilter}"`
              }
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredBookmarks.map((bookmark) => (
              <Grid item xs={12} sm={6} md={4} key={bookmark.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip
                        icon={getTypeIcon(bookmark.type)}
                        label={bookmark.type === 'entity' ? 'Medical Code' : 'Search'}
                        size="small"
                        color={getTypeColor(bookmark.type)}
                        variant="outlined"
                      />
                      <Box sx={{ flexGrow: 1 }} />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteBookmark(bookmark.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                    {bookmark.type === 'entity' ? (
                      <>
                        <Typography variant="h6" gutterBottom>
                          {bookmark.code}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {bookmark.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          <CategoryIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          {bookmark.category}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography variant="h6" gutterBottom>
                          "{bookmark.query}"
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {bookmark.resultsCount} results found
                        </Typography>
                      </>
                    )}

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {bookmark.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Saved on {formatDate(bookmark.dateAdded)}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<LaunchIcon />}
                      onClick={() => {
                        if (bookmark.type === 'entity') {
                          // Navigate to entity page
                          window.open(`/entity/${bookmark.code}`, '_blank');
                        } else {
                          // Navigate to search with query
                          window.open(`/search?q=${encodeURIComponent(bookmark.query)}`, '_blank');
                        }
                      }}
                    >
                      Open
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Coming Soon Notice */}
        <Box sx={{ mt: 4 }}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Note:</strong> This bookmarks page shows mock data for demonstration. 
              Full bookmark management and synchronization features will be available in future updates.
            </Typography>
          </Alert>
        </Box>
      </Container>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', [
      'common',
      'search',
      'medical',
      'errors',
      'accessibility',
    ])),
  },
});

export default withRequiredAuth(BookmarksPage);