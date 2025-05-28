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
import { post } from 'axios';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('mark_as_read')
  @UseGuards(AuthGuard)
  markAsRead(
    @Body('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.notificationsService.markAsRead(user.id, id);
  }
  @Post('mark_all_as_read')
  @UseGuards(AuthGuard)
  markAllAsRead(@CurrentUser() user: JwtPayloadType) {
    return this.notificationsService.markAllAsRead(user.id);
  }
  @Get('unread_notifications')
  @UseGuards(AuthGuard)
  getUnreadNotification(@CurrentUser() user: JwtPayloadType) {
    return this.notificationsService.getUnreadNotifications(user.id);
  }

  @Get('read_notification')
  @UseGuards(AuthGuard)
  getReadNotification(@CurrentUser() user: JwtPayloadType) {
    return this.notificationsService.getReadNotifications(user.id);
  }
  @Get('all_my_notifications')
  @UseGuards(AuthGuard)
  getMyNotifications(@CurrentUser() user: JwtPayloadType) {
    return this.notificationsService.getMyNotifications(user.id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body() createNotificationDto: CreateNotificationDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.notificationsService.create(createNotificationDto, user.id);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
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
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.remove(id);
  }
}
