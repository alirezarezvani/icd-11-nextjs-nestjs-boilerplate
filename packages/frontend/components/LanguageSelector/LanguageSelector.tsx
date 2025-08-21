import React, { useState } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  Box,
  Typography,
  Tooltip,
  ButtonBase,
  Popper,
  Paper,
  ClickAwayListener,
  Fade,
} from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { SupportedLanguage } from '@shared/types/icd11';
import { useLanguage } from '../../context/LanguageContext';
import { FlagIcon } from './FlagIcon';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'compact' | 'menu';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showLanguageName?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'compact',
  size = 'medium',
  showLabel = false,
  showLanguageName = false,
}) => {
  const { currentLanguage, setLanguage, availableLanguages, getLanguageName, isRTL } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = (language: SupportedLanguage) => {
    setLanguage(language);
    handleClose();
  };

  // Compact flag-only selector for navigation
  if (variant === 'compact') {
    return (
      <>
        <Tooltip title={`Language: ${getLanguageName(currentLanguage)}`} placement="bottom">
          <ButtonBase
            onClick={handleClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(45, 55, 72, 0.06)',
              border: '1px solid rgba(45, 55, 72, 0.15)',
              color: '#2d3748',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(15, 76, 117, 0.1)',
                borderColor: 'rgba(15, 76, 117, 0.2)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
              '&:focus-visible': {
                outline: '2px solid rgba(15, 76, 117, 0.8)',
                outlineOffset: '2px',
              },
            }}
            aria-label={`Current language: ${getLanguageName(currentLanguage)}. Press Enter or Space to open language menu`}
            aria-haspopup="listbox"
            aria-expanded={open}
            role="combobox"
          >
            <FlagIcon language={currentLanguage} size={size === 'small' ? 'small' : 'medium'} />
            {showLanguageName && (
              <Typography 
                variant="body2" 
                sx={{ 
                  ml: 1, 
                  fontSize: size === 'small' ? '0.75rem' : '0.875rem',
                  fontWeight: 500,
                }}
              >
                {currentLanguage.toUpperCase()}
              </Typography>
            )}
            <KeyboardArrowDown 
              sx={{ 
                fontSize: '16px', 
                opacity: 0.7,
                transition: 'transform 0.2s ease-in-out',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              }} 
            />
          </ButtonBase>
        </Tooltip>
        
        <Popper 
          open={open} 
          anchorEl={anchorEl} 
          placement={isRTL ? "bottom-start" : "bottom-end"}
          transition
          sx={{ zIndex: 1300 }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={200}>
              <Paper
                elevation={8}
                sx={{
                  mt: 1,
                  py: 1,
                  minWidth: '180px',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                }}
              >
                <ClickAwayListener onClickAway={handleClose}>
                  <Box role="listbox" aria-label="Language selection menu">
                    {Object.entries(availableLanguages).map(([code, name]) => (
                      <MenuItem
                        key={code}
                        onClick={() => handleLanguageSelect(code as SupportedLanguage)}
                        selected={code === currentLanguage}
                        role="option"
                        aria-selected={code === currentLanguage}
                        sx={{
                          px: 2,
                          py: 1.5,
                          gap: 2,
                          borderRadius: '8px',
                          mx: 1,
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(15, 76, 117, 0.08)',
                            '&:hover': {
                              backgroundColor: 'rgba(15, 76, 117, 0.12)',
                            },
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                          '&:focus-visible': {
                            outline: '2px solid rgba(15, 76, 117, 0.8)',
                            outlineOffset: '-2px',
                          },
                        }}
                      >
                        <FlagIcon language={code as SupportedLanguage} size="medium" />
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: code === currentLanguage ? 600 : 400,
                              color: 'text.primary',
                              lineHeight: 1.2,
                            }}
                          >
                            {name}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              fontSize: '0.7rem',
                            }}
                          >
                            {code}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Box>
                </ClickAwayListener>
              </Paper>
            </Fade>
          )}
        </Popper>
      </>
    );
  }

  // Menu variant for mobile drawer
  if (variant === 'menu') {
    return (
      <FormControl size={size} sx={{ minWidth: '100%' }}>
        <Select
          value={currentLanguage}
          onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
          size={size}
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 1,
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(45, 55, 72, 0.04)',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'rgba(15, 76, 117, 0.08)',
              },
              '&.Mui-focused': {
                backgroundColor: 'rgba(15, 76, 117, 0.08)',
              },
            },
          }}
        >
          {Object.entries(availableLanguages).map(([code, name]) => (
            <MenuItem key={code} value={code}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FlagIcon language={code as SupportedLanguage} size="small" />
                <Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: code === currentLanguage ? 600 : 400,
                      color: 'text.primary',
                    }}
                  >
                    {name}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.7rem',
                    }}
                  >
                    {code.toUpperCase()}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  // Fallback to original Material-UI Select for other variants
  return (
    <FormControl size={size} sx={{ minWidth: 120 }}>
      {showLabel && (
        <Typography variant="caption" sx={{ mb: 1, color: 'text.secondary' }}>
          Language
        </Typography>
      )}
      <Select
        value={currentLanguage}
        onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
        size={size}
        sx={{
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          },
        }}
      >
        {Object.entries(availableLanguages).map(([code, name]) => (
          <MenuItem key={code} value={code}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FlagIcon language={code as SupportedLanguage} size="small" />
              <Box>
                <Typography variant="body2">{name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {code.toUpperCase()}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;