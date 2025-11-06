import { useTranslation } from 'next-i18next';
import { Tooltip, Chip, Box } from '@mui/material';
import { History as HistoryIcon, PersonOff as PersonOffIcon } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';

interface SearchHistoryTrackingIndicatorProps {
  isTrackingEnabled: boolean;
  lastSearchTracked: boolean;
  className?: string;
}

/**
 * Small indicator component that shows whether search history tracking is active
 * and provides feedback about the last search's tracking status
 */
export const SearchHistoryTrackingIndicator = ({
  isTrackingEnabled,
  lastSearchTracked,
  className = '',
}: SearchHistoryTrackingIndicatorProps) => {
  const { t } = useTranslation(['search', 'auth']);
  const { isAuthenticated } = useAuth();

  // Don't show anything if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const trackingStatus = {
    color: isTrackingEnabled && lastSearchTracked ? 'success' : 'default',
    icon: isTrackingEnabled ? <HistoryIcon fontSize="small" /> : <PersonOffIcon fontSize="small" />,
    label: isTrackingEnabled && lastSearchTracked 
      ? t('search:tracking.searchTracked')
      : isTrackingEnabled 
        ? t('search:tracking.trackingEnabled')
        : t('search:tracking.trackingDisabled'),
    tooltip: isTrackingEnabled 
      ? t('search:tracking.tooltips.enabled')
      : t('search:tracking.tooltips.disabled'),
  };

  return (
    <Box className={`flex items-center ${className}`}>
      <Tooltip title={trackingStatus.tooltip} arrow placement="top">
        <Chip
          icon={trackingStatus.icon}
          label={trackingStatus.label}
          color={trackingStatus.color as 'default' | 'success'}
          variant="outlined"
          size="small"
          sx={{
            fontSize: '0.75rem',
            height: 'auto',
            '& .MuiChip-label': {
              paddingX: 1,
              paddingY: 0.5,
            },
            '& .MuiChip-icon': {
              fontSize: '1rem',
            },
          }}
        />
      </Tooltip>
    </Box>
  );
};

/**
 * Hook for easy integration of the tracking indicator
 */
export const useSearchTrackingIndicator = (searchState: any) => {
  const Component = () => (
    <SearchHistoryTrackingIndicator
      isTrackingEnabled={searchState.isTrackingEnabled}
      lastSearchTracked={searchState.lastSearchTracked}
    />
  );

  return {
    TrackingIndicator: Component,
    isVisible: searchState.isTrackingEnabled,
  };
};

export default SearchHistoryTrackingIndicator;