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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  Button,
  TextField,
  InputAdornment,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  History as HistoryIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Bookmark as BookmarkIcon,
  AccessTime as TimeIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { withRequiredAuth } from '../components/Auth/withAuth';
import { Layout } from '../components/Layout';

// Mock data for demonstration
const mockSearchHistory = [
  {
    id: '1',
    query: 'diabetes',
    timestamp: '2025-08-22T10:30:00Z',
    resultsCount: 45,
    language: 'en',
  },
  {
    id: '2',
    query: 'hypertension',
    timestamp: '2025-08-22T09:15:00Z',
    resultsCount: 32,
    language: 'en',
  },
  {
    id: '3',
    query: 'cardiac arrest',
    timestamp: '2025-08-21T16:45:00Z',
    resultsCount: 18,
    language: 'en',
  },
  {
    id: '4',
    query: 'pneumonia',
    timestamp: '2025-08-21T14:20:00Z',
    resultsCount: 28,
    language: 'en',
  },
  {
    id: '5',
    query: 'fracture',
    timestamp: '2025-08-21T11:10:00Z',
    resultsCount: 56,
    language: 'en',
  },
];

const HistoryPage: NextPage = () => {
  const { t } = useTranslation(['common', 'search']);
  const { user } = useAuth();
  const [searchFilter, setSearchFilter] = useState('');
  const [history, setHistory] = useState(mockSearchHistory);

  const filteredHistory = history.filter(item =>
    item.query.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleDeleteItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    setHistory([]);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            <HistoryIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            {t('common:navigation.history', 'Search History')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and manage your previous ICD-11 searches
          </Typography>
        </Box>

        {/* Search Filter */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="Filter search history..."
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
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleClearAll}
                disabled={history.length === 0}
              >
                Clear All
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* History List */}
        <Paper>
          {filteredHistory.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              {history.length === 0 ? (
                <Alert severity="info">
                  <Typography variant="body1">
                    No search history found. Start searching to see your history here.
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="info">
                  <Typography variant="body1">
                    No search history matches your filter "{searchFilter}".
                  </Typography>
                </Alert>
              )}
            </Box>
          ) : (
            <List>
              {filteredHistory.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ListItem
                    sx={{
                      py: 2,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" component="span">
                            "{item.query}"
                          </Typography>
                          <Chip
                            label={`${item.resultsCount} results`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={item.language.toUpperCase()}
                            size="small"
                            color="primary"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <TimeIcon sx={{ fontSize: 16 }} />
                          <Typography variant="body2" color="text.secondary">
                            {getTimeAgo(item.timestamp)} • {formatTimestamp(item.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          edge="end"
                          aria-label="bookmark"
                          size="small"
                        >
                          <BookmarkIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteItem(item.id)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < filteredHistory.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>

        {/* Coming Soon Notice */}
        <Box sx={{ mt: 4 }}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Note:</strong> This history page shows mock data for demonstration. 
              Full search history tracking and management features will be available in future updates.
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

export default withRequiredAuth(HistoryPage);