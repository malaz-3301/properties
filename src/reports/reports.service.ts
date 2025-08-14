import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import {
  Language,
  Reason,
  ReportStatus,
  ReportTitle,
  UserType,
} from '../utils/enums';
import { UsersService } from 'src/users/users.service';
import { I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { UsersGetProvider } from 'src/users/providers/users-get.provider';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private usersGetProvider: UsersGetProvider,
    private i18nService: I18nService,
    private configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async report(createReportDto: CreateReportDto) {
    if (createReportDto.reason === Reason.Other) {
      createReportDto.reason = createReportDto.otherReason;
    }
    const report = this.reportRepository.create(createReportDto);
    report.mult_description['ar'] = createReportDto.description;
    report.mult_description['en'] = await this.usersGetProvider.translate(
      Language.ENGLISH,
      createReportDto.description,
    );
    report.mult_description['de'] = await this.usersGetProvider.translate(
      Language.Germany,
      createReportDto.description,
    );
    await this.reportRepository.save(report);
  }

  async getAll(payloadId: number) {
    //فرز الشكاوي للادمن و للفريق المالي
    const user = await this.usersRepository.findOneBy({ id: payloadId });
    if (user?.userType === UserType.SUPER_ADMIN) {
      const reports = await this.reportRepository.find({
        where: { title: Not(ReportTitle.T3) },
      });
      for (let i = 0; i < reports.length; i++) {
        reports[i].reportStatus = this.i18nService.t(
          `transolation.${reports[i].reportStatus}`,
          {
            lang: user.language,
          },
        );
        reports[i].title = this.i18nService.t(
          `transolation.${reports[i].title}`,
          {
            lang: user.language,
          },
        );
        reports[i].reason = this.i18nService.t(
          `transolation.${reports[i].reason}`,
          {
            lang: user.language,
          },
        );
        if (user.language == Language.ARABIC) {
          reports[i]['description'] = reports[i].mult_description['ar'];
        } else if(user.language == Language.ENGLISH){
          reports[i]['description'] = reports[i].mult_description['en'];
        }
        else {
          reports[i]['description'] = reports[i].mult_description['de'];
        }
      }
      return reports;
    } else if (user?.userType === UserType.Financial) {
      const reports = await this.reportRepository.find({
        where: { title: ReportTitle.T3 },
      });
      for (let i = 0; i < reports.length; i++) {
        reports[i].reportStatus = this.i18nService.t(
          `transolation.${reports[i].reportStatus}`,
          {
            lang: user.language,
          },
        );
        reports[i].title = this.i18nService.t(
          `transolation.${reports[i].title}`,
          {
            lang: user.language,
          },
        );
        reports[i].reason = this.i18nService.t(
          `transolation.${reports[i].reason}`,
          {
            lang: user.language,
          },
        );
        if (user.language == Language.ARABIC) {
          reports[i]['description'] = reports[i].mult_description['ar'];
        } else if(user.language == Language.ENGLISH){
          reports[i]['description'] = reports[i].mult_description['en'];
        }
        else {
          reports[i]['description'] = reports[i].mult_description['de'];
        }
      }
      return reports;
    }
  }

  async getAllPending(payloadId: number) {
    const user = await this.usersRepository.findOneBy({ id: payloadId });
    if (user?.userType === UserType.SUPER_ADMIN) {
      const reports = await this.reportRepository.find({
        where: {
          title: Not(ReportTitle.T3),
          reportStatus: ReportStatus.PENDING,
        },
      });
      for (let i = 0; i < reports.length; i++) {
        reports[i].reportStatus = this.i18nService.t(
          `transolation.${reports[i].reportStatus}`,
          {
            lang: user.language,
          },
        );
        reports[i].title = this.i18nService.t(
          `transolation.${reports[i].title}`,
          {
            lang: user.language,
          },
        );
        reports[i].reason = this.i18nService.t(
          `transolation.${reports[i].reason}`,
          {
            lang: user.language,
          },
        );
        if (user.language == Language.ARABIC) {
          reports[i]['description'] = reports[i].mult_description['ar'];
        } else if(user.language == Language.ENGLISH){
          reports[i]['description'] = reports[i].mult_description['en'];
        }
        else {
          reports[i]['description'] = reports[i].mult_description['de'];
        }
      }
      return reports
    } else if (user?.userType === UserType.Financial) {
      const reports = await this.reportRepository.find({
        where: { title: ReportTitle.T3, reportStatus: ReportStatus.PENDING },
      });
      for (let i = 0; i < reports.length; i++) {
        reports[i].reportStatus = this.i18nService.t(
          `transolation.${reports[i].reportStatus}`,
          {
            lang: user.language,
          },
        );
        reports[i].title = this.i18nService.t(
          `transolation.${reports[i].title}`,
          {
            lang: user.language,
          },
        );
        reports[i].reason = this.i18nService.t(
          `transolation.${reports[i].reason}`,
          {
            lang: user.language,
          },
        );
        if (user.language == Language.ARABIC) {
          reports[i]['description'] = reports[i].mult_description['ar'];
        } else if(user.language == Language.ENGLISH){
          reports[i]['description'] = reports[i].mult_description['en'];
        }
        else {
          reports[i]['description'] = reports[i].mult_description['de'];
        }
      }
      return reports;
    }
  }

  async getOne(reportId: number, userId: number) {
    const user = await this.usersGetProvider.findById(userId);
    const report = await this.reportRepository.findOneBy({ id: reportId });
    if (!report) {
      throw new NotFoundException();
    }

    report.reportStatus = this.i18nService.t(
      `transolation.${report.reportStatus}`,
      {
        lang: user.language,
      },
    );
    report.title = this.i18nService.t(`transolation.${report.title}`, {
      lang: user.language,
    });
    report.reason = this.i18nService.t(`transolation.${report.reason}`, {
      lang: user.language,
    });
    if (user.language == Language.ARABIC) {
      report['description'] = report.mult_description['ar'];
    } else if(user.language == Language.ENGLISH){
      report['description'] = report.mult_description['en'];
    }
    else {
      report['description'] = report.mult_description['de'];
    }

    return report;
  }

  hide(reportId: number) {
    return this.reportRepository.update(reportId, {
      reportStatus: ReportStatus.Rejected,
    });
  }
}
