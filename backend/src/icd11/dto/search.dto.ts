import { IsString, IsOptional } from 'class-validator';

export class SearchDto {
  @IsString()
  term: string;

  @IsString()
  @IsOptional()
  language?: string;
} 