/**
 * Supported languages for ICD-11 API
 */
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'ar' | 'zh' | 'ru';

/**
 * Search scopes for ICD-11 API
 */
export enum ICD11SearchScope {
  ALL = 'all',
  TITLE = 'title',
  DEFINITION = 'definition',
  SYNONYM = 'synonym'
}

/**
 * Search categories for ICD-11 API
 */
export enum ICD11SearchCategory {
  ALL = '',
  MORTALITY = 'mortality',
  MORBIDITY = 'morbidity'
}

/**
 * ICD-11 Search Parameters
 */
export interface ICD11SearchParams {
  term: string;
  language?: SupportedLanguage;
  flexisearch?: boolean;
  limit?: number;
  page?: number;
  scope?: ICD11SearchScope;
  category?: ICD11SearchCategory;
  includeDeprecated?: boolean;
  leafNodesOnly?: boolean;
}

/**
 * ICD-11 Search Result Item
 */
export interface ICD11SearchResult {
  id: string;
  title: string;
  definition?: string;
  code?: string;
  uri: string;
  isLeaf: boolean;
  deprecated?: boolean;
  language: SupportedLanguage;
  matchType: 'exact' | 'partial' | 'stemmed';
  score: number;
  chapter?: string;
  block?: string;
  category?: string;
}

/**
 * ICD-11 Entity
 */
export interface ICD11Entity {
  id: string;
  title: string;
  definition?: string;
  code?: string;
  uri: string;
  isLeaf: boolean;
  deprecated?: boolean;
  language: SupportedLanguage;
  parent?: string;
  children?: string[];
  synonyms?: string[];
  exclusions?: string[];
  inclusions?: string[];
  notes?: string[];
  codingHints?: string[];
  chapter?: string;
  block?: string;
  category?: string;
}

/**
 * ICD-11 Entity Details (extended information)
 */
export interface ICD11EntityDetails extends ICD11Entity {
  breadcrumbs: ICD11BreadcrumbItem[];
  ancestors: ICD11Entity[];
  descendants?: ICD11Entity[];
  relatedEntities?: ICD11Entity[];
}

/**
 * ICD-11 Breadcrumb Item
 */
export interface ICD11BreadcrumbItem {
  id: string;
  title: string;
  uri: string;
  level: number;
}

/**
 * ICD-11 Navigation Context
 */
export interface ICD11NavigationContext {
  current: ICD11Entity;
  parent?: ICD11Entity;
  children: ICD11Entity[];
  siblings: ICD11Entity[];
  breadcrumbs: ICD11BreadcrumbItem[];
}