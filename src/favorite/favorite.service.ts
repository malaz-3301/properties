import { HttpException, Injectable } from '@nestjs/common';
import { PropertyDetailsDto } from './dto/property-details.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from './entites/favorite.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  findFavorite(userId: number, propertyId: number) {
    return this.favoriteRepository.findOne({
      where: {
        property: { id: propertyId },
        user: { id: userId },
      },
    });
  }

  async isFavorite(userId: number, propetyId: number) {
    const isFavorite = await this.findFavorite(userId, propetyId);
    if (!isFavorite) {
      return false;
    } else {
      return isFavorite.isFavorite;
    }
  }

  async changeStatusOfFavorite(userId: number, propertyId: number) {
    const favorite = await this.findFavorite(userId, propertyId);

    if (favorite) {
      favorite.isFavorite = favorite.isFavorite ? false : true;
      return this.favoriteRepository.update(favorite.id, favorite);
    } else {
      const newFavorite = this.favoriteRepository.create({
        property: { id: propertyId },
        user: { id: userId },
      });
      return this.favoriteRepository.save(newFavorite);
    }
  }

  // async getAllFavorites(userId: number) {
  //   const favorites = await this.favoriteRepository.find({
  //     where: { user: { id: userId } },
  //   });
  //   let vehicles: any[] = [],
  //     estates: any[] = [];
  //   favorites.forEach((favorite) => {
  //     if (favorite.propertyType == PropertyType.VEHICLE) {
  //       vehicles.push(favorite.propertyId);
  //     } else {
  //       if (favorite.propertyType == PropertyType.ESTATE) {
  //         estates.push(favorite.propertyId);
  //       }
  //     }
  //   });
  //   estates = await this.estateService.getFavoriteEstates(estates);
  //   vehicles = await this.vehicleService.getFavoriteVehicles(vehicles);

  //   return { estates: estates, vehicles: vehicles };
  // }
}
