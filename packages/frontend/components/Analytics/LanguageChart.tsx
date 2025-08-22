/**
 * LanguageChart Component - Displays search language distribution
 * Uses accessible pie chart with proper color coding and labels
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  Skeleton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface LanguageData {
  language: string;
  count: number;
}

interface LanguageChartProps {
  data: LanguageData[];
  loading?: boolean;
  title?: string;
}

// Language display names and colors
const LANGUAGE_CONFIG = {
  en: { name: 'English', color: '#1976d2' },
  es: { name: 'Spanish', color: '#ed6c02' },
  fr: { name: 'French', color: '#2e7d32' },
  ar: { name: 'Arabic', color: '#9c27b0' },
  zh: { name: 'Chinese', color: '#d32f2f' },
  ru: { name: 'Russian', color: '#0288d1' },
} as const;

const DEFAULT_COLORS = ['#1976d2', '#ed6c02', '#2e7d32', '#9c27b0', '#d32f2f', '#0288d1'];

export const LanguageChart: React.FC<LanguageChartProps> = ({
  data,
  loading = false,
  title = 'Search Languages',
}) => {
  const theme = useTheme();

  // Prepare chart data with proper labels and colors
  const chartData = data.map((item, index) => {
    const config = LANGUAGE_CONFIG[item.language as keyof typeof LANGUAGE_CONFIG];
    return {
      ...item,
      name: config?.name || item.language.toUpperCase(),
      color: config?.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    };
  });

  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = total > 0 ? ((data.count / total) * 100).toFixed(1) : '0';
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 2,
            borderRadius: 1,
            boxShadow: theme.shadows[4],
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.count.toLocaleString()} searches ({percentage}%)
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader
          title={<Skeleton variant="text" width="60%" height={32} />}
        />
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Skeleton variant="circular" width={200} height={200} />
            <Box sx={{ flex: 1 }}>
              {[...Array(4)].map((_, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Skeleton variant="rectangular" width={16} height={16} />
                  <Skeleton variant="text" width="70%" height={20} />
                </Box>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader title={title} />
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">
              No language data available
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }} role="img" aria-label={`${title} chart showing language distribution`}>
      <CardHeader
        title={
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
        }
      />
      <CardContent>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 3,
          flexDirection: { xs: 'column', md: 'row' },
        }}>
          {/* Pie Chart */}
          <Box sx={{ width: { xs: '100%', md: 250 }, height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  stroke={theme.palette.background.paper}
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          {/* Legend */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <List dense sx={{ py: 0 }} role="table" aria-label="Language search statistics">
              {chartData.map((item) => {
                const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
                return (
                  <ListItem key={item.language} sx={{ px: 0, py: 0.5 }} role="row">
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          bgcolor: item.color,
                          borderRadius: 0.5,
                        }}
                        aria-hidden="true"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }} role="cell">
                            {item.name}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            role="cell"
                            aria-label={`${item.count.toLocaleString()} searches, ${percentage} percent`}
                          >
                            {item.count.toLocaleString()} ({percentage}%)
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LanguageChart;