import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  report(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.report(createReportDto);
  }

  @Get()
  getAll() {
    return this.reportsService.getAll();
  }

  @Get('pending')
  getAllPending() {
    return this.reportsService.getAll();
  }

  @Get(':reportId')
  getOne(@Param('reportId', ParseIntPipe) reportId: number) {
    return this.reportsService.getOne(reportId);
  }

  @Patch(':reportId')
  hide(@Param('reportId', ParseIntPipe) reportId: number) {
    return this.reportsService.hide(reportId);
  }
}
