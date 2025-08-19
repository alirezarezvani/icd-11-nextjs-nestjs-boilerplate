// Interfaces for the WHO ICD-11 API

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface WHOTitle {
  [key: string]: string;
  en: string;
}

export interface WHODefinition {
  [key: string]: string;
  en: string;
}

export interface WHOEntity {
  id: string;
  title: WHOTitle;
  definition?: WHODefinition;
}

export interface WHOSearchResponse {
  destinationEntities: WHOEntity[];
}

export interface WHOChildrenResponse {
  children?: WHOEntity[];
  total?: number;
}

export interface WHOEntityResponse {
  id: string;
  title: WHOTitle;
  definition?: WHODefinition;
}
