// ICD-11 specific interfaces

/**
 * Supported languages for ICD-11 API
 */
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'ar' | 'zh' | 'ru';

/**
 * ICD-11 search parameters
 */
export interface ICD11SearchParams {
  term: string;
  language?: SupportedLanguage;
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
 * ICD-11 coding rule information
 */
export interface ICD11CodingRule {
  label: string;
  content: string;
  priority?: number;
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
  classKind?: 'category' | 'class' | 'block';
  codingRules?: ICD11CodingRule[];
  language?: SupportedLanguage;
}

/**
 * ICD-11 breadcrumb item for navigation
 */
export interface ICD11BreadcrumbItem {
  id: string;
  title: string;
  level: number;
}

/**
 * ICD-11 entity details (extended information)
 */
export interface ICD11EntityDetails extends ICD11Entity {
  children?: ICD11Entity[];
  ancestors?: ICD11Entity[];
  breadcrumbs?: ICD11BreadcrumbItem[];
  siblingCount?: number;
  childrenCount?: number;
}

/**
 * ICD-11 hierarchical navigation context
 */
export interface ICD11NavigationContext {
  currentEntity: ICD11Entity;
  ancestors: ICD11Entity[];
  children: ICD11Entity[];
  parent?: ICD11Entity;
  breadcrumbs: ICD11BreadcrumbItem[];
}

/**
 * Language-specific content interface
 */
export interface LanguageContent {
  [key: string]: string;
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
