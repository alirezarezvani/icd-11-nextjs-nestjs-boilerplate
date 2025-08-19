import { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  Container,
  CircularProgress,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ICD11SearchResult } from '../types';

const Home: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ICD11SearchResult[]>([]);
  const [flexiSearch, setFlexiSearch] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/icd11/search?term=${encodeURIComponent(searchTerm)}&flexisearch=${flexiSearch}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data.data || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search. Please try again later.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>ICD-11 Search</title>
        <meta name="description" content="Search ICD-11 medical codes and definitions" />
      </Head>

      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            ICD-11 Search
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Search for medical conditions, diseases, and health-related terms in the WHO ICD-11 database
          </Typography>
          
          <Paper component="form" onSubmit={handleSearch} sx={{ p: 2, mt: 4, mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={9}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Search ICD-11"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter a medical condition, disease, or health term..."
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button 
                  fullWidth
                  variant="contained" 
                  color="primary" 
                  type="submit"
                  disabled={isLoading || !searchTerm.trim()}
                  startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <SearchIcon />}
                  sx={{ height: '56px' }}
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={flexiSearch} 
                      onChange={(e) => setFlexiSearch(e.target.checked)} 
                    />
                  }
                  label="Enable flexible search (includes similar terms and synonyms)"
                />
              </Grid>
            </Grid>
          </Paper>

          {error && (
            <Typography color="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Typography>
          )}

          {results.length > 0 ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'left' }}>
                Search Results ({results.length})
              </Typography>
              
              {results.map((result) => (
                <Paper 
                  key={result.id} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    textAlign: 'left',
                    '&:hover': {
                      boxShadow: 3,
                      cursor: 'pointer'
                    }
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {result.title}
                  </Typography>
                  
                  {result.code && (
                    <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                      Code: {result.code}
                    </Typography>
                  )}
                  
                  {result.matchingPhrases && (
                    <Typography variant="body2" color="text.secondary">
                      Matching terms: {result.matchingPhrases.join(', ')}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          ) : searchTerm && !isLoading ? (
            <Typography variant="body1">No results found for &quot;{searchTerm}&quot;</Typography>
          ) : null}
        </Box>
      </Container>
    </>
  );
};

export default Home;