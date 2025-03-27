// ICD-11 specific interfaces

// Search parameters
export interface ICD11SearchParams {
  term: string;
  language?: string;
  flexisearch?: boolean;
  flatResults?: boolean;
  includeDescendants?: boolean;
}

// Search result from the WHO API
export interface ICD11SearchResult {
  destinationEntities: ICD11Entity[];
  error?: string;
  wordSuggestions?: string[];
}

// Basic ICD-11 entity
export interface ICD11Entity {
  id: string;
  title: string;
  definition?: string;
  longDefinition?: string;
  fullySpecifiedName?: string;
  code?: string;
  codingNote?: string;
  parent?: string[];
  children?: string[];
  inclusion?: string[];
  exclusion?: string[];
  isLeaf: boolean;
}

// ICD-11 entity details
export interface ICD11EntityDetails extends ICD11Entity {
  classKind: string;
  child?: string[];
  ancestor?: string[];
  descendant?: string[];
  foundationReference?: string[];
  linearizationReference?: string[];
  browserUrl?: string;
}

// Authentication response from WHO API
export interface ICD11AuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
} 