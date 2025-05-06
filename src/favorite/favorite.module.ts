import { Module } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './entites/favorite.entity';
import { FavoriteController } from './favorite.controller';
import { EstateModule } from 'src/estate/estates.module';
import { VehiclesModule } from 'src/vehicles/vehicles.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports : [AuthModule,TypeOrmModule.forFeature([Favorite]), EstateModule, VehiclesModule],
  providers: [FavoriteService],
  controllers: [FavoriteController]
})
export class FavoriteModule {}
