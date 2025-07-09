import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeolocationService {
  constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  //غير مربوطة
  async reverse_geocoding(lat: number, lon: number) {
    const baseUrl = this.configService.get<string>('BASE_URL');
    const apiKey = this.configService.get<string>('API_KEY');
    // عم شكل رابط كويري get
    const url =
      `${baseUrl}` +
      `?q=${lat}+${lon}` +
      `&key=${apiKey}` +
      `&language=ar` +
      `&roadinfo=1` +
      `&pretty=1`; // ينسق JSON

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const result = response.data.results?.[0];
      if (!result) throw new NotFoundException('لا توجد نتائج');

      const comp = result.components;
      return {
        street: comp.road, //غالبا ما عم تكون\
        quarter: comp.suburb, // حي أو ضاحية
        city: comp.city || comp.town,
        governorate: comp.state, // المحافظة
        country: comp.country,
        // lon: lon,
        //   lat: lat,
        // nearestPoint: {
        //  lon: result.geometry.lng,
        //   lat: result.geometry.lat,
        //  },
      };
    } catch (err) {
      throw new HttpException(
        err.response?.data?.status?.message || 'خطأ في الاتصال بـ OpenCage',
        err.response?.status || HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
