import { IsObject, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ColorSchemeDto {
  @ApiProperty({ description: 'Primary color' })
  @IsString()
  primary: string;

  @ApiProperty({ description: 'Secondary color' })
  @IsString()
  secondary: string;

  @ApiProperty({ description: 'Accent color' })
  @IsString()
  accent: string;

  @ApiProperty({ description: 'Background color' })
  @IsString()
  background: string;

  @ApiProperty({ description: 'Surface color' })
  @IsString()
  surface: string;

  @ApiProperty({ description: 'Text color' })
  @IsString()
  text: string;

  @ApiProperty({ description: 'Secondary text color' })
  @IsString()
  textSecondary: string;

  @ApiProperty({ description: 'Error color' })
  @IsString()
  error: string;

  @ApiProperty({ description: 'Warning color' })
  @IsString()
  warning: string;

  @ApiProperty({ description: 'Info color' })
  @IsString()
  info: string;

  @ApiProperty({ description: 'Success color' })
  @IsString()
  success: string;
}

export class FontSizeDto {
  @ApiProperty()
  @IsString()
  xs: string;

  @ApiProperty()
  @IsString()
  sm: string;

  @ApiProperty()
  @IsString()
  base: string;

  @ApiProperty()
  @IsString()
  lg: string;

  @ApiProperty()
  @IsString()
  xl: string;

  @ApiProperty()
  @IsString()
  '2xl': string;

  @ApiProperty()
  @IsString()
  '3xl': string;

  @ApiProperty()
  @IsString()
  '4xl': string;
}

export class FontWeightDto {
  @ApiProperty()
  light: number;

  @ApiProperty()
  normal: number;

  @ApiProperty()
  medium: number;

  @ApiProperty()
  semibold: number;

  @ApiProperty()
  bold: number;
}

export class LineHeightDto {
  @ApiProperty()
  @IsString()
  tight: string;

  @ApiProperty()
  @IsString()
  normal: string;

  @ApiProperty()
  @IsString()
  relaxed: string;
}

export class TypographyDto {
  @ApiProperty({ description: 'Font family' })
  @IsString()
  fontFamily: string;

  @ApiProperty({ type: FontSizeDto })
  @ValidateNested()
  @Type(() => FontSizeDto)
  fontSize: FontSizeDto;

  @ApiProperty({ type: FontWeightDto })
  @ValidateNested()
  @Type(() => FontWeightDto)
  fontWeight: FontWeightDto;

  @ApiProperty({ type: LineHeightDto })
  @ValidateNested()
  @Type(() => LineHeightDto)
  lineHeight: LineHeightDto;
}

export class SpacingDto {
  @ApiProperty()
  @IsString()
  xs: string;

  @ApiProperty()
  @IsString()
  sm: string;

  @ApiProperty()
  @IsString()
  md: string;

  @ApiProperty()
  @IsString()
  lg: string;

  @ApiProperty()
  @IsString()
  xl: string;
}

export class ShadowsDto {
  @ApiProperty()
  @IsString()
  sm: string;

  @ApiProperty()
  @IsString()
  md: string;

  @ApiProperty()
  @IsString()
  lg: string;

  @ApiProperty()
  @IsString()
  xl: string;
}

export class LayoutDto {
  @ApiProperty({ description: 'Header height' })
  @IsString()
  headerHeight: string;

  @ApiProperty({ description: 'Sidebar width' })
  @IsString()
  sidebarWidth: string;

  @ApiProperty({ description: 'Border radius' })
  @IsString()
  borderRadius: string;

  @ApiProperty({ type: SpacingDto })
  @ValidateNested()
  @Type(() => SpacingDto)
  spacing: SpacingDto;

  @ApiProperty({ type: ShadowsDto })
  @ValidateNested()
  @Type(() => ShadowsDto)
  shadows: ShadowsDto;
}

export class CreateBrandingDto {
  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Favicon URL' })
  @IsOptional()
  @IsUrl()
  faviconUrl?: string;

  @ApiProperty({ type: ColorSchemeDto })
  @ValidateNested()
  @Type(() => ColorSchemeDto)
  colorScheme: ColorSchemeDto;

  @ApiPropertyOptional({ type: TypographyDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TypographyDto)
  typography?: TypographyDto;

  @ApiPropertyOptional({ type: LayoutDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LayoutDto)
  layout?: LayoutDto;

  @ApiPropertyOptional({ description: 'Custom CSS' })
  @IsOptional()
  @IsString()
  customCss?: string;
}

export class UpdateBrandingDto {
  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Favicon URL' })
  @IsOptional()
  @IsUrl()
  faviconUrl?: string;

  @ApiPropertyOptional({ type: ColorSchemeDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ColorSchemeDto)
  colorScheme?: ColorSchemeDto;

  @ApiPropertyOptional({ type: TypographyDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TypographyDto)
  typography?: TypographyDto;

  @ApiPropertyOptional({ type: LayoutDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LayoutDto)
  layout?: LayoutDto;

  @ApiPropertyOptional({ description: 'Custom CSS' })
  @IsOptional()
  @IsString()
  customCss?: string;
}