import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  Accessibility as AccessibilityIcon,
  TextDecrease as TextDecreaseIcon,
  TextIncrease as TextIncreaseIcon,
  Contrast as ContrastIcon,
  MotionPhotosOff as MotionOffIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAccessibility } from './AccessibilityProvider';

interface AccessibilityMenuProps {
  anchorEl?: HTMLElement | null;
  open?: boolean;
  onClose?: () => void;
  inline?: boolean;
}

export function AccessibilityMenu({ anchorEl, open, onClose, inline = false }: AccessibilityMenuProps) {
  const {
    highContrast,
    reducedMotion,
    fontSize,
    screenReader,
    toggleHighContrast,
    toggleReducedMotion,
    setFontSize,
    announceToScreenReader,
  } = useAccessibility();

  const handleFontSizeChange = (event: React.MouseEvent<HTMLElement>, newSize: 'small' | 'medium' | 'large') => {
    if (newSize !== null) {
      setFontSize(newSize);
      announceToScreenReader(`Font size changed to ${newSize}`);
    }
  };

  const handleHighContrastToggle = () => {
    toggleHighContrast();
    announceToScreenReader(`High contrast mode ${!highContrast ? 'enabled' : 'disabled'}`);
  };

  const handleReducedMotionToggle = () => {
    toggleReducedMotion();
    announceToScreenReader(`Reduced motion ${!reducedMotion ? 'enabled' : 'disabled'}`);
  };

  const MenuContent = () => (
    <Box sx={{ width: inline ? 'auto' : 320, p: inline ? 0 : 2 }}>
      {inline && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Accessibility Settings
          </Typography>
          {onClose && (
            <IconButton
              size="small"
              onClick={onClose}
              aria-label="Close accessibility settings"
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      )}

      {/* Screen Reader Alert */}
      {screenReader && (
        <Alert severity="info" sx={{ mb: 2, fontSize: '0.875rem' }}>
          Screen reader detected. All interactive elements include proper ARIA labels and descriptions.
        </Alert>
      )}

      {/* Font Size Control */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom component="h3">
          Text Size
        </Typography>
        <ToggleButtonGroup
          value={fontSize}
          exclusive
          onChange={handleFontSizeChange}
          aria-label="font size selection"
          size="small"
          fullWidth
        >
          <ToggleButton
            value="small"
            aria-label="small text size"
          >
            <TextDecreaseIcon sx={{ mr: 0.5 }} />
            Small
          </ToggleButton>
          <ToggleButton
            value="medium"
            aria-label="medium text size"
          >
            Medium
          </ToggleButton>
          <ToggleButton
            value="large"
            aria-label="large text size"
          >
            <TextIncreaseIcon sx={{ mr: 0.5 }} />
            Large
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* High Contrast Toggle */}
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={highContrast}
              onChange={handleHighContrastToggle}
              name="high-contrast"
              aria-describedby="high-contrast-help"
            />
          }
          label={
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ContrastIcon fontSize="small" />
                <Typography variant="body2">High Contrast</Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                id="high-contrast-help"
              >
                Increases contrast for better visibility
              </Typography>
            </Box>
          }
        />
      </Box>

      {/* Reduced Motion Toggle */}
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={reducedMotion}
              onChange={handleReducedMotionToggle}
              name="reduced-motion"
              aria-describedby="reduced-motion-help"
            />
          }
          label={
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MotionOffIcon fontSize="small" />
                <Typography variant="body2">Reduce Motion</Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                id="reduced-motion-help"
              >
                Reduces animations and transitions
              </Typography>
            </Box>
          }
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Keyboard Navigation Help */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Keyboard Navigation
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div">
          • <kbd>Tab</kbd> - Navigate forward<br />
          • <kbd>Shift+Tab</kbd> - Navigate backward<br />
          • <kbd>Enter/Space</kbd> - Activate buttons<br />
          • <kbd>Esc</kbd> - Close dialogs and menus<br />
          • <kbd>Arrow keys</kbd> - Navigate within components
        </Typography>
      </Box>

      {/* WCAG Compliance Notice */}
      <Alert severity="success" sx={{ fontSize: '0.75rem' }}>
        <Typography variant="caption">
          This application follows WCAG 2.1 AA accessibility guidelines and is compatible with assistive technologies.
        </Typography>
      </Alert>
    </Box>
  );

  if (inline) {
    return (
      <Card>
        <CardContent>
          <MenuContent />
        </CardContent>
      </Card>
    );
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={open || false}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        elevation: 3,
        sx: {
          mt: 1,
        },
      }}
    >
      <MenuItem sx={{ p: 0, '&:hover': { backgroundColor: 'transparent' } }}>
        <MenuContent />
      </MenuItem>
    </Menu>
  );
}

export function AccessibilityButton() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Accessibility Settings">
        <IconButton
          onClick={handleClick}
          aria-label="accessibility settings"
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          color="inherit"
        >
          <AccessibilityIcon />
        </IconButton>
      </Tooltip>
      
      <AccessibilityMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      />
    </>
  );
}