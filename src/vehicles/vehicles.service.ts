import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Like,
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  FindOptionsWhere,
} from 'typeorm';
import { UsersService } from '../users/users.service';
import { PropertyStatus } from '../utils/enums';
import * as bcrypt from 'bcryptjs';
import { Vehicle } from './entities/vehicle.entity';
import { VehImgProvider } from './veh-img.provider';
import { UsersOtpProvider } from '../users/users-otp.provider';
import { FilterVehicleDto } from './dto/filter-vehicle.dto'; //important
import { Favorite } from 'src/favorite/entites/favorite.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    private readonly vehImgProvider: VehImgProvider,
    private readonly usersService: UsersService,
    private readonly usersOtpProvider: UsersOtpProvider,
  ) {}

  async create(createVehicleDto: CreateVehicleDto, id: number) {
    const user = await this.usersOtpProvider.findById(id);
    const newVehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      user,
    });
    //newVehicle :(
    return this.vehicleRepository.save(newVehicle);
  }

  async getAll(query: FilterVehicleDto, state?: PropertyStatus) {
    const filters: FindOptionsWhere<Vehicle>[] = [];
    const {
      word,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      minMileage,
      maxMileage,
      isForRent,
      condition,
      fuelType,
      transmission,
    } = query;
    // شرط البحث
    if (word) {
      filters.push({ title: Like(`%${word}%`) });
      filters.push({ description: Like(`%${word}%`) });
      filters.push({ model: Like(`%${word}%`) });
    }
    if ('isForRent' in query) {
      filters.push({ isForRent: isForRent });
    }
    if ('condition' in query) {
      filters.push({ condition: condition });
    }
    if (' fuelType' in query) {
      filters.push({ fuelType: fuelType });
    }
    if ('transmission' in query) {
      filters.push({ transmission: transmission });
    }
    const priceConditions = { price: this.rangeConditions(minPrice, maxPrice) };
    const yearConditions = { year: this.rangeConditions(minYear, maxYear) };
    const mileageConditions = {
      mileage: this.rangeConditions(minMileage, maxMileage),
    };

    const where =
      filters.length > 0
        ? filters.map((filter) => ({ ...filter, ...priceConditions }))
        : { ...priceConditions, ...yearConditions };

    const vehicles: Vehicle[] = await this.vehicleRepository.find({
      where,
      relations: { user: true },
      select: {
        user: {
          username: true,
        },
      },
    });
    if (!vehicles || vehicles.length === 0) {
      throw new NotFoundException('No vehicles found');
    }
    return vehicles;
  }

  async getById(id: number) {
    return await this.findById(id);
  }

  async getByUserId(userId: number) {
    return this.vehicleRepository.find({
      where: { user: { id: userId } },
    });
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto) {
    const vehicle = await this.findById(id);
    return this.vehicleRepository.update(id, updateVehicleDto);
  }

  async deleteMyVehicle(id: number, userId: number, password: string) {
    const vehicle = await this.vehicleRepository.findOne({
      //if it is mine && get password
      where: { id: id, user: { id: userId } },
      relations: { user: true },
      select: { user: { password: true } },
    });
    if (!vehicle) {
      throw new NotFoundException('Removed by Admin Or it is not yours');
    }
    const isPass = await bcrypt.compare(password, vehicle.user.password);
    if (!isPass) {
      throw new UnauthorizedException('Password is incorrect');
    }
    return this.vehicleRepository.delete({ id: id });
  }

  async deleteVehicleById(id: number) {
    const vehicle = this.findById(id);
    return this.vehicleRepository.delete({ id: id });
  }

  async findById(id: number) {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: id },
      relations: { user: true },
      select: {
        user: { username: true },
      },
    });
    if (!vehicle) {
      throw new NotFoundException('vehicle Not Found ');
    }
    return vehicle;
  }

  /**
   *  Remove Profile Image
   * @param id
   * @param userId
   * @param filename
   */
  async setVehicleImg(id: number, userId: number, filename: string) {
    return this.vehImgProvider.setVehicleImg(id, userId, filename);
  }

  async setMultiImg(id: number, userId: number, filenames: string[]) {
    return this.vehImgProvider.setMultiImg(id, userId, filenames);
  }

  async removeVehicleImage(id: number, userId: number) {
    return this.vehImgProvider.removeVehicleImage(id, userId);
  }

  async removeAnyImg(id: number, userId: number, imageName: string) {
    return this.vehImgProvider.removeAnyImg(id, userId, imageName);
  }

  async MyVehicle(id: number, userId: number) {
    return this.vehImgProvider.MyVehicle(id, userId);
  }

  rangeConditions(minRange?: string, maxRange?: string) {
    if (minRange && maxRange) {
      return Between(parseInt(minRange), parseInt(maxRange));
    } else if (minRange) {
      return MoreThanOrEqual(parseInt(minRange));
    } else if (maxRange) {
      return LessThanOrEqual(parseInt(maxRange));
    }
  }

  async getFavoriteVehicles (ids : number[]) {
    return Promise.all(ids.map(async (id) => {
      return this.findById(id);
    }));
    }
}
