import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Any, FindOperator, IsNull, Not, Repository } from 'typeorm';
import { ContractsService } from 'src/contracts/contracts.service';
import { UsersService } from 'src/users/users.service';
import { IsDate } from 'class-validator';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly contractService: ContractsService,
    private readonly userService: UsersService,
  ) {}

  private readonly logger = new Logger(NotificationsService.name);

  @Cron('0 30 11 * * *')
  async handleCron() {
    const contracts = await this.contractService.expiredAfterWeek();
    contracts.forEach((contract) => {
      const notification = this.notificationRepository.create({
        property: contract.property,
        user: contract.user,
        message: `The property lease agreement expires on ${contract.validUntil}`,
      });
      this.notificationRepository.save(notification);
      notification.user = contract.property.user;
      this.notificationRepository.save(notification);
    });
  }

  create(createNotificationDto: CreateNotificationDto, userId: number) {
    const newNotification = this.notificationRepository.create({
      ...createNotificationDto,
      user: { id: userId },
      property: { id: createNotificationDto.propertyId },
    });
    return this.notificationRepository.save(newNotification);
  }

  findAll() {
    return this.notificationRepository.find();
  }

  findOne(id: number) {
    return this.notificationRepository.findOne({ where: { id } });
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return this.notificationRepository.update(id, updateNotificationDto);
  }

  remove(id: number) {
    return this.notificationRepository.delete(id);
  }

  async markAsRead(userId: number, notificationId: number) {
    const notification = await this.notificationRepository.findOne({
      where: {
        id: notificationId,
        user: { id: userId },
        readAt: IsNull(),
      },
    });
    if (!notification) {
      throw new HttpException('notification no found or is alredy read', 400);
    }
    notification.readAt = new Date();
    return this.notificationRepository.update(notificationId, notification);
  }

  async markAllAsRead(userId: number) {
    const notifications = await this.getUnreadNotifications(userId);
    let date = new Date();
    notifications.map((notification) => {
      notification.readAt = date;
      return this.notificationRepository.update(notification.id, notification);
    });
    return notifications;
  }

  async getUnreadNotifications(userId: number) {
    const notifications = await this.notificationRepository.find({
      where: { user: { id: userId }, readAt: IsNull() },
    });
    return notifications;
  }

  async getReadNotifications(userId: number) {
    const notifications = await this.notificationRepository.find({
      where: { user: { id: userId }, readAt: Not(IsNull()) },
    });
    return notifications;
  }

  getAMyNotifications(userId: number) {
    const unread = this.getUnreadNotifications(userId);
    const read = this.getReadNotifications(userId);
    return { unread: unread, read: read };
  }
}
