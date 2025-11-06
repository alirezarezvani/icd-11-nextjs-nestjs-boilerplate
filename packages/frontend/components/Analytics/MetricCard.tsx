/**
 * MetricCard Component - Displays individual analytics metrics
 * Designed for healthcare dashboard with accessibility and responsive design
 */

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Skeleton,
  useTheme,
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  sx?: SxProps<Theme>;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  loading = false,
  trend,
  sx,
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Card sx={{ height: '100%', ...sx }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Skeleton variant="circular" width={48} height={48} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="70%" height={24} />
              <Skeleton variant="text" width="40%" height={32} />
              <Skeleton variant="text" width="60%" height={20} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: theme.shadows[4],
        },
        ...sx,
      }}
      role="article"
      aria-label={`Analytics metric: ${title}`}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {icon && (
            <Avatar
              sx={{
                bgcolor: `${color}.main`,
                color: `${color}.contrastText`,
                width: 48,
                height: 48,
              }}
            >
              {icon}
            </Avatar>
          )}
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ 
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                mb: 0.5,
              }}
            >
              {title}
            </Typography>
            
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
                mb: subtitle || trend ? 0.5 : 0,
                color: 'text.primary',
              }}
              aria-label={`${title}: ${typeof value === 'number' ? value.toLocaleString() : value}`}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: trend ? 0.5 : 0 }}
              >
                {subtitle}
              </Typography>
            )}
            
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: trend.isPositive ? 'success.main' : 'error.main',
                    fontWeight: 600,
                  }}
                >
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {trend.label}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MetricCard;