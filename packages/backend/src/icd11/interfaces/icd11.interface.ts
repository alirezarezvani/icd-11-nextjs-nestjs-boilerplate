export interface ICD11Entity {
  id: string;
  title: string;
  definition: string;
}

export interface ICD11SearchDto {
  term: string;
  language: string;
  flexisearch?: boolean;
  flatResults?: boolean;
  includeDescendants?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ICD11SearchResult {
  id: string;
  title: string;
  definition?: string;
}
