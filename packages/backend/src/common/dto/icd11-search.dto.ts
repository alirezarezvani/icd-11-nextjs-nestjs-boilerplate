import { IsString, IsOptional, IsBoolean, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum LanguageCode {
  ENGLISH = "en",
  SPANISH = "es",
  FRENCH = "fr",
  RUSSIAN = "ru",
  CHINESE = "zh",
  ARABIC = "ar",
  GERMAN = "de",
  JAPANESE = "ja",
  PORTUGUESE = "pt",
  ITALIAN = "it",
}

export class ICD11SearchDto {
  @ApiProperty({
    description: "Search term to find ICD-11 entities",
    example: "diabetes",
    required: true,
  })
  @IsString()
  term: string = "";

  @ApiProperty({
    description: "Language code for search results",
    enum: LanguageCode,
    default: LanguageCode.ENGLISH,
    required: false,
  })
  @IsEnum(LanguageCode)
  @IsOptional()
  language?: string;

  @ApiProperty({
    description: "Whether to use fuzzy search for better matching",
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  flexisearch?: boolean;

  @ApiProperty({
    description: "Flatten the search results hierarchy",
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  flatResults?: boolean;

  @ApiProperty({
    description: "Include child entities in search results",
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  includeDescendants?: boolean;
}

export class ICD11EntityDto {
  @ApiProperty({
    description: "The ID of the ICD-11 entity",
    example: "http://id.who.int/icd/entity/455013390",
    required: true,
  })
  @IsString()
  id: string = "";

  @ApiProperty({
    description: "Language code for entity data",
    enum: LanguageCode,
    default: LanguageCode.ENGLISH,
    required: false,
  })
  @IsEnum(LanguageCode)
  @IsOptional()
  language?: string;
}
