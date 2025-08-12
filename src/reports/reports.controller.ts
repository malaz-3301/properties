import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { AuthRolesGuard } from '../auth/guards/auth-roles.guard';
import { Roles } from '../auth/decorators/user-role.decorator';
import { UserType } from '../utils/enums';
import { JwtPayloadType } from '../utils/constants';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  report(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.report(createReportDto);
  }

  @Get()
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.SUPER_ADMIN, UserType.Financial)
  getAll(@CurrentUser() payload: JwtPayloadType) {
    return this.reportsService.getAll(payload.id);
  }

  @Get('pending')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.SUPER_ADMIN, UserType.Financial)
  getAllPending(@CurrentUser() payload: JwtPayloadType) {
    return this.reportsService.getAllPending(payload.id);
  }

  @Get(':reportId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.SUPER_ADMIN, UserType.Financial)
  getOne(@Param('reportId', ParseIntPipe) reportId: number, @CurrentUser() payload: JwtPayloadType) {
    return this.reportsService.getOne(reportId, payload.id);
  }

  @Patch(':reportId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.SUPER_ADMIN, UserType.Financial)
  update(
    @Param('reportId', ParseIntPipe) reportId: number,
    @Query('action', ParseBoolPipe) action: boolean,
  ) {
    return this.reportsService.hide(reportId);
  }
}
