import { NextPage } from 'next';
import Head from 'next/head';
import { 
  Typography, 
  Container, 
  Box, 
  Paper, 
  Link,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

const About: NextPage = () => {
  return (
    <>
      <Head>
        <title>About - ICD-11 Search</title>
        <meta name="description" content="About the ICD-11 Search application" />
      </Head>

      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            About ICD-11 Search
          </Typography>
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              What is ICD-11?
            </Typography>
            <Typography paragraph>
              The International Classification of Diseases 11th Revision (ICD-11) is the latest version of the ICD, 
              the global standard for health data, clinical documentation, and statistical aggregation. It was 
              adopted by the World Health Assembly in May 2019 and came into effect on January 1, 2022.
            </Typography>
            <Typography paragraph>
              ICD-11 represents a significant advancement over previous versions, featuring a more logical structure, 
              electronic tooling, and an implementation package that includes transition tables, translation tools, 
              a coding tool, web services, and training materials.
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              About This Application
            </Typography>
            <Typography paragraph>
              This application provides a simple and intuitive interface for searching ICD-11 codes and definitions. 
              It leverages the official WHO ICD-11 API to provide accurate and up-to-date information.
            </Typography>
            <Typography paragraph>
              Features include:
            </Typography>
            <List disablePadding>
              <ListItem>
                <ListItemText primary="Simple search interface for finding ICD-11 codes" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Flexible search options to improve search results" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Detailed information about each ICD-11 entity" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Fast response times thanks to server-side caching" />
              </ListItem>
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Data Source
            </Typography>
            <Typography paragraph>
              All data is sourced from the{' '}
              <Link href="https://icd.who.int/en" target="_blank" rel="noopener noreferrer">
                World Health Organization&apos;s ICD-11 API
              </Link>. 
              This application does not store or modify any of the core ICD-11 data.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ICD-11 content is © World Health Organization. All rights reserved.
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Technical Information
            </Typography>
            <Typography paragraph>
              This application is built using Next.js for the frontend and NestJS for the backend, with 
              TypeScript providing type safety throughout the stack. Redis is used for caching API responses 
              to improve performance and reduce the load on the WHO API.
            </Typography>
            <Typography paragraph>
              For developers, the source code demonstrates:
            </Typography>
            <List disablePadding>
              <ListItem>
                <ListItemText primary="Integration with the WHO ICD-11 API" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Effective caching strategies with Redis" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Clean architecture with separation of concerns" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Modern React patterns with TypeScript" />
              </ListItem>
            </List>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default About; 