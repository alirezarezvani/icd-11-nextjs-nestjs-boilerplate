import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Pagination,
  Skeleton,
  Alert,
  Chip
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { ICD11Entity, SupportedLanguage } from '@shared/types/icd11';
import { PaginatedResponse } from '@shared/types/api';
import { icd11Service } from '../../services/api/icd11.service';

interface ChildrenBrowserProps {
  parentEntity: ICD11Entity;
  language?: SupportedLanguage;
}

export const ChildrenBrowser: React.FC<ChildrenBrowserProps> = ({
  parentEntity,
  language = 'en' as SupportedLanguage
}) => {
  const router = useRouter();
  const [children, setChildren] = useState<PaginatedResponse<ICD11Entity> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const loadChildren = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await icd11Service.getEntityChildren(
        parentEntity.id,
        language,
        page,
        limit
      );
      setChildren(result);
    } catch (err: any) {
      console.error('Failed to load children:', err);
      // If it's a 404, the entity probably doesn't have children
      if (err?.response?.status === 404) {
        setChildren({
          data: [],
          items: [],
          meta: { total: 0, page: 1, limit, totalPages: 0 },
          page: 1,
          limit,
          total: 0,
          totalPages: 0
        });
      } else {
        setError('Failed to load child categories');
      }
    } finally {
      setLoading(false);
    }
  }, [parentEntity.id, language, page, limit]);

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  const handleChildClick = (child: ICD11Entity) => {
    router.push(`/entity/${Buffer.from(child.id).toString('base64').replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' }[m]!))}`);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  if (loading && !children) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Child Categories
        </Typography>
        <Box>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} height={56} sx={{ mb: 1 }} />
          ))}
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Child Categories
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!children || children.data.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Child Categories
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No child categories found for this entity.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6">
          Child Categories
        </Typography>
        <Chip
          label={`${children.meta.total} items`}
          size="small"
          variant="outlined"
        />
      </Box>

      <Paper elevation={1}>
        <List disablePadding>
          {children.data.map((child, index) => (
            <ListItem
              key={child.id}
              disablePadding
              divider={index < children.data.length - 1}
            >
              <ListItemButton
                onClick={() => handleChildClick(child)}
                sx={{
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  {child.isLeaf ? (
                    <InsertDriveFileIcon color="action" />
                  ) : (
                    <FolderIcon color="primary" />
                  )}
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: child.isLeaf ? 'normal' : 'medium',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {child.title || 'Untitled'}
                    </Typography>
                    
                    {child.definition && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          mt: 0.5,
                        }}
                      >
                        {child.definition}
                      </Typography>
                    )}
                  </Box>
                  
                  {!child.isLeaf && (
                    <Chip
                      label="Category"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {children.meta.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={children.meta.totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ChildrenBrowser;