import { Body, Controller, Get, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayloadType } from 'src/utils/constants';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post('')
   @UseGuards(AuthGuard)
   changeStatusOfFavorite(
     @CurrentUser() user: JwtPayloadType,
     @Body('propertyId',ParseIntPipe ) propertyId: number,
   ) {
     return this.favoriteService.changeStatusOfFavorite(
       user.id,
       propertyId,
     );
   }
   @Get('')
   @UseGuards(AuthGuard)
   getAllFavorites(@CurrentUser() user: JwtPayloadType,) {
     return this.favoriteService.getAllFavorites(user.id);
   }
   @Get('isFavorite')
   @UseGuards(AuthGuard)
   isFavorite(@CurrentUser() user: JwtPayloadType, @Body('propertyId',ParseIntPipe ) propertyId: number,){
     return this.favoriteService.isFavorite(user.id, propertyId);
   }
}
