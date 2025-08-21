import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Popover,
  Paper,
  Grid,
  Button,
} from '@mui/material';
import { Palette as PaletteIcon } from '@mui/icons-material';

interface ColorPickerProps {
  label: string;
  description?: string;
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

const PRESET_COLORS = [
  '#1976d2', '#dc004e', '#ed6c02', '#2e7d32', '#9c27b0',
  '#f57c00', '#d32f2f', '#1565c0', '#7b1fa2', '#388e3c',
  '#0288d1', '#c2185b', '#f9a825', '#1976d2', '#5e35b1',
  '#00acc1', '#8bc34a', '#ff9800', '#9e9e9e', '#607d8b',
];

export function ColorPicker({ label, description, value, onChange, disabled = false }: ColorPickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorChange = (color: string) => {
    onChange(color);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const color = event.target.value;
    if (isValidColor(color)) {
      onChange(color);
    }
  };

  const handlePresetClick = (color: string) => {
    onChange(color);
  };

  const handleColorInputClick = () => {
    if (colorInputRef.current) {
      colorInputRef.current.click();
    }
  };

  const isValidColor = (color: string): boolean => {
    // Check if it's a valid hex color
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexPattern.test(color)) {
      return true;
    }
    
    // Check if it's a valid CSS color name or other format
    const testElement = document.createElement('div');
    testElement.style.color = color;
    return testElement.style.color !== '';
  };

  const open = Boolean(anchorEl);
  const id = open ? `color-picker-${label}` : undefined;

  return (
    <Box>
      <Typography variant="body2" fontWeight="medium" gutterBottom>
        {label}
      </Typography>
      
      {description && (
        <Typography variant="caption" color="text.secondary" gutterBottom>
          {description}
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
        {/* Color Preview Button */}
        <IconButton
          onClick={handleClick}
          disabled={disabled}
          sx={{
            width: 40,
            height: 40,
            backgroundColor: value,
            border: '2px solid',
            borderColor: 'divider',
            '&:hover': {
              backgroundColor: value,
              borderColor: 'primary.main',
            },
          }}
          aria-label={`Pick color for ${label}`}
        >
          <PaletteIcon sx={{ fontSize: 16, color: getContrastColor(value) }} />
        </IconButton>

        {/* Color Value Input */}
        <TextField
          size="small"
          value={value}
          onChange={handleTextChange}
          disabled={disabled}
          placeholder="#000000"
          sx={{ flex: 1 }}
          inputProps={{
            style: { fontFamily: 'monospace', fontSize: '0.875rem' },
          }}
        />

        {/* Hidden Color Input */}
        <input
          ref={colorInputRef}
          type="color"
          value={value}
          onChange={(e) => handleColorChange(e.target.value)}
          style={{ display: 'none' }}
        />
      </Box>

      {/* Color Picker Popover */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ p: 2, width: 280 }}>
          {/* Current Color Preview */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Current Color
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 60,
                backgroundColor: value,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: getContrastColor(value),
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                }}
              >
                {value.toUpperCase()}
              </Typography>
            </Box>
          </Box>

          {/* Preset Colors */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Preset Colors
            </Typography>
            <Grid container spacing={0.5}>
              {PRESET_COLORS.map((color, index) => (
                <Grid size={{ xs: 'auto' }} key={index}>
                  <Button
                    variant="outlined"
                    onClick={() => handlePresetClick(color)}
                    sx={{
                      minWidth: 32,
                      width: 32,
                      height: 32,
                      padding: 0,
                      backgroundColor: color,
                      borderColor: value === color ? 'primary.main' : 'divider',
                      borderWidth: value === color ? 2 : 1,
                      '&:hover': {
                        backgroundColor: color,
                        borderColor: 'primary.main',
                      },
                    }}
                    aria-label={`Use color ${color}`}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Custom Color Picker */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Custom Color
            </Typography>
            <Button
              variant="outlined"
              onClick={handleColorInputClick}
              startIcon={<PaletteIcon />}
              fullWidth
            >
              Choose Custom Color
            </Button>
          </Box>
        </Paper>
      </Popover>
    </Box>
  );
}

// Helper function to determine if text should be light or dark based on background
function getContrastColor(hexColor: string): string {
  // Remove the hash if present
  const color = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff';
}