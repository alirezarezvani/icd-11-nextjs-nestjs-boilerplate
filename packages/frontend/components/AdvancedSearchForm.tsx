import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Collapse,
  IconButton,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterAlt as FilterIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { ICD11SearchParams, ICD11SearchCategory, ICD11SearchScope } from '@shared/types/icd11';

interface AdvancedSearchFormProps {
  searchParams: ICD11SearchParams;
  onSearchParamsChange: (params: Partial<ICD11SearchParams>) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

const SEARCH_CATEGORIES = Object.values(ICD11SearchCategory);
const SEARCH_SCOPES = Object.values(ICD11SearchScope);

// ICD-11 chapters for filtering
const ICD_CHAPTERS = [
  { code: '01', title: 'Certain infectious or parasitic diseases' },
  { code: '02', title: 'Neoplasms' },
  { code: '03', title: 'Diseases of the blood or blood-forming organs' },
  { code: '04', title: 'Diseases of the immune system' },
  { code: '05', title: 'Endocrine, nutritional or metabolic diseases' },
  { code: '06', title: 'Mental, behavioural or neurodevelopmental disorders' },
  { code: '07', title: 'Sleep-wake disorders' },
  { code: '08', title: 'Diseases of the nervous system' },
  { code: '09', title: 'Diseases of the visual system' },
  { code: '10', title: 'Diseases of the ear or mastoid process' },
  { code: '11', title: 'Diseases of the circulatory system' },
  { code: '12', title: 'Diseases of the respiratory system' },
  { code: '13', title: 'Diseases of the digestive system' },
  { code: '14', title: 'Diseases of the skin' },
  { code: '15', title: 'Diseases of the musculoskeletal system or connective tissue' },
  { code: '16', title: 'Diseases of the genitourinary system' },
  { code: '17', title: 'Conditions related to sexual health' },
  { code: '18', title: 'Pregnancy, childbirth or the puerperium' },
  { code: '19', title: 'Certain conditions originating in the perinatal period' },
  { code: '20', title: 'Developmental anomalies' },
  { code: '21', title: 'Symptoms, signs or clinical findings' },
  { code: '22', title: 'Injury, poisoning or certain other consequences of external causes' },
  { code: '23', title: 'External causes of morbidity or mortality' },
  { code: '24', title: 'Factors influencing health status or contact with health services' },
  { code: 'V', title: 'Supplementary codes' },
  { code: 'X', title: 'Extension codes' },
];

export const AdvancedSearchForm: React.FC<AdvancedSearchFormProps> = ({
  searchParams,
  onSearchParamsChange,
  onSearch,
  isLoading = false,
}) => {
  const { t } = useTranslation(['search', 'common']);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCategoryChange = (category: ICD11SearchCategory) => {
    const currentCategories = searchParams.categories || [];
    const updatedCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    onSearchParamsChange({ categories: updatedCategories });
  };

  const handleChapterChange = (chapter: string) => {
    onSearchParamsChange({ chapter: chapter || undefined });
  };

  const handleScopeChange = (scope: ICD11SearchScope) => {
    onSearchParamsChange({ scope });
  };

  const handleClearFilters = () => {
    onSearchParamsChange({
      categories: undefined,
      chapter: undefined,
      scope: ICD11SearchScope.ALL,
      includeDeprecated: false,
      leafNodesOnly: false,
    });
  };

  const hasActiveFilters = Boolean(
    searchParams.categories?.length ||
    searchParams.chapter ||
    (searchParams.scope && searchParams.scope !== ICD11SearchScope.ALL) ||
    searchParams.includeDeprecated ||
    searchParams.leafNodesOnly
  );

  const activeFiltersCount = [
    searchParams.categories?.length || 0,
    searchParams.chapter ? 1 : 0,
    (searchParams.scope && searchParams.scope !== ICD11SearchScope.ALL) ? 1 : 0,
    searchParams.includeDeprecated ? 1 : 0,
    searchParams.leafNodesOnly ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        {/* Advanced Search Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterIcon sx={{ mr: 1 }} />
              {t('search:advancedSearch.title', 'Advanced Search')}
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip
                size="small"
                label={`${activeFiltersCount} filter${activeFiltersCount !== 1 ? 's' : ''}`}
                color="primary"
                sx={{ ml: 2 }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {hasActiveFilters && (
              <Tooltip title={t('search:advancedSearch.clearFilters', 'Clear all filters')}>
                <IconButton onClick={handleClearFilters} size="small" color="error">
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            )}
            <IconButton
              onClick={() => setShowAdvanced(!showAdvanced)}
              sx={{
                transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        </Box>

        <Collapse in={showAdvanced}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {/* First Row - Categories and Scope */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              {/* Search Categories */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('search:advancedSearch.categories', 'Categories')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {SEARCH_CATEGORIES.map((category) => (
                    <Chip
                      key={category}
                      label={t(`search:categories.${category}`, category)}
                      clickable
                      variant={searchParams.categories?.includes(category) ? 'filled' : 'outlined'}
                      color={searchParams.categories?.includes(category) ? 'primary' : 'default'}
                      onClick={() => handleCategoryChange(category)}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>

              {/* Search Scope */}
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>
                    {t('search:advancedSearch.searchScope', 'Search Scope')}
                  </InputLabel>
                  <Select
                    value={searchParams.scope || ICD11SearchScope.ALL}
                    onChange={(e) => handleScopeChange(e.target.value as ICD11SearchScope)}
                    label={t('search:advancedSearch.searchScope', 'Search Scope')}
                  >
                    {SEARCH_SCOPES.map((scope) => (
                      <MenuItem key={scope} value={scope}>
                        {t(`search:scopes.${scope}`, scope)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Chapter Filter */}
            <FormControl fullWidth size="small">
              <InputLabel>
                {t('search:advancedSearch.chapter', 'ICD-11 Chapter')}
              </InputLabel>
              <Select
                value={searchParams.chapter || ''}
                onChange={(e) => handleChapterChange(e.target.value)}
                label={t('search:advancedSearch.chapter', 'ICD-11 Chapter')}
              >
                <MenuItem value="">
                  {t('search:advancedSearch.allChapters', 'All Chapters')}
                </MenuItem>
                {ICD_CHAPTERS.map((chapter) => (
                  <MenuItem key={chapter.code} value={chapter.code}>
                    Chapter {chapter.code}: {chapter.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider />

            {/* Additional Options */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={searchParams.includeDeprecated || false}
                    onChange={(e) => onSearchParamsChange({ includeDeprecated: e.target.checked })}
                    color="primary"
                  />
                }
                label={t('search:advancedSearch.includeDeprecated', 'Include deprecated codes')}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={searchParams.leafNodesOnly || false}
                    onChange={(e) => onSearchParamsChange({ leafNodesOnly: e.target.checked })}
                    color="primary"
                  />
                }
                label={t('search:advancedSearch.leafNodesOnly', 'Leaf nodes only')}
              />
            </Box>

            {/* Search Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={onSearch}
                disabled={isLoading || !searchParams.term?.trim()}
                size="large"
              >
                {t('search:advancedSearch.search', 'Search with Filters')}
              </Button>
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};