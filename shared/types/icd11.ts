// ICD-11 specific interfaces

/**
 * ICD-11 search parameters
 */
export interface ICD11SearchParams {
  term: string;
  language?: string;
  page?: number;
  limit?: number;
  flexisearch?: boolean;
  flatResults?: boolean;
  includeDescendants?: boolean;
}

/**
 * ICD-11 search result interface
 */
export interface ICD11SearchResult {
  id: string;
  title: string;
  code?: string;
  isLeaf: boolean;
  matchingPhrases?: string[];
}

/**
 * ICD-11 entity interface (base entity with minimal information)
 */
export interface ICD11Entity {
  id: string;
  title: string;
  code?: string;
  definition?: string;
  longDefinition?: string;
  isLeaf?: boolean;
  parent?: Partial<ICD11Entity>;
  browserUrl?: string;
  includedTerms?: string[];
  excludedTerms?: string[];
}

/**
 * ICD-11 entity details (extended information)
 */
export interface ICD11EntityDetails extends ICD11Entity {
  classKind?: string;
  child?: ICD11Entity[];
  ancestor?: ICD11Entity[];
}

/**
 * ICD-11 OAuth2 token response
 */
export interface ICD11AuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}
