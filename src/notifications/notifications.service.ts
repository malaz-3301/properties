import {
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Any, FindOperator, IsNull, Not, Repository } from 'typeorm';
import { ContractsService } from 'src/contracts/contracts.service';
import { UsersService } from 'src/users/users.service';
import { IsDate } from 'class-validator';
import * as admin from 'firebase-admin';
import { env, title } from 'node:process';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { Contract } from 'src/contracts/entities/contract.entity';
import { UsersGetProvider } from 'src/users/providers/users-get.provider';

@Injectable()
export class NotificationsService {
  onModuleInit() {
    const configService = new ConfigService();
    admin.initializeApp({
      credential: admin.credential.cert({
        clientEmail: configService.get('CLIENT_EMAIL'),
        privateKey: configService.get('PRIVATE_KEY').replace(/\\n/g, '\n'),
        projectId: configService.get('PROJECT_ID'),
      }),
    });
  }

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly usersGetProvider: UsersGetProvider,
    @Inject(forwardRef(() => ContractsService))
    private readonly contractService: ContractsService,
    private i18nService: I18nService,
  ) {}

  private readonly logger = new Logger(NotificationsService.name);

  @Cron('0 30 11 * * *')
  async handleCron() {
    const contracts = await this.contractService.expiredAfterWeek();
    for (let index = 0; index < contracts.length; index++) {
      await this.sendNotificationForAllSidesInProperties(
        contracts[index],
        'EndsOn',
      );
    }
  }

  async create(createNotificationDto: CreateNotificationDto, userId: number) {
    const newNotification = this.notificationRepository.create({
      ...createNotificationDto,
      user: { id: userId },
      readAt: null,
      property: { id: createNotificationDto.propertyId },
    });

    const user = await this.usersGetProvider.findById(userId);
    newNotification.usre_language_message = await this.usersGetProvider.translate(user.language, createNotificationDto.message);
    await this.sendNotificationToDevice(
      user.token,
      createNotificationDto.title,
      createNotificationDto.message,
    );
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

  async getMyNotifications(userId: number) {
    const unread = await this.getUnreadNotifications(userId);
    const read = await this.getReadNotifications(userId);
    return { unread: unread, read: read };
  }

  async sendNotificationToDevice(token: string, title: string, body: string) {
    const message: admin.messaging.Message = {
      token,
      notification: {
        title,
        body,
      },
    };

    try {
      const response = await admin.messaging().send(message);

      return response;
    } catch (error) {
      throw error;
    }
  }
  async sendNotificationForAllSidesInProperties(
    contract: Contract,
    message: string,
  ) {
    const owner = await this.usersGetProvider.findById(
      contract.property.owner.id,
    );
    const user = await this.usersGetProvider.findById(contract.user.id);
    const agency = await this.usersGetProvider.findById(contract.agency.id);
    const ownerMessage = await this.i18nService.t(`transolation.${message}`, {
      lang: owner.language,
    });
    const ownerNotification = this.notificationRepository.create({
      property: contract.property,
      user: contract.user,
      usre_language_message: `${ownerMessage} ${contract.expireIn}`,
    });
    await this.notificationRepository.save(ownerNotification);
    const userMessage = await this.i18nService.t(`transolation.${message}`, {
      lang: user.language,
    });
    const userNotification = this.notificationRepository.create({
      property: contract.property,
      user: contract.property.owner,
      usre_language_message: `${userMessage} ${contract.expireIn}`,
    });
     await this.notificationRepository.save(userNotification);
    const agencyMessage = await this.i18nService.t(`transolation.${message}`, {
      lang: agency.language,
    });
    const agencyNotification = this.notificationRepository.create({
      property: contract.property,
      user: contract.agency,
      usre_language_message: `${agencyMessage} ${contract.expireIn}`,
    });
    await this.notificationRepository.save(agencyNotification);
  }
}
