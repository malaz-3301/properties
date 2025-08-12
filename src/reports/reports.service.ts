import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { Language, Reason, ReportStatus, ReportTitle, UserType } from '../utils/enums';
import { UsersService } from 'src/users/users.service';
import { I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private userService: UsersService,
    private i18nService: I18nService,
    private configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async report(createReportDto: CreateReportDto) {
    if (createReportDto.reason === Reason.Other) {
      createReportDto.reason = createReportDto.otherReason;
    }
    if (createReportDto.description) {
      createReportDto['ar_description'] = createReportDto.description;
      createReportDto['en_description'] = await this.translate(
        Language.ENGLISH,
        createReportDto.description,
      );
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

  async getOne(reportId: number, userId: number) {
    const user = await this.userService.getUserById(userId);
    const report = await this.reportRepository.findOneBy({ id: reportId });
    let message;
    if (report) {
      message = this.i18nService.t(`transolation.${report.reason}`, {
        lang: user.language,
      });
      if (user.language == Language.ARABIC) {
        report['description'] = report.ar_description;
      } else {
        report['description'] = report.en_description;
      }
    }
    return { message, ...report };
  }

  hide(reportId: number) {
    return this.reportRepository.update(reportId, {
      reportStatus: ReportStatus.Rejected,
    });
  }

  async translate(targetLang: Language, text: string) {
    const Url = this.configService.get<string>('TRANSLATE');
    const sourceLang = Language.ARABIC;
    const Url1 =
      Url +
      `?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    let translatedText;
    await fetch(Url1)
      .then((response) => response.json())
      .then((data) => {
        translatedText = data[0][0][0];
      })
      .catch((error) => {
        console.error('حدث خطأ:', error);
        console.log(Url1);
      });
    return translatedText;
  }
}
