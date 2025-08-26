import { useEffect } from 'react';
import App from './app/_layout';

export default function WebApp() {
  useEffect(() => {
    // Fix viewport on web
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
    
    // Add global styles to prevent zoom
    const style = document.createElement('style');
    style.innerHTML = `
      html, body {
        overflow-x: hidden;
        touch-action: manipulation;
      }
      input, select, textarea {
        font-size: 16px !important;
      }
      @media screen and (max-width: 768px) {
        body {
          -webkit-text-size-adjust: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return <App />;
}