import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class GeolocationService {
  constructor(private httpService: HttpService) {}

  //غير مربوطة
  async reverse(lat: number, lon: number) {
    const baseUrl = 'https://api.opencagedata.com/geocode/v1/json';
    const apiKey = '8e3ebe90927f4ea2b7305ee2204b4e47';
    const url =
      `${baseUrl}` +
      `?q=${lat}+${lon}` +
      `&key=${apiKey}` +
      `&language=ar` +
      `&roadinfo=1` +
      `&pretty=1`; // ← يُنسِّق الـ JSON للاستعراض البشري

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const result = response.data.results?.[0];
      if (!result) throw new NotFoundException('لا توجد نتائج');

      const comp = result.components;
      return {
        country: comp.country,
        region: comp.state, // المنطقة الإدارية
        city: comp.city || comp.town,
        suburb: comp.suburb, // حي أو ضاحية إن وجدت
        street: comp.road,
        house_number: comp.house_number,
        nearestPoint: {
          lat: result.geometry.lat,
          lon: result.geometry.lng,
        },
      };
    } catch (err) {
      throw new HttpException(
        err.response?.data?.status?.message || 'خطأ في الاتصال بـ OpenCage',
        err.response?.status || HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
