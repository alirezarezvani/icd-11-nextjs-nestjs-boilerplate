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
  Pagination,
  CircularProgress,
  Skeleton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  ButtonGroup,
} from '@mui/material';
import {
  History as HistoryIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  AccessTime as TimeIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
  Replay as ReplayIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useBookmarkStatus } from '../hooks/useBookmarks';
import { withRequiredAuth } from '../components/Auth/withAuth';
import { Layout } from '../components/Layout';
import { CreateSearchBookmarkDto } from '../services/api/bookmark.service';

// Search History Item Component
interface SearchHistoryItemProps {
  item: {
    id: string;
    searchTerm: string;
    language: string;
    resultsCount: number;
    isBookmarked: boolean;
    createdAt: string;
  };
  onDelete: (id: string) => void;
  onBookmark: (item: any) => void;
  onReplay: (searchTerm: string, language: string) => void;
}

const SearchHistoryItem: React.FC<SearchHistoryItemProps> = ({ 
  item, 
  onDelete, 
  onBookmark, 
  onReplay 
}) => {
  const { toggleBookmark, isLoading: isBookmarkLoading } = useBookmarkStatus(
    undefined, 
    item.searchTerm
  );

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

  const handleBookmarkToggle = async () => {
    const bookmarkData: CreateSearchBookmarkDto = {
      searchTerm: item.searchTerm,
      searchLanguage: item.language,
      searchResultsCount: item.resultsCount,
    };
    
    try {
      await toggleBookmark(bookmarkData);
      onBookmark(item);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  return (
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
              &ldquo;{item.searchTerm}&rdquo;
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
            {item.isBookmarked && (
              <Chip
                label="Bookmarked"
                size="small"
                color="secondary"
                icon={<BookmarkIcon />}
              />
            )}
          </Box>
        }
        secondary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <TimeIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2" color="text.secondary">
              {getTimeAgo(item.createdAt)} • {formatTimestamp(item.createdAt)}
            </Typography>
          </Box>
        }
      />
      <ListItemSecondaryAction>
        <ButtonGroup size="small">
          <IconButton
            aria-label="replay search"
            onClick={() => onReplay(item.searchTerm, item.language)}
            title="Run this search again"
          >
            <ReplayIcon />
          </IconButton>
          <IconButton
            aria-label="bookmark"
            onClick={handleBookmarkToggle}
            disabled={isBookmarkLoading}
            title={item.isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {isBookmarkLoading ? (
              <CircularProgress size={20} />
            ) : item.isBookmarked ? (
              <BookmarkIcon />
            ) : (
              <BookmarkBorderIcon />
            )}
          </IconButton>
          <IconButton
            aria-label="delete"
            onClick={() => onDelete(item.id)}
            color="error"
            title="Delete from history"
          >
            <DeleteIcon />
          </IconButton>
        </ButtonGroup>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const HistoryPage: NextPage = () => {
  const { t } = useTranslation(['common', 'search']);
  const { user } = useAuth();
  const [searchFilter, setSearchFilter] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Use the real search history hook
  const {
    searchHistory,
    topTerms,
    pagination,
    isLoading,
    error,
    deleteHistoryItem,
    clearHistory,
    refreshHistory,
    goToPage,
    setLimit,
    setSearchFilter: setApiSearchFilter,
    hasNextPage,
    hasPreviousPage,
    isDeleting,
    isClearing,
  } = useSearchHistory({
    limit: itemsPerPage,
  });

  // Debounce search filter updates
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setApiSearchFilter(searchFilter);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchFilter, setApiSearchFilter]);

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteHistoryItem(id);
    } catch (error) {
      console.error('Failed to delete history item:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearHistory();
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  const handleBookmarkItem = (item: any) => {
    // Refresh to update bookmark status
    refreshHistory();
  };

  const handleReplaySearch = (searchTerm: string, language: string) => {
    // Navigate to search page with the term
    window.location.href = `/search?q=${encodeURIComponent(searchTerm)}&language=${language}`;
  };

  const handleExportHistory = () => {
    // Export search history as JSON
    const dataStr = JSON.stringify(searchHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `search-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setLimit(newLimit);
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">
              <HistoryIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
              {t('common:navigation.history', 'Search History')}
            </Typography>
            <ButtonGroup>
              <Button
                startIcon={<RefreshIcon />}
                onClick={refreshHistory}
                disabled={isLoading}
              >
                Refresh
              </Button>
              <Button
                startIcon={<ExportIcon />}
                onClick={handleExportHistory}
                disabled={searchHistory.length === 0}
              >
                Export
              </Button>
            </ButtonGroup>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Review and manage your previous ICD-11 searches ({pagination.total} total searches)
          </Typography>
        </Box>

        {/* Top Search Terms */}
        {topTerms.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Most Searched Terms
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {topTerms.slice(0, 10).map((term) => (
                  <Chip
                    key={term.term}
                    label={`${term.term} (${term.count})`}
                    onClick={() => handleReplaySearch(term.term, 'en')}
                    clickable
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
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
                sx={{ minWidth: 300, flexGrow: 1 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Per Page</InputLabel>
                <Select
                  value={itemsPerPage}
                  label="Per Page"
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                color="error"
                startIcon={isClearing ? <CircularProgress size={16} /> : <DeleteIcon />}
                onClick={handleClearAll}
                disabled={searchHistory.length === 0 || isClearing}
              >
                Clear All
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body1">
              Failed to load search history: {error.message}
            </Typography>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <Paper>
            <Box sx={{ p: 3 }}>
              {[...Array(5)].map((_, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>
              ))}
            </Box>
          </Paper>
        ) : (
          /* History List */
          <Paper>
            {searchHistory.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Alert severity="info">
                  <Typography variant="body1">
                    {searchFilter ? 
                      `No search history matches your filter "${searchFilter}".` :
                      'No search history found. Start searching to see your history here.'
                    }
                  </Typography>
                </Alert>
              </Box>
            ) : (
              <>
                <List>
                  {searchHistory.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <SearchHistoryItem
                        item={item}
                        onDelete={handleDeleteItem}
                        onBookmark={handleBookmarkItem}
                        onReplay={handleReplaySearch}
                      />
                      {index < searchHistory.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                      count={pagination.totalPages}
                      page={pagination.page}
                      onChange={(_, page) => goToPage(page)}
                      color="primary"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </>
            )}
          </Paper>
        )}

        {/* Statistics */}
        {searchHistory.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Search Statistics
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="h4" color="primary">
                      {pagination.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Searches
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" color="secondary">
                      {searchHistory.filter(item => item.isBookmarked).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bookmarked
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" color="success.main">
                      {Math.round(searchHistory.reduce((sum, item) => sum + item.resultsCount, 0) / searchHistory.length)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Results
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
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