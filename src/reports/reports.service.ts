import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { Reason, ReportStatus } from '../utils/enums';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  async report(createReportDto: CreateReportDto) {
    if (createReportDto.reason === Reason.Other) {
      createReportDto.reason = createReportDto.otherReason;
    }
    await this.reportRepository.save(createReportDto);
  }

  getAll() {
    return this.reportRepository.find();
  }

  getAllPending() {
    return this.reportRepository.find({
      where: { reportStatus: ReportStatus.PENDING },
    });
  }

  getOne(reportId: number) {
    return this.reportRepository.findOneBy({ id: reportId });
  }

  hide(reportId: number) {
    return this.reportRepository.update(reportId, {
      reportStatus: ReportStatus.HIDDEN,
    });
  }
}
