/**
 * TopTermsChart Component - Displays most frequently searched terms
 * Uses horizontal bar chart for better readability of term names
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  Skeleton,
  Chip,
  useTheme,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TopTermData {
  term: string;
  count: number;
}

interface TopTermsChartProps {
  data: TopTermData[];
  loading?: boolean;
  title?: string;
  maxTerms?: number;
}

export const TopTermsChart: React.FC<TopTermsChartProps> = ({
  data,
  loading = false,
  title = 'Top Search Terms',
  maxTerms = 5,
}) => {
  const theme = useTheme();

  // Limit and prepare data
  const chartData = data.slice(0, maxTerms).map((item, index) => ({
    ...item,
    // Truncate long terms for better display
    displayTerm: item.term.length > 25 ? `${item.term.substring(0, 22)}...` : item.term,
    color: theme.palette.primary.main,
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
            maxWidth: 300,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {data.term}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.count.toLocaleString()} searches
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
          <Box sx={{ space: 2 }}>
            {[...Array(5)].map((_, i) => (
              <Box key={i} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Skeleton variant="text" width="40%" height={20} />
                  <Skeleton variant="text" width="20%" height={20} />
                </Box>
                <Skeleton variant="rectangular" width="100%" height={8} />
              </Box>
            ))}
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
              No search terms available
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }} role="img" aria-label={`${title} chart showing most popular search terms`}>
      <CardHeader
        title={
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
        }
        action={
          <Chip
            label={`Top ${Math.min(data.length, maxTerms)}`}
            size="small"
            variant="outlined"
            color="primary"
          />
        }
      />
      <CardContent>
        {/* Chart for larger screens */}
        <Box sx={{ 
          display: { xs: 'none', sm: 'block' },
          height: 300,
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="horizontal"
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <YAxis 
                type="category" 
                dataKey="displayTerm"
                tick={{ fontSize: 12 }}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill={theme.palette.primary.main}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* List view for mobile */}
        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          {chartData.map((item, index) => {
            const maxCount = Math.max(...chartData.map(d => d.count));
            const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            
            return (
              <Box key={item.term} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '70%',
                    }}
                  >
                    {item.term}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.count.toLocaleString()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: '100%',
                    height: 8,
                    bgcolor: 'grey.200',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: `${percentage}%`,
                      height: '100%',
                      bgcolor: theme.palette.primary.main,
                      transition: 'width 0.3s ease-in-out',
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TopTermsChart;