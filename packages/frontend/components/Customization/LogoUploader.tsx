import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  LinearProgress,
  Alert,
  Snackbar,
  Grid,
  Divider,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Visibility as PreviewIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useBranding, useOrganization } from '../../context/OrganizationContext';

interface FileUploadResult {
  id: string;
  url: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

interface LogoUploaderProps {
  type?: 'logo' | 'favicon';
}

export function LogoUploader({ type = 'logo' }: LogoUploaderProps) {
  const { branding } = useBranding();
  const { organization, refreshBranding } = useOrganization();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{ text: string; severity: 'success' | 'error' } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const currentUrl = type === 'logo' ? branding.logoUrl : branding.faviconUrl;
  const maxSize = type === 'logo' ? 5 * 1024 * 1024 : 1 * 1024 * 1024; // 5MB for logo, 1MB for favicon
  const acceptedTypes = type === 'logo' 
    ? ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp']
    : ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon'];

  const uploadFile = async (file: File): Promise<FileUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // In a real implementation, this would call the API
      // const response = await fetch(`/api/organizations/${organization?.id}/branding/upload/${type}`, {
      //   method: 'POST',
      //   body: formData,
      // });
      
      // if (!response.ok) {
      //   throw new Error('Upload failed');
      // }
      
      // const result = await response.json();
      
      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResult: FileUploadResult = {
        id: `${type}-${Date.now()}`,
        url: URL.createObjectURL(file),
        originalName: file.name,
        fileName: `${Date.now()}-${file.name}`,
        mimeType: file.type,
        fileSize: file.size,
      };

      setUploadProgress(100);
      clearInterval(progressInterval);
      
      return mockResult;
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setMessage({
        text: `Please select a valid ${type} file. Supported formats: ${acceptedTypes.join(', ')}`,
        severity: 'error',
      });
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setMessage({
        text: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
        severity: 'error',
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const result = await uploadFile(file);

      // Update branding with new URL
      // In a real implementation, this would update via API
      setMessage({
        text: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`,
        severity: 'success',
      });

      await refreshBranding();
    } catch (error) {
      console.error('Upload failed:', error);
      setMessage({
        text: `Failed to upload ${type}. Please try again.`,
        severity: 'error',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [type, acceptedTypes, maxSize, refreshBranding]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    handleFileSelect(event.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files);
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const handleDelete = async () => {
    try {
      // In a real implementation, this would call the API
      // await fetch(`/api/organizations/${organization?.id}/branding/delete/${type}`, {
      //   method: 'DELETE',
      // });

      setMessage({
        text: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`,
        severity: 'success',
      });

      await refreshBranding();
    } catch (error) {
      console.error('Delete failed:', error);
      setMessage({
        text: `Failed to delete ${type}. Please try again.`,
        severity: 'error',
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        {type === 'logo' ? 'Logo Upload' : 'Favicon Upload'}
      </Typography>

      <Grid container spacing={3}>
        {/* Current Asset */}
        {currentUrl && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current {type.charAt(0).toUpperCase() + type.slice(1)}
                </Typography>
                
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: type === 'logo' ? 120 : 60,
                    backgroundColor: 'grey.100',
                    borderRadius: 1,
                    mb: 2,
                    border: '1px dashed',
                    borderColor: 'grey.300',
                  }}
                >
                  <img
                    src={currentUrl}
                    alt={`Current ${type}`}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  <Button
                    size="small"
                    startIcon={<PreviewIcon />}
                    onClick={() => window.open(currentUrl, '_blank')}
                  >
                    Preview
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = currentUrl;
                      link.download = `${type}-${Date.now()}`;
                      link.click();
                    }}
                  >
                    Download
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Upload Area */}
        <Grid item xs={12} md={currentUrl ? 6 : 12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload New {type.charAt(0).toUpperCase() + type.slice(1)}
              </Typography>

              {/* Upload Progress */}
              {uploading && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    Uploading... {uploadProgress}%
                  </Typography>
                </Box>
              )}

              {/* Drop Zone */}
              <Box
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                sx={{
                  border: '2px dashed',
                  borderColor: dragOver ? 'primary.main' : 'grey.300',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: dragOver ? 'action.hover' : 'background.paper',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Drag and drop your {type} here
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  or click to browse files
                </Typography>

                <input
                  type="file"
                  accept={acceptedTypes.join(',')}
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                  id={`file-input-${type}`}
                  disabled={uploading}
                />
                
                <label htmlFor={`file-input-${type}`}>
                  <Button
                    component="span"
                    variant="contained"
                    disabled={uploading}
                    sx={{ mt: 2 }}
                  >
                    Select File
                  </Button>
                </label>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* File Requirements */}
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle2" gutterBottom>
                  File Requirements:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Supported formats: {acceptedTypes.join(', ')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Maximum file size: {formatFileSize(maxSize)}
                </Typography>
                {type === 'logo' && (
                  <Typography variant="body2" color="text.secondary">
                    • Recommended dimensions: 400x200px or similar aspect ratio
                  </Typography>
                )}
                {type === 'favicon' && (
                  <Typography variant="body2" color="text.secondary">
                    • Recommended dimensions: 32x32px or 16x16px
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success/Error Messages */}
      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={() => setMessage(null)}
      >
        <Alert
          onClose={() => setMessage(null)}
          severity={message?.severity}
        >
          {message?.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}