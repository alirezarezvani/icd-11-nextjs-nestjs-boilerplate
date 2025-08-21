import { Html, Head, Main, NextScript, DocumentContext } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        {/* RTL and Arabic fonts meta tags */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        
        {/* Arabic font preload for better performance */}
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/notosansarabic/v18/nwpxtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlhQ5l3sQWIHPqzCfyGy4.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        
        {/* RTL support for different browsers */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* CSS for immediate RTL support before JS loads */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Immediate RTL support */
            html[dir="rtl"] {
              direction: rtl;
            }
            
            html[dir="rtl"] body {
              direction: rtl;
              text-align: right;
              font-family: 'Noto Sans Arabic', 'Traditional Arabic', 'Arial Unicode MS', sans-serif;
            }
            
            /* Prevent FOUC (Flash of Unstyled Content) */
            html[dir="rtl"] * {
              box-sizing: border-box;
            }
            
            /* Loading state for Arabic */
            html[dir="rtl"] .loading-rtl {
              font-family: 'Noto Sans Arabic', 'Traditional Arabic', 'Arial Unicode MS', sans-serif !important;
              direction: rtl !important;
              text-align: right !important;
            }
          `
        }} />
      </Head>
      <body>
        {/* Screen reader support for RTL */}
        <div id="skip-navigation" className="sr-only">
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
        </div>
        
        <Main />
        <NextScript />
        
      </body>
    </Html>
  )
}