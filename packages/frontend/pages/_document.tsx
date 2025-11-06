import { Html, Head, Main, NextScript, DocumentContext } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        {/* MetaMask/Extension blocking script - runs immediately */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Block MetaMask and other wallet extensions immediately
              if (typeof window !== 'undefined') {
                // Override ethereum object before extensions can set it
                Object.defineProperty(window, 'ethereum', {
                  get: function() {
                    console.log('MetaMask/Ethereum access blocked');
                    return undefined;
                  },
                  set: function() {
                    console.log('MetaMask/Ethereum injection blocked');
                    // Do nothing - prevent setting
                  },
                  configurable: false
                });
                
                // Block web3 object
                Object.defineProperty(window, 'web3', {
                  get: function() {
                    console.log('Web3 access blocked');
                    return undefined;
                  },
                  set: function() {
                    console.log('Web3 injection blocked');
                    // Do nothing - prevent setting
                  },
                  configurable: false
                });
                
                // Block common wallet objects
                const walletObjects = ['ethereum', 'web3', '__metamask', 'coinbaseWalletExtension', 'trustWallet', 'binanceWallet'];
                walletObjects.forEach(function(obj) {
                  try {
                    Object.defineProperty(window, obj, {
                      get: function() { return undefined; },
                      set: function() { /* block */ },
                      configurable: false
                    });
                  } catch (e) {
                    // Object might already exist, ignore
                  }
                });
                
                // Nuclear option: override addEventListener for extension events
                const originalAddEventListener = window.addEventListener;
                window.addEventListener = function(type, listener, options) {
                  // Block extension-related events
                  if (typeof listener === 'function') {
                    const listenerStr = listener.toString().toLowerCase();
                    if (listenerStr.includes('metamask') || 
                        listenerStr.includes('ethereum') || 
                        listenerStr.includes('wallet') ||
                        listenerStr.includes('web3')) {
                      console.log('Blocked extension event listener for:', type);
                      return;
                    }
                  }
                  return originalAddEventListener.call(this, type, listener, options);
                };
                
                // Immediately set up error suppression
                window.addEventListener('error', function(event) {
                  const msg = (event.message || '').toLowerCase();
                  const filename = (event.filename || '').toLowerCase();
                  
                  if (msg.includes('metamask') || 
                      msg.includes('wallet') || 
                      msg.includes('web3') || 
                      msg.includes('ethereum') ||
                      msg.includes('failed to connect') ||
                      filename.includes('chrome-extension://') ||
                      filename.includes('moz-extension://') ||
                      filename.includes('inpage.js')) {
                    console.log('Extension error blocked:', msg);
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    return false;
                  }
                }, true);
                
                // Block unhandled rejections
                window.addEventListener('unhandledrejection', function(event) {
                  const reason = event.reason;
                  const msg = (reason && reason.message ? reason.message : String(reason)).toLowerCase();
                  
                  if (msg.includes('metamask') || 
                      msg.includes('wallet') || 
                      msg.includes('web3') || 
                      msg.includes('ethereum') ||
                      msg.includes('failed to connect')) {
                    console.log('Extension promise rejection blocked:', msg);
                    event.preventDefault();
                    return false;
                  }
                }, true);
              }
            })();
          `
        }} />
        
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