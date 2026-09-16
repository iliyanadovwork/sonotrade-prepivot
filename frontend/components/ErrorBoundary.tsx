'use client';

import { useEffect } from 'react';

export function GlobalErrorHandler() {
  useEffect(() => {
    // Suppress errors from wallet browser extensions
    const originalError = console.error;
    console.error = (...args: any[]) => {
      // Filter out TronLink and other wallet extension errors
      const errorString = args.join(' ');
      if (
        errorString.includes('tronlinkParams') ||
        errorString.includes('chrome-extension://') ||
        errorString.includes('trap returned falsish')
      ) {
        // Silently ignore these errors
        return;
      }
      originalError.apply(console, args);
    };

    // Global error handler for window errors
    const handleError = (event: ErrorEvent) => {
      // Ignore errors from browser extensions
      if (
        event.filename?.includes('chrome-extension://') ||
        event.message?.includes('tronlinkParams') ||
        event.message?.includes('trap returned falsish')
      ) {
        event.preventDefault();
        return true;
      }
    };

    window.addEventListener('error', handleError);

    return () => {
      console.error = originalError;
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
}
