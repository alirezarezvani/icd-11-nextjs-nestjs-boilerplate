import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Home, ArrowLeft, ChevronRight } from 'lucide-react';
import { icd11Service } from '../../services/api';
import { ICD11Entity } from '@shared/types/icd11';
import config from '../../config';

export default function EntityDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [entity, setEntity] = useState<ICD11Entity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [children, setChildren] = useState<ICD11Entity[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchEntity = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const rawId = Array.isArray(id) ? id[0] : id;
        const entityId = decodeURIComponent(rawId);
        const entityData = await icd11Service.getEntity(entityId);
        setEntity(entityData);
        
        // Load children if not a leaf node
        if (!entityData.isLeaf) {
          await fetchChildren(entityId);
        }
      } catch (err: any) {
        console.error('Error fetching entity:', err);
        setError(err.message || 'Failed to load entity details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEntity();
  }, [id]);
  
  const fetchChildren = async (entityId: string) => {
    setLoadingChildren(true);
    try {
      const response = await icd11Service.getEntityChildren(
        entityId, 
        config.app.defaultLanguage
      );
      setChildren(response.data);
    } catch (err) {
      console.error('Error fetching children:', err);
    } finally {
      setLoadingChildren(false);
    }
  };

  if (isLoading) {
    return (
      <Layout title="Loading... | ICD-11 Healthcare Search">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/5" />
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-6 w-24" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Error | ICD-11 Healthcare Search">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-6 py-8 rounded-lg">
              <h1 className="text-xl font-semibold mb-2">Error Loading Entity</h1>
              <p className="text-sm mb-4">{error}</p>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!entity) {
    return (
      <Layout title="Not Found | ICD-11 Healthcare Search">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="py-12">
              <h1 className="text-2xl font-semibold text-muted-foreground mb-4">Entity Not Found</h1>
              <p className="text-muted-foreground mb-6">The requested entity could not be found.</p>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${entity.title} | ICD-11 Healthcare Search`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                <Button variant="ghost" size="sm" className="px-2">
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </Button>
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span>Entity Details</span>
            </div>
          </nav>
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{entity.title}</h1>
            
            <div className="flex flex-wrap gap-2">
              {entity.code && (
                <Badge variant="outline" className="text-sm">
                  Code: {entity.code}
                </Badge>
              )}
              
              {entity.isLeaf === false && (
                <Badge variant="secondary" className="text-sm">
                  Has children
                </Badge>
              )}
              
              <Badge variant={entity.isLeaf ? "default" : "secondary"} className="text-sm">
                {entity.isLeaf ? 'Leaf Entity' : 'Category'}
              </Badge>
            </div>
          </div>
          
          {/* Main Content Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {entity.definition ? (
                    <p className="text-muted-foreground leading-relaxed">
                      {entity.definition}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No description available
                    </p>
                  )}
                  
                  {entity.longDefinition && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-2">Extended Description</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {entity.longDefinition}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              {children.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Child Categories</CardTitle>
                    <CardDescription>
                      Subcategories within this classification
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {children.map((child, index) => (
                        <div key={child.id}>
                          {index > 0 && <Separator />}
                          <Link 
                            href={`/entity/${encodeURIComponent(child.id)}`}
                            className="block p-3 rounded-md hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{child.title}</h4>
                                {child.code && (
                                  <p className="text-sm text-muted-foreground">Code: {child.code}</p>
                                )}
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {loadingChildren && (
                <div className="text-center py-6">
                  <div className="inline-flex items-center gap-2 text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span className="text-sm">Loading child categories...</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Entity Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">ID</label>
                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1">{entity.id}</p>
                  </div>
                  
                  {entity.code && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Code</label>
                      <p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1">{entity.code}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <p className="text-sm mt-1">
                      {entity.isLeaf ? "Leaf entity (no children)" : "Category (has children)"}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {entity.parent && (
                <Card>
                  <CardHeader>
                    <CardTitle>Parent Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/entity/${encodeURIComponent(entity.parent.id || '')}`}>
                      <Button variant="outline" className="w-full">
                        {entity.parent.title || 'View parent category'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 