import {
  BadRequestException,
  forwardRef,
  Module,
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
import { diskStorage } from 'multer';
import e, { Express } from 'express';
import { PropertiesImgProvider } from './providers/properties-img.provider';
import { PropertiesDelProvider } from './providers/properties-del.provider';
import { PropertiesGetProvider } from './providers/properties-get.provider';
import { PropertiesAdminController } from './properties-admin.controller';
import { PropertiesUpdateProvider } from './providers/properties-update.provider';
import { AuditModule } from '../audit/audit.module';
import { PropertiesVoViProvider } from './providers/properties-vo-vi.provider';
import { FavoriteModule } from '../favorite/favorite.module';
import { VotesModule } from '../votes/votes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Property]),
    AuthModule,
    UsersModule,
    GeolocationModule,
    AuditModule,
    FavoriteModule,
    forwardRef(() => VotesModule),
    MulterModule.registerAsync({
      imports: [forwardRef(() => PropertiesModule)],
      inject: [PropertiesService],
      // closure
      useFactory: (propertiesService: PropertiesService) => {
        return {
          storage: diskStorage({
            destination: './images/properties',
            filename(
              req: e.Request,
              file: Express.Multer.File,
              callback: (error: Error | null, filename: string) => void,
            ) {
              const prefix = `${Date.now()}-${Math.round(Math.random() * 10000)}`;
              const filename = `${prefix}-${file.originalname}`.replace(
                /[\s,]/g,
                '',
              );
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
  controllers: [PropertiesController, PropertiesAdminController],
  providers: [
    PropertiesService,
    PropertiesUpdateProvider,
    PropertiesImgProvider,
    PropertiesDelProvider,
    PropertiesGetProvider,
    PropertiesVoViProvider,
  ],
  exports: [
    PropertiesService,
    PropertiesUpdateProvider,
    PropertiesImgProvider,
    PropertiesDelProvider,
    PropertiesGetProvider,
    PropertiesVoViProvider,
  ],
})
export class PropertiesModule {}
