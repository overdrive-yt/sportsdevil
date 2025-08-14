// Google Analytics gtag global types
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'set',
      targetId: string,
      config?: {
        [key: string]: any;
      }
    ) => void;
  }
}

// Global gtag function
declare const gtag: (
  command: 'event' | 'config' | 'set',
  targetId: string,
  config?: {
    [key: string]: any;
  }
) => void;

// Extended Performance API types
interface PerformanceEntry {
  processingStart?: number;
}

interface PerformanceNavigationTiming {
  navigationStart?: number;
}

export {};