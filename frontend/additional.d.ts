// Global type definitions
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}

// API Response types
interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

// ICD-11 specific types
interface ICD11Entity {
  id: string;
  title: string;
  code?: string;
  description?: string;
  parents?: string[];
  children?: string[];
  isLeaf: boolean;
}

interface ICD11SearchResult {
  id: string;
  title: string;
  code?: string;
  isLeaf: boolean;
  matchingPhrases?: string[];
}

// Extend window object if needed
interface Window {
  // Add any window extensions here if needed
}

// Utility types
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type LoadingState = 'idle' | 'loading' | 'success' | 'error'; 