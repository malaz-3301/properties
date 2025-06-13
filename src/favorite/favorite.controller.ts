import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayloadType } from 'src/utils/constants';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post('/:prodId')
  @UseGuards(AuthGuard)
  changeStatusOfFavorite(
    @CurrentUser() user: JwtPayloadType,
    @Param('prodId', ParseIntPipe) prodId: number,
  ) {
    return this.favoriteService.changeStatusOfFavorite(user.id, prodId);
  }

  @Get('')
  @UseGuards(AuthGuard)
  getAllFavorites(@CurrentUser() user: JwtPayloadType) {
    return this.favoriteService.getAllFavorites(user.id);
  }

  @Get('isFavorite/:proId')
  @UseGuards(AuthGuard)
  isFavorite(
    @CurrentUser() user: JwtPayloadType,
    @Param('proId', ParseIntPipe) proId: number,
  ) {
    return this.favoriteService.isFavorite(user.id, proId);
  }

  // @Delete('')
  // @UseGuards(AuthGuard)
  // deleteAll(@CurrentUser() user: JwtPayloadType) {
  //   return this.favoriteService.deleteAll(user.id);
  // }

  // @Get(':id')
  // @UseGuards(AuthGuard)
  // getFavorite(
  //   @CurrentUser() user: JwtPayloadType,
  //   @Param('id', ParseIntPipe) id: number,
  // ) {
  //   return this.favoriteService.findFavorite(user.id, id);
  // }
}
