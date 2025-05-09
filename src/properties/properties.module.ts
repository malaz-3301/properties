import {
  BadRequestException,
  forwardRef,
  Module,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { Property } from './entities/property.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { GeolocationModule } from '../geolocation/geolocation.module';
import { MulterModule } from '@nestjs/platform-express';
import { VehiclesService } from '../vehicles/vehicles.service';
import { diskStorage } from 'multer';
import e, { Express } from 'express';
import { PropertiesImgProvider } from './properties-img.provider';
import { PropertiesDelProvider } from './properties-del.provider';
import { PropertiesGetProvider } from './properties-get.provider';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    GeolocationModule,
    TypeOrmModule.forFeature([Property]),
    MulterModule.registerAsync({
      imports: [forwardRef(() => PropertiesModule)],
      inject: [PropertiesService],
      // closure
      useFactory: (propertiesService: PropertiesService) => {
        return {
          storage: diskStorage({
            // اول مرحلة جيب ال type
            destination: (req, file, cb) => {
              const id = Number(req.params.id);

              propertiesService
                .getByPropId(id)
                .then((property) => {
                  cb(null, `./images/${property.propertyType}`);
                })
                .catch((err) => {
                  cb(new NotFoundException('Property not found'), 'null');
                });
            },
            filename(
              req: e.Request,
              file: Express.Multer.File,
              callback: (error: Error | null, filename: string) => void,
            ) {
              const prefix = `${Date.now()}-${Math.round(Math.random() * 10000)}`;
              const filename = `${prefix}-${file.originalname}`;
              callback(null, filename);
            },
          }),
          async fileFilter(req, file, callback) {
            if (file.mimetype.startsWith('image')) {
              callback(null, true);
            } else {
              callback(
                new BadRequestException('Unsupported Media Type'),
                false,
              );
            }
            //Everyone's uncle - MALAZ

            const id = Number(req.params.id);
            const userId = Number(req.payload.id);
            propertiesService.MyProperty(id, userId).catch((err) => {
              callback(
                new UnauthorizedException(
                  'Dont Try Property is not yours Or Not found',
                ),
                false,
              ); //);
            });
          },
          limits: { fileSize: 1024 * 1024 * 2 },
        };
      },
    }),
  ],
  controllers: [PropertiesController],
  providers: [
    PropertiesService,
    PropertiesImgProvider,
    PropertiesDelProvider,
    PropertiesGetProvider,
  ],
  exports: [PropertiesService],
})
export class PropertiesModule {}
