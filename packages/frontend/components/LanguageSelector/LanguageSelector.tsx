import React from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { SupportedLanguage } from '@shared/types/icd11';
import { useLanguage } from '../../context/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'standard' | 'outlined' | 'filled';
  size?: 'small' | 'medium';
  showLabel?: boolean;
  showIcon?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'outlined',
  size = 'small',
  showLabel = true,
  showIcon = true,
}) => {
  const { currentLanguage, setLanguage, availableLanguages, getLanguageName } = useLanguage();

  const handleLanguageChange = (event: any) => {
    setLanguage(event.target.value as SupportedLanguage);
  };

  return (
    <FormControl variant={variant} size={size} sx={{ minWidth: 120 }}>
      {showLabel && (
        <InputLabel id="language-selector-label">
          Language
        </InputLabel>
      )}
      <Select
        labelId="language-selector-label"
        value={currentLanguage}
        onChange={handleLanguageChange}
        label={showLabel ? "Language" : undefined}
        startAdornment={
          showIcon ? (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
              <LanguageIcon fontSize="small" />
            </Box>
          ) : undefined
        }
      >
        {Object.entries(availableLanguages).map(([code, name]) => (
          <MenuItem key={code} value={code}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" component="span">
                {name}
              </Typography>
              <Typography 
                variant="caption" 
                component="span" 
                color="text.secondary"
                sx={{ textTransform: 'uppercase' }}
              >
                ({code})
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;