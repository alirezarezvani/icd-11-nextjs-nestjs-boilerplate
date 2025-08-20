import { ReactNode, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Menu, Search, Info } from 'lucide-react';
import config from '../config';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({ 
  children, 
  title = config.app.name,
  description = 'Search WHO ICD-11 medical codes',
}: LayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { title: 'Search', href: '/', icon: <Search className="h-4 w-4" /> },
    { title: 'About', href: '/about', icon: <Info className="h-4 w-4" /> },
  ];

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen flex flex-col">
        <header className="bg-primary text-primary-foreground shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Mobile menu button */}
              <div className="md:hidden">
                <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>{config.app.name}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Button variant="ghost" className="w-full justify-start" size="lg">
                          {item.icon}
                          <span className="ml-2">{item.title}</span>
                        </Button>
                      </Link>
                    ))}
                  </div>
                </SheetContent>
                </Sheet>
              </div>
            
              {/* Logo */}
              <div className="flex-1 md:flex-none">
              <Link href="/" className="text-xl font-bold hover:text-primary-foreground/80 transition-colors">
                {config.app.name}
              </Link>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button variant="ghost" className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10">
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                  </Button>
                </Link>
              ))}
              </nav>
            </div>
          </div>
        </header>
      
      <main className="flex-1">
        {children}
      </main>
      
        <footer className="bg-card border-t py-6 mt-auto">
          <div className="container mx-auto px-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                © {new Date().getFullYear()} {config.app.name} | 
                <Link href="/about" className="ml-2 hover:text-foreground transition-colors">
                  About
                </Link>
              </p>
              <p className="mt-2">
                Data sourced from the WHO ICD-11 API
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
} 