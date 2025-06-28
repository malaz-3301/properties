import {
  BadRequestException,
  forwardRef,
  Module,
  UnauthorizedException,
} from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { PropertiesService } from '../properties.service';
import { diskStorage } from 'multer';
import e, { Express } from 'express';
import { PropertiesModule } from '../properties.module';

@Module({
  imports: [
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
            //All's uncle - MALAZ

            const proId = Number(req.params.id);
            const userId = Number(req.payload.id);

            propertiesService
              .getUserPro(proId, userId, req.payload.userType)
              .catch((err) => {
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
  exports: [MulterModule],
})
export class ImgProMulterModule {}
