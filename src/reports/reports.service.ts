import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { Reason, ReportStatus, ReportTitle, UserType } from '../utils/enums';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async report(createReportDto: CreateReportDto) {
    if (createReportDto.reason === Reason.Other) {
      createReportDto.reason = createReportDto.otherReason;
    }
    await this.reportRepository.save(createReportDto);
  }

  async getAll(payloadId: number) {
    //فرز الشكاوي للادمن و للفريق المالي
    const user = await this.usersRepository.findOneBy({ id: payloadId });
    if (user?.userType === UserType.SUPER_ADMIN) {
      return this.reportRepository.find({
        where: { title: Not(ReportTitle.T3) },
      });
    } else if (user?.userType === UserType.Financial) {
      return this.reportRepository.find({
        where: { title: ReportTitle.T3 },
      });
    }
  }

  async getAllPending(payloadId: number) {
    const user = await this.usersRepository.findOneBy({ id: payloadId });
    if (user?.userType === UserType.SUPER_ADMIN) {
      return this.reportRepository.find({
        where: {
          title: Not(ReportTitle.T3),
          reportStatus: ReportStatus.PENDING,
        },
      });
    } else if (user?.userType === UserType.Financial) {
      return this.reportRepository.find({
        where: { title: ReportTitle.T3, reportStatus: ReportStatus.PENDING },
      });
    }
  }

  async getOne(reportId: number) {
    const report = await this.reportRepository.findOneBy({ id: reportId });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    return report;
  }

  async update(reportId: number, action: boolean) {
    await this.getOne(reportId);
    if (action) {
      console.log(reportId);
      return this.reportRepository.update(reportId, {
        reportStatus: ReportStatus.FIXED,
      });
    } else {
      return this.reportRepository.update(reportId, {
        reportStatus: ReportStatus.Rejected,
      });
    }
  }
}
