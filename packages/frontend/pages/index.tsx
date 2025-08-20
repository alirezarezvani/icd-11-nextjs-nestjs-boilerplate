import type { NextPage } from 'next';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { SearchForm } from '@/components/SearchForm';
import { SearchResults } from '@/components/SearchResults';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Home: NextPage = () => {
  return (
    <Layout title="ICD-11 Search | Healthcare Code Explorer">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              ICD-11 Healthcare Search
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Search for medical conditions, diseases, and health-related terms in the WHO ICD-11 database
            </p>
          </div>

          {/* Search Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search Medical Codes</CardTitle>
              <CardDescription>
                Enter medical terms to find relevant ICD-11 codes and classifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SearchForm 
                autoFocus={true}
                showLanguageSelect={true}
                showAdvancedOptions={true}
              />
            </CardContent>
          </Card>

          {/* Results Section */}
          <SearchResults />
        </div>
      </div>
    </Layout>
  );
};

export default Home;