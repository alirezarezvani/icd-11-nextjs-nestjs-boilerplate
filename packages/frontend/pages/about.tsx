import { NextPage } from 'next';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ExternalLink } from 'lucide-react';

const About: NextPage = () => {
  return (
    <Layout title="About - ICD-11 Healthcare Search">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            About ICD-11 Healthcare Search
          </h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What is ICD-11?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The International Classification of Diseases 11th Revision (ICD-11) is the latest version of the ICD, 
                the global standard for health data, clinical documentation, and statistical aggregation. It was 
                adopted by the World Health Assembly in May 2019 and came into effect on January 1, 2022.
              </p>
              <p className="text-muted-foreground">
                ICD-11 represents a significant advancement over previous versions, featuring a more logical structure, 
                electronic tooling, and an implementation package that includes transition tables, translation tools, 
                a coding tool, web services, and training materials.
              </p>
              
              <Separator className="my-4" />
              
              <div>
                <h3 className="text-lg font-semibold mb-3">About This Application</h3>
                <p className="text-muted-foreground mb-4">
                  This application provides a simple and intuitive interface for searching ICD-11 codes and definitions. 
                  It leverages the official WHO ICD-11 API to provide accurate and up-to-date information.
                </p>
                <div>
                  <h4 className="font-medium mb-2">Features include:</h4>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Simple search interface for finding ICD-11 codes</li>
                    <li>Flexible search options to improve search results</li>
                    <li>Detailed information about each ICD-11 entity</li>
                    <li>Fast response times thanks to server-side caching</li>
                  </ul>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Data Source</h3>
                <p className="text-muted-foreground mb-2">
                  All data is sourced from the{' '}
                  <a 
                    href="https://icd.who.int/en" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    World Health Organization&apos;s ICD-11 API
                    <ExternalLink className="h-3 w-3" />
                  </a>. 
                  This application does not store or modify any of the core ICD-11 data.
                </p>
                <p className="text-xs text-muted-foreground">
                  ICD-11 content is © World Health Organization. All rights reserved.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Technical Information</CardTitle>
              <CardDescription>
                Built with modern web technologies for optimal performance and developer experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This application is built using Next.js for the frontend and NestJS for the backend, with 
                TypeScript providing type safety throughout the stack. Redis is used for caching API responses 
                to improve performance and reduce the load on the WHO API.
              </p>
              <div>
                <h4 className="font-medium mb-2">For developers, this codebase demonstrates:</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Integration with the WHO ICD-11 API</li>
                  <li>Effective caching strategies with Redis</li>
                  <li>Clean architecture with separation of concerns</li>
                  <li>Modern React patterns with TypeScript</li>
                  <li>shadcn/ui component library integration</li>
                  <li>Responsive design with Tailwind CSS</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default About; 