import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as retry from 'async-retry';

@Injectable()
export class GeolocationService {
  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async reverse_geocoding(lat: number, lon: number) {
    const baseUrl = this.configService.get<string>('BASE_URL');
    const apiKey = this.configService.get<string>('API_KEY');

    const url =
      `${baseUrl}` +
      `?q=${lat}+${lon}` +
      `&key=${apiKey}` +
      `&language=ar` +
      `&roadinfo=1` +
      `&pretty=1`;

    return await retry(
      async (bail, attempt) => {
        try {
          console.log(`try number ${attempt}...`);
          const response = await firstValueFrom(this.httpService.get(url));
          const result = response.data.results?.[0];
          if (!result) throw new NotFoundException('لا توجد نتائج');

          const comp = result.components;
          return {
            street: comp.road,
            quarter: comp.suburb,
            city: comp.city || comp.town,
            governorate: comp.state,
            country: comp.country,
          };
        } catch (err) {
          // إذا الخطأ غير قابل للإصلاح (مثل 400) نخرج مباشرة بدون retry
          const status = err.response?.status;
          if (status >= 400 && status < 500 && status !== 429) {
            bail(
              new HttpException(
                err.response?.data?.status?.message ||
                  'خطأ غير قابل لإعادة المحاولة',
                status,
              ),
            );
            return;
          }
          // يرمي تلقائياً ليعاد المحاولة
          throw err;
        }
      },
      {
        retries: 2, // عدد المحاولات (يعني 1 محاولة + 3 إعادة)
        minTimeout: 1000, // بين المحاولات: 1 ثانية
        maxTimeout: 3000,
        factor: 1, // exponential backoff: 1s -> 2s -> 4s ...
      },
    ).catch((err) => {
      throw new HttpException(
        err.message || 'فشل بعد عدة محاولات',
        err.status || HttpStatus.BAD_GATEWAY,
      );
    });
  }
}
