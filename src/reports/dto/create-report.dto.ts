import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import { Reason, ReportTitle } from '../../utils/enums';

export class CreateReportDto {
  @IsNotEmpty()
  @IsEnum(ReportTitle)
  title: ReportTitle;

  @IsOptional() // عند الفرونت بقرر
  @IsEnum(Reason)
  reason: string; //string

  @ValidateIf((dto: CreateReportDto) => dto.reason === Reason.Other)
  @IsString()
  @Length(6, 60)
  otherReason: string;

  @IsOptional() // عند الفرونت بقرر
  @IsString()
  metadata: string;

  @IsNotEmpty()
  @Length(4, 100)
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  @Length(4, 32)
  myEmail: string;
}
