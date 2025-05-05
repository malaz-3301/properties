import { Module } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './entites/favorite.entity';
import { FavoriteController } from './favorite.controller';

@Module({
  imports : [TypeOrmModule.forFeature([Favorite])],
  providers: [FavoriteService],
  controllers: [FavoriteController]
})
export class FavoriteModule {}
