import { IsString, IsOptional, IsArray, IsBoolean, IsDateString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty() @IsString() @IsNotEmpty() subject: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() previewText?: string;
  @ApiProperty() @IsString() fromName: string;
  @ApiProperty() @IsString() fromEmail: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() replyTo?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() htmlContent?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() textContent?: string;
  @ApiProperty({ required: false }) @IsOptional() jsonContent?: any;
  @ApiProperty({ required: false }) @IsOptional() @IsString() templateId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsArray() listIds?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsArray() segmentIds?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() trackOpens?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() trackClicks?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsString() utmSource?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() utmMedium?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() utmCampaign?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() smtpConfigId?: string;
}

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {}

export class ScheduleCampaignDto {
  @ApiProperty() @IsDateString() scheduledAt: string;
}

export class TestEmailDto {
  @ApiProperty() @IsString() @IsNotEmpty() email: string;
}
