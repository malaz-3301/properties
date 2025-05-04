import {
  BadRequestException,
  forwardRef,
  Module,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from './entities/vehicle.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import e, { Express } from 'express';
import { VehImgProvider } from './veh-img.provider';
import { UsersOtpProvider } from '../users/users-otp.provider';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TypeOrmModule.forFeature([Vehicle]),
    MulterModule.registerAsync({
      imports: [forwardRef(() => VehiclesModule)],
      inject: [VehiclesService],
      // closure
      useFactory: (vehiclesService: VehiclesService) => {
        return {
          storage: diskStorage({
            destination: './images/vehicles',
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
            const exists = await vehiclesService.MyVehicle(id, userId);
            if (!exists) {
              callback(
                new UnauthorizedException(
                  'Dont Try Estate is not yours Or Not found',
                ),
                false,
              );
            }
          },
          limits: { fileSize: 1024 * 1024 * 2 },
        };
      },
    }),
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService, VehImgProvider],
  exports: [VehiclesService],
})
export class VehiclesModule {}
