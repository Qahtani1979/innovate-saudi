import { useEffect } from 'react';

/**
 * WCAG 2.1 AA Accessibility Enhancements
 */
export default function AccessibilityEnhancer() {
  useEffect(() => {
    // Add skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded';
    document.body.prepend(skipLink);

    // Add ARIA landmarks dynamically
    document.querySelector('main')?.setAttribute('id', 'main-content');
    document.querySelector('main')?.setAttribute('role', 'main');
    document.querySelector('nav')?.setAttribute('role', 'navigation');
    document.querySelector('header')?.setAttribute('role', 'banner');

    // Ensure all images have alt text
    document.querySelectorAll('img:not([alt])').forEach(img => {
      img.setAttribute('alt', '');
    });

    // Add keyboard focus indicators
    const style = document.createElement('style');
    style.textContent = `
      *:focus-visible {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
    `;
    document.head.appendChild(style);

    return () => {
      skipLink.remove();
      style.remove();
    };
  }, []);

  return null;
}