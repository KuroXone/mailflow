import { IsEmail, IsString, IsOptional, IsArray, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() firstName?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() lastName?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() source?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsArray() tags?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsObject() customFields?: Record<string, any>;
  @ApiProperty({ required: false }) @IsOptional() @IsString() listId?: string;
}

export class UpdateContactDto extends PartialType(CreateContactDto) {}

export class CreateListDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
}

export class ImportCsvDto {
  @ApiProperty() @IsString() listId: string;
}

export class BulkTagDto {
  @ApiProperty() @IsArray() contactIds: string[];
  @ApiProperty() @IsArray() @IsString({ each: true }) tags: string[];
}
