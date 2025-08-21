import { ReactNode, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Menu, Search, Info, Globe } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/context/LanguageContext';
import config from '../config';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({ 
  children, 
  title = config.app.name,
  description,
}: LayoutProps) {
  const { t } = useTranslation('common');
  const { isRTL, currentLanguage } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const pageTitle = title || t('meta.defaultTitle');
  const pageDescription = description || t('meta.defaultDescription');

  const navItems = [
    { title: t('nav.search'), href: '/', icon: <Search className="h-4 w-4" /> },
    { title: t('nav.about'), href: '/about', icon: <Info className="h-4 w-4" /> },
  ];

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="icon" href="/favicon.ico" />
        {/* RTL-specific meta tags */}
        <meta name="dir" content={isRTL ? 'rtl' : 'ltr'} />
        <meta name="lang" content={currentLanguage} />
        {/* Arabic font preload for performance */}
        {isRTL && (
          <link
            rel="preload"
            href="https://fonts.gstatic.com/s/notosansarabic/v18/nwpxtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlhQ5l3sQWIHPqzCfyGy4.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        )}
      </Head>
      
      <div className={`min-h-screen flex flex-col ${isRTL ? 'direction-rtl' : 'direction-ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <header className="bg-primary text-primary-foreground shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Mobile menu button */}
              <div className="md:hidden">
                <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">{t('nav.openMenu')}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side={isRTL ? "right" : "left"} className={isRTL ? 'text-right' : 'text-left'}>
                  <SheetHeader>
                    <SheetTitle>{config.app.name}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Button variant="ghost" className={`w-full ${isRTL ? 'justify-end' : 'justify-start'}`} size="lg">
                          {isRTL ? (
                            <>
                              <span className="mr-2">{item.title}</span>
                              {item.icon}
                            </>
                          ) : (
                            <>
                              {item.icon}
                              <span className="ml-2">{item.title}</span>
                            </>
                          )}
                        </Button>
                      </Link>
                    ))}
                    
                    {/* Language selector in mobile menu */}
                    <div className="pt-4 border-t">
                      <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                        <Globe className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t('nav.language') || 'Language'}
                      </div>
                      <LanguageSelector variant="menu" size="small" showLanguageName />
                    </div>
                  </div>
                </SheetContent>
                </Sheet>
              </div>
            
              {/* Logo */}
              <div className={`flex-1 md:flex-none ${isRTL ? 'text-right md:text-right' : 'text-left md:text-left'}`}>
              <Link href="/" className="text-xl font-bold hover:text-primary-foreground/80 transition-colors">
                {config.app.name}
              </Link>
              </div>
              
              {/* Desktop Navigation */}
              <nav className={`hidden md:flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button variant="ghost" className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10">
                      {isRTL ? (
                        <>
                          <span className="mr-2">{item.title}</span>
                          {item.icon}
                        </>
                      ) : (
                        <>
                          {item.icon}
                          <span className="ml-2">{item.title}</span>
                        </>
                      )}
                    </Button>
                  </Link>
                ))}
                
                {/* Desktop Language Selector */}
                <div className={`${isRTL ? 'mr-2' : 'ml-2'} language-selector`}>
                  <LanguageSelector variant="compact" size="medium" />
                </div>
              </nav>
            </div>
          </div>
        </header>
      
      <main className="flex-1">
        {children}
      </main>
      
        <footer className="bg-card border-t py-6 mt-auto">
          <div className="container mx-auto px-4">
            <div className={`${isRTL ? 'text-center' : 'text-center'} text-sm text-muted-foreground`}>
              <p className={isRTL ? 'arabic-text' : ''}>
                {t('footer.copyright', { year: new Date().getFullYear(), appName: config.app.name })} | 
                <Link href="/about" className={`${isRTL ? 'mr-2' : 'ml-2'} hover:text-foreground transition-colors`}>
                  {t('footer.aboutLink')}
                </Link>
              </p>
              <p className={`mt-2 ${isRTL ? 'arabic-text' : ''}`}>
                {t('footer.dataSource')}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
} 