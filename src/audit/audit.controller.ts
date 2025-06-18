import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { CreateAuditDto } from './dto/create-audit.dto';
import { UpdateAuditDto } from './dto/update-audit.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../auth/decorators/user-role.decorator';
import { UserType } from '../utils/enums';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserType.SUPER_ADMIN, UserType.ADMIN)
  @UseGuards(AuthGuard)
  findAll() {
    return this.auditService.findAll();
  }

  @Get(':id')
  @Roles(UserType.SUPER_ADMIN, UserType.ADMIN)
  @UseGuards(AuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.auditService.findOne(id);
  }
}
