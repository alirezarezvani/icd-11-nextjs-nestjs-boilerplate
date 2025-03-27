import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import styled from 'styled-components';
import Search from '../components/Search';

// Create a client
const queryClient = new QueryClient();

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.header`
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
`;

const Main = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DetailContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export default function Home() {
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  
  const handleSelectEntity = (id: string) => {
    setSelectedEntityId(id);
    // In a real app, you would fetch entity details here
    console.log(`Selected entity: ${id}`);
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <Container>
        <Header>
          <Title>ICD-11 Search</Title>
          <Subtitle>Search for diseases, disorders, and health conditions in the WHO ICD-11 database</Subtitle>
        </Header>
        
        <Main>
          <Search onSelectEntity={handleSelectEntity} />
          
          {selectedEntityId && (
            <DetailContainer>
              <h2>Entity Details</h2>
              <p>Selected Entity ID: {selectedEntityId}</p>
              <p>Details would be displayed here in a real application.</p>
            </DetailContainer>
          )}
        </Main>
      </Container>
    </QueryClientProvider>
  );
}