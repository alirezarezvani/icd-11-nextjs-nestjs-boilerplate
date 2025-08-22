/**
 * ActivityChart Component - Displays search activity trends over time
 * Uses line chart to show search patterns and activity levels
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface ActivityData {
  date: string;
  count: number;
}

interface ActivityChartProps {
  data: ActivityData[];
  loading?: boolean;
  title?: string;
  showArea?: boolean;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({
  data,
  loading = false,
  title = 'Search Activity',
  showArea = false,
}) => {
  const theme = useTheme();
  const [chartType, setChartType] = React.useState<'line' | 'area'>('line');

  // Format date for display
  const chartData = data.map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    fullDate: new Date(item.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
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
            {data.fullDate}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.count.toLocaleString()} searches
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const handleChartTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: 'line' | 'area',
  ) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader
          title={<Skeleton variant="text" width="60%" height={32} />}
          action={<Skeleton variant="rectangular" width={120} height={32} />}
        />
        <CardContent>
          <Skeleton variant="rectangular" width="100%" height={250} />
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
              height: 250,
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">
              No activity data available
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
        }
        action={
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            size="small"
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            <ToggleButton value="line">
              Line
            </ToggleButton>
            <ToggleButton value="area">
              Area
            </ToggleButton>
          </ToggleButtonGroup>
        }
      />
      <CardContent>
        <Box sx={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={theme.palette.primary.main}
                  fill={theme.palette.primary.main}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: theme.palette.primary.main, strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </Box>

        {/* Summary Statistics */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          mt: 2, 
          pt: 2, 
          borderTop: 1, 
          borderColor: 'divider',
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {data.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Average
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {Math.round(data.reduce((sum, item) => sum + item.count, 0) / data.length).toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Peak Day
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {Math.max(...data.map(item => item.count)).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActivityChart;