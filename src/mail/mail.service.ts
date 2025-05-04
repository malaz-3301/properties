import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/entities/user.entity';
import { firstValueFrom } from 'rxjs';
import { HttpModule, HttpService } from '@nestjs/axios';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly http: HttpService,
  ) {}

  /*
    async sendSignUpEmail(user: User) {
      const { username } = user;
      const today = new Date();
      await this.mailerService.sendMail({
        to: user.email,
        from: '<no-reply@properities.com>',
        subject: 'Sign-Up',
        template: `signup`,
        context: { today, username },
      });
    }
  
    async sendVerify(user: User) {
      const { username } = user;
      const today = new Date();
      await this.mailerService.sendMail({
        to: user.email,
        from: '<no-reply@properities.com>',
        subject: 'Verify',
        html: '<h1>verify </h1>>',
      });
    }
  
    async sendSms(phone: string, message: string) {
      const actualPhone = '+963' + phone.slice(1);
      console.log(actualPhone);
      console.log(message);
      const endpoint = 'http://192.168.1.7:8082';
      const token = '6df34585-7549-4e45-b318-47cab38e7521';
      const data = {
        to: actualPhone,
        message: message,
      };
      try {
        const response = await firstValueFrom(
          this.http.post(endpoint, data, {
            headers: { Authorization: token },
          }),
        );
        if (response) {
          return 'Message sent successfully';
        } else {
          return 'Failed to senddd message';
        }
      } catch (error) {
        return 'Failed to send message';
      }
    }*/
}
