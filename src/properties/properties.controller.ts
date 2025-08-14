import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertyStatus } from '../utils/enums';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayloadType } from '../utils/constants';
import { Response } from 'express';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { Point } from 'typeorm';
import { PointsDto } from '../geolocation/dto/points.dto';
import { NearProDto } from './dto/near-pro.dto';
import { GeoProDto } from './dto/geo-pro.dto';

//@UseInterceptors(CacheInterceptor)
@Controller('property')
//@Res not work with Cache Interceptor
export class PropertiesController {
  ///
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get('all')
  @UseGuards(AuthGuard)
  getAllAccepted(
    @Query() query: FilterPropertyDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    console.log('📍📍📍');
    query.status = PropertyStatus.ACCEPTED;
    if (user) return this.propertiesService.getAll(query, user.id);
    else return this.propertiesService.getAll(query);
  }

  @Get('geo')
  @UseGuards(AuthGuard)
  getProByGeo(
    @Query() geoProDto: GeoProDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.propertiesService.getProByGeo(geoProDto, user.id);
  }

  @Get('near')
  getProNearMe(@Query() nearProDto: NearProDto) {
    return this.propertiesService.getProNearMe(nearProDto);
  }

  @Get('top/:limit')
  @UseInterceptors(CacheInterceptor)
  getTopScorePro(@Param('limit', ParseIntPipe) limit: number) {
    return this.propertiesService.getTopScorePro(limit);
  }

  @Get(':proId')
  @UseGuards(AuthGuard)
  // @UseInterceptors(CacheInterceptor)
  @Throttle({ default: { ttl: 10000, limit: 5 } }) // منفصل overwrite
  getOnePro(
    @Param('proId', ParseIntPipe) proId: number,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.propertiesService.getOnePro(proId, user.id);
  }

  @Get('images/:image')
  @SkipThrottle()
  @UseInterceptors(CacheInterceptor)
  public showUploadedImage(
    @Param('image') imageName: string,
    @Res() res: Response,
  ) {
    return res.sendFile(imageName, { root: `images/properties` });
  }
}
