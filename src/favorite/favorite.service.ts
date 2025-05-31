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
    return Boolean(isFavorite);
  }

  async changeStatusOfFavorite(userId: number, propertyId: number) {
    const favorite = await this.findFavorite(userId, propertyId);

    if (favorite) {
      return this.favoriteRepository.delete(favorite.id);
    } else {
      const newFavorite = this.favoriteRepository.create({
        property: { id: propertyId },
        user: { id: userId },
      });
      return this.favoriteRepository.save(newFavorite);
    }
  }

  deleteAll(userId: number) {
    return this.favoriteRepository.delete({ user: { id: userId } });
  }

  async getAllFavorites(userId: number) {
    const favo = await this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: { property: true },
      select: {
        property: {
          id: true,
          rooms: true,
          bathrooms: true,
          area: true,
          price: true,
          firstImage: true,
          state: true,
          isForRent: true,
          propertyType: true,
          location: {
            country: true,
            governorate: true,
            city: true,
            quarter: true,
            street: true,
            lon: true,
            lat: true,
          },
        },
      },
    });
    return favo;
  }
}
