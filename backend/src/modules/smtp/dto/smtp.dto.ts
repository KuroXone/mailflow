import { IsString, IsNumber, IsBoolean, IsOptional, IsEmail, Min, Max } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateSmtpDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() host: string;
  @ApiProperty() @IsNumber() @Min(1) @Max(65535) port: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() secure?: boolean;
  @ApiProperty() @IsString() authUser: string;
  @ApiProperty() @IsString() authPass: string;
  @ApiProperty() @IsEmail() fromEmail: string;
  @ApiProperty() @IsString() fromName: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isDefault?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() dailyLimit?: number;
}

export class UpdateSmtpDto extends PartialType(CreateSmtpDto) {}
