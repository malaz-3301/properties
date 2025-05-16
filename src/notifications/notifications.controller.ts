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
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayloadType } from 'src/utils/constants';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

@Get('test')
test(){
  return this.notificationsService.getReadNotifications(1);
}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationsService.remove(id);
  }

  @Post('mark_as_read/:id')
  @UseGuards(AuthGuard)
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.notificationsService.markAsRead(user.id, id);
  }
}
