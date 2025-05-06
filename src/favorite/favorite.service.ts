import { HttpException, Injectable } from '@nestjs/common';
import { PropertyDetailsDto } from './dto/property-details.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from './entites/favorite.entity';
import { Repository } from 'typeorm';
import { PropertyType } from 'src/utils/enums';
import { EstateService } from 'src/estate/estates.service';
import { VehiclesService } from 'src/vehicles/vehicles.service';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    private readonly estateService: EstateService,
    private readonly vehicleService: VehiclesService,
  ) {}
  findFavorite(userId: number, propertyDetails: PropertyDetailsDto) {
    return this.favoriteRepository.findOne({
      where: {
        propertyType: propertyDetails.type,
        propertyId: propertyDetails.id,
        user: { id: userId },
      },
    });
  }
  async isFavorite(userId: number, propertyDetails: PropertyDetailsDto) {
    const isFavorite = await this.findFavorite(userId, propertyDetails);
    return isFavorite ? true : false;
  }
  async changeStatusOfFavorite(
userId: number, propertyDetails: PropertyDetailsDto,
  ) {
    const favorite = await this.findFavorite(userId, propertyDetails);
    if (favorite) {
      return this.favoriteRepository.delete({id : favorite.id});
    } else {
      let isExist : boolean;
      if(propertyDetails.type === PropertyType.ESTATE){
        const estate = await this.estateService.findById(propertyDetails.id);
        isExist = (estate)? true: false;
      } else {
        const vehicle = await this.vehicleService.findById(propertyDetails.id);
        isExist = (vehicle)? true: false;
      }
      const newFavorite = this.favoriteRepository.create({
        user: { id: userId },
        propertyId: propertyDetails.id,
        propertyType: propertyDetails.type,
      });
      return this.favoriteRepository.save(newFavorite);
    }
  }
  async getAllFavorites(userId: number) {
    const favorites = await this.favoriteRepository.find({
      where: { user: { id: userId } },
    });
    let vehicles : any[] = [], estates : any[] = [];
    favorites.forEach((favorite) => {
      if (favorite.propertyType == PropertyType.VEHICLE) {
        vehicles.push(favorite.propertyId);
      } else {
        if (favorite.propertyType == PropertyType.ESTATE) {
          estates.push(favorite.propertyId);
        }
      }
    });
    estates = await this.estateService.getFavoriteEstates(estates);
    vehicles = await this.vehicleService.getFavoriteVehicles(vehicles);

    return {estates : estates, vehicles : vehicles};
  }
}
