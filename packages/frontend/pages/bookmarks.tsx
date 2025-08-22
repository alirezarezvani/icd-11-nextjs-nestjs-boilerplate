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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Skeleton,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ButtonGroup,
  Autocomplete,
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
  Edit as EditIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useBookmarks } from '../hooks/useBookmarks';
import { withRequiredAuth } from '../components/Auth/withAuth';
import { Layout } from '../components/Layout';
import { BookmarkType, BookmarkItem } from '../services/api/bookmark.service';

// Bookmark Edit Dialog Component
interface BookmarkEditDialogProps {
  open: boolean;
  bookmark: BookmarkItem | null;
  onClose: () => void;
  onSave: (id: string, updates: { tags?: string[]; notes?: string }) => void;
}

const BookmarkEditDialog: React.FC<BookmarkEditDialogProps> = ({
  open,
  bookmark,
  onClose,
  onSave,
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (bookmark) {
      setTags(bookmark.tags || []);
      setNotes(bookmark.notes || '');
    }
  }, [bookmark]);

  const handleSave = () => {
    if (bookmark) {
      onSave(bookmark.id, { tags, notes });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Bookmark</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={tags}
            onChange={(_, newValue) => setTags(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags"
                placeholder="Add tags..."
                helperText="Press Enter to add a new tag"
              />
            )}
            sx={{ mb: 3 }}
          />
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this bookmark..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

// Bookmark Card Component
interface BookmarkCardProps {
  bookmark: BookmarkItem;
  onDelete: (id: string) => void;
  onEdit: (bookmark: BookmarkItem) => void;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, onDelete, onEdit }) => {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type: BookmarkType) => {
    return type === BookmarkType.ENTITY ? <MedicalIcon /> : <SearchIcon />;
  };

  const getTypeColor = (type: BookmarkType) => {
    return type === BookmarkType.ENTITY ? 'primary' : 'secondary';
  };

  const handleOpen = () => {
    if (bookmark.type === BookmarkType.ENTITY) {
      window.open(`/entity/${encodeURIComponent(bookmark.entityId!)}`, '_blank');
    } else {
      window.open(`/search?q=${encodeURIComponent(bookmark.searchTerm!)}`, '_blank');
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Chip
            icon={getTypeIcon(bookmark.type)}
            label={bookmark.type === BookmarkType.ENTITY ? 'Medical Code' : 'Search'}
            size="small"
            color={getTypeColor(bookmark.type)}
            variant="outlined"
          />
          <Box sx={{ flexGrow: 1 }} />
          <ButtonGroup size="small">
            <IconButton onClick={() => onEdit(bookmark)} title="Edit bookmark">
              <EditIcon />
            </IconButton>
            <IconButton 
              color="error" 
              onClick={() => onDelete(bookmark.id)}
              title="Delete bookmark"
            >
              <DeleteIcon />
            </IconButton>
          </ButtonGroup>
        </Box>

        {bookmark.type === BookmarkType.ENTITY ? (
          <>
            <Typography variant="h6" gutterBottom>
              {bookmark.entityCode}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {bookmark.entityTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <CategoryIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
              {bookmark.entityCategory}
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              &ldquo;{bookmark.searchTerm}&rdquo;
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {bookmark.searchResultsCount} results found
            </Typography>
          </>
        )}

        {bookmark.notes && (
          <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
            {bookmark.notes}
          </Typography>
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
          Saved on {formatDate(bookmark.createdAt)}
        </Typography>
      </CardContent>

      <CardActions>
        <Button
          size="small"
          startIcon={<LaunchIcon />}
          onClick={handleOpen}
        >
          Open
        </Button>
      </CardActions>
    </Card>
  );
};

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
  const [tabValue, setTabValue] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [editingBookmark, setEditingBookmark] = useState<BookmarkItem | null>(null);

  // Determine bookmark type filter based on tab
  const getTypeFilter = (): BookmarkType | undefined => {
    switch (tabValue) {
      case 1: return BookmarkType.ENTITY;
      case 2: return BookmarkType.SEARCH;
      default: return undefined;
    }
  };

  // Use the real bookmarks hook
  const {
    bookmarks,
    pagination,
    isLoading,
    error,
    deleteBookmark,
    updateBookmark,
    refreshBookmarks,
    goToPage,
    setLimit,
    setSearchFilter: setApiSearchFilter,
    setTypeFilter,
    hasNextPage,
    hasPreviousPage,
    isDeleting,
    isUpdating,
    getEntityBookmarks,
    getSearchBookmarks,
  } = useBookmarks({
    limit: itemsPerPage,
    type: getTypeFilter(),
  });

  // Debounce search filter updates
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setApiSearchFilter(searchFilter);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchFilter, setApiSearchFilter]);

  // Update type filter when tab changes
  React.useEffect(() => {
    setTypeFilter(getTypeFilter());
  }, [tabValue, setTypeFilter]);

  const handleDeleteBookmark = async (id: string) => {
    try {
      await deleteBookmark(id);
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
    }
  };

  const handleEditBookmark = (bookmark: BookmarkItem) => {
    setEditingBookmark(bookmark);
  };

  const handleSaveEdit = async (id: string, updates: { tags?: string[]; notes?: string }) => {
    try {
      await updateBookmark(id, updates);
      setEditingBookmark(null);
    } catch (error) {
      console.error('Failed to update bookmark:', error);
    }
  };

  const handleExportBookmarks = () => {
    const dataStr = JSON.stringify(bookmarks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookmarks-${new Date().toISOString().split('T')[0]}.json`;
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
              <BookmarkIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
              {t('common:navigation.bookmarks', 'Bookmarks')}
            </Typography>
            <ButtonGroup>
              <Button
                startIcon={<RefreshIcon />}
                onClick={refreshBookmarks}
                disabled={isLoading}
              >
                Refresh
              </Button>
              <Button
                startIcon={<ExportIcon />}
                onClick={handleExportBookmarks}
                disabled={bookmarks.length === 0}
              >
                Export
              </Button>
            </ButtonGroup>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Save and organize your favorite ICD-11 codes and searches ({pagination.total} total bookmarks)
          </Typography>
        </Box>

        {/* Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
              <TextField
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
                sx={{ minWidth: 300, flexGrow: 1 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Per Page</InputLabel>
                <Select
                  value={itemsPerPage}
                  label="Per Page"
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                >
                  <MenuItem value={6}>6</MenuItem>
                  <MenuItem value={12}>12</MenuItem>
                  <MenuItem value={24}>24</MenuItem>
                  <MenuItem value={48}>48</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              aria-label="bookmark tabs"
            >
              <Tab label={`All Bookmarks${pagination.total ? ` (${pagination.total})` : ''}`} />
              <Tab label={`Medical Codes${getEntityBookmarks().length ? ` (${getEntityBookmarks().length})` : ''}`} />
              <Tab label={`Saved Searches${getSearchBookmarks().length ? ` (${getSearchBookmarks().length})` : ''}`} />
            </Tabs>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body1">
              Failed to load bookmarks: {error.message}
            </Typography>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={32} />
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} />
                    <Box sx={{ mt: 2 }}>
                      <Skeleton variant="rectangular" width="100%" height={40} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          /* Bookmarks Content */
          <>
            {bookmarks.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <BookmarkBorderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchFilter ? 'No bookmarks match your filter' : 'No bookmarks yet'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchFilter 
                    ? `No bookmarks found for "${searchFilter}"`
                    : 'Start saving your favorite ICD-11 codes and searches'
                  }
                </Typography>
              </Box>
            ) : (
              <>
                <Grid container spacing={3}>
                  {bookmarks.map((bookmark) => (
                    <Grid item xs={12} sm={6} md={4} key={bookmark.id}>
                      <BookmarkCard
                        bookmark={bookmark}
                        onDelete={handleDeleteBookmark}
                        onEdit={handleEditBookmark}
                      />
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
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
          </>
        )}

        {/* Statistics */}
        {bookmarks.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bookmark Statistics
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="h4" color="primary">
                      {pagination.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Bookmarks
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" color="success.main">
                      {getEntityBookmarks().length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Medical Codes
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" color="secondary">
                      {getSearchBookmarks().length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Saved Searches
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Edit Dialog */}
        <BookmarkEditDialog
          open={!!editingBookmark}
          bookmark={editingBookmark}
          onClose={() => setEditingBookmark(null)}
          onSave={handleSaveEdit}
        />
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