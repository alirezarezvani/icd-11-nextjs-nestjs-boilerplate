// Interfaces for the WHO ICD-11 API

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface WHOTitle {
  [key: string]: string | undefined;
  en?: string;
}

export interface WHODefinition {
  [key: string]: string | undefined;
  en?: string;
}

export interface WHOV2Field {
  '@value': string;
  '@language': string;
}

export interface WHOEntity {
  id: string;
  title: WHOTitle | string; // Can be either multilingual object or plain string
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
  '@id': string;
  id?: string;
  title: WHOTitle | string | WHOV2Field; // Can be either multilingual object, plain string, or WHO v2 format
  definition?: WHODefinition | string | WHOV2Field;
  code?: string;
  classKind?: string;
}
