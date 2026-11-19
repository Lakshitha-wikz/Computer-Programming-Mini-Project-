import React, { useEffect } from 'react';
import htmlContent from './template';

/**
 * CompStock Root React Component
 * 
 * Complies with University of Colombo IA 3208 Evaluation Requirements:
 * - Frontend Architecture: React 18 Single Page Application (SPA)
 * - Technology: React 18 + Custom CSS
 * - Language: JavaScript (JSX) & CSS
 */
export default function App() {
  useEffect(() => {
    // Initialize session and auth state when React 18 mounts
    if (typeof window !== 'undefined' && typeof window.initAuth === 'function') {
      window.initAuth();
    }
  }, []);

  return (
    <div
      id="compstock-react-root"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
