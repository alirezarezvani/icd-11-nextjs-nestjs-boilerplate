import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  CircularProgress,
  Popper,
  ClickAwayListener,
} from '@mui/material';
import {
  History as HistoryIcon,
  TrendingUp as TrendingIcon,
  LocalHospital as MedicalIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { searchSuggestionsService, SearchSuggestion } from '../services/api/search-suggestions.service';
import { useAuth } from '../hooks/useAuth';

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
}

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  value,
  onChange,
  onSearch,
  placeholder,
  autoFocus = false,
  fullWidth = true,
  disabled = false,
}) => {
  const { t } = useTranslation(['search', 'common']);
  const { isAuthenticated } = useAuth();
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const anchorRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchSuggestionsService.getSuggestions(query, 8);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Failed to fetch search suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search suggestions
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    onChange(newValue);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    onSearch(suggestion.text);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          onSearch(value);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleClickAway = () => {
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'history':
        return <HistoryIcon fontSize="small" />;
      case 'popular':
        return <TrendingIcon fontSize="small" />;
      case 'medical':
        return <MedicalIcon fontSize="small" />;
      default:
        return <SearchIcon fontSize="small" />;
    }
  };

  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case 'history':
        return t('search:suggestions.types.history', 'Recent');
      case 'popular':
        return t('search:suggestions.types.popular', 'Popular');
      case 'medical':
        return t('search:suggestions.types.medical', 'Medical');
      default:
        return '';
    }
  };

  const getSuggestionTypeColor = (type: string): "default" | "primary" | "secondary" => {
    switch (type) {
      case 'history':
        return 'primary';
      case 'popular':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box ref={anchorRef} sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
        <TextField
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          autoFocus={autoFocus}
          fullWidth={fullWidth}
          disabled={disabled}
          InputProps={{
            endAdornment: isLoading ? (
              <CircularProgress size={20} />
            ) : (
              <SearchIcon />
            ),
          }}
          variant="outlined"
        />

        <Popper
          open={showSuggestions && suggestions.length > 0}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          style={{ zIndex: 1300, width: anchorRef.current?.offsetWidth }}
        >
          <Paper elevation={8} sx={{ mt: 0.5, maxHeight: 400, overflow: 'auto' }}>
            <List dense>
              {suggestions.map((suggestion, index) => (
                <ListItemButton
                  key={`${suggestion.type}-${suggestion.text}`}
                  selected={index === selectedIndex}
                  onClick={() => handleSuggestionClick(suggestion)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {getSuggestionIcon(suggestion.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {suggestion.text}
                        </Typography>
                        <Chip
                          size="small"
                          label={getSuggestionTypeLabel(suggestion.type)}
                          color={getSuggestionTypeColor(suggestion.type)}
                          variant="outlined"
                        />
                        {suggestion.count && (
                          <Typography variant="caption" color="text.secondary">
                            ({suggestion.count})
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};