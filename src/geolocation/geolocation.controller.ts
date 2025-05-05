import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseFloatPipe,
} from '@nestjs/common';
import { GeolocationService } from './geolocation.service';
import { CreateGeolocationDto } from './dto/create-geolocation.dto';
import { UpdateGeolocationDto } from './dto/update-geolocation.dto';

@Controller('geolocation')
export class GeolocationController {
  constructor(private readonly geolocationService: GeolocationService) {}

  @Get('reverse')
  async reverse(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lon', ParseFloatPipe) lon: number,
  ) {
    return this.geolocationService.reverse_geocoding(lat, lon);
  }
}
