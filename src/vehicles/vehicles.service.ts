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
import { UsersOtpProvider } from '../users/users-otp.provider';
import { FilterVehicleDto } from './dto/filter-vehicle.dto';
import { GeolocationService } from '../geolocation/geolocation.service';
import { Property } from '../properties/entities/property.entity';
import { PropertiesService } from '../properties/properties.service'; //important

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private readonly usersService: UsersService,
    private readonly usersOtpProvider: UsersOtpProvider,
    private readonly propertiesService: PropertiesService,
  ) {}

  async create(newCreateVehicleDto: CreateVehicleDto, id: number) {
    const { createPropertyDto, ...createVehicleDto } = newCreateVehicleDto;

    const newProperty: Property = await this.propertiesService.create(
      createPropertyDto,
      id,
    );
    const newVehicle: Vehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      property: newProperty,
    });

    return this.vehicleRepository.save(newVehicle);
  }

  async getAll(query: FilterVehicleDto, state?: PropertyStatus) {
    const vehicleFilters: FindOptionsWhere<Vehicle>[] = [];
    const propertyFilters: FindOptionsWhere<Property>[] = [];
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
      propertyFilters.push({ title: Like(`%${word}%`) });
      propertyFilters.push({ description: Like(`%${word}%`) });
      vehicleFilters.push({ model: Like(`%${word}%`) });
    }
    if ('isForRent' in query) {
      propertyFilters.push({ isForRent: isForRent });
    }
    if ('condition' in query) {
      vehicleFilters.push({ condition: condition });
    }
    if ('fuelType' in query) {
      vehicleFilters.push({ fuelType: fuelType });
    }
    if ('transmission' in query) {
      vehicleFilters.push({ transmission: transmission });
    }
    const priceConditions = {
      property: {
        price: this.rangeConditions(minPrice, maxPrice),
      },
    };
    const yearConditions = { year: this.rangeConditions(minYear, maxYear) };
    const mileageConditions = {
      mileage: this.rangeConditions(minMileage, maxMileage),
    };

    const where: FindOptionsWhere<Vehicle>[] = (
      vehicleFilters.length ? vehicleFilters : [{}]
    ).flatMap((vehicleFilter) =>
      (propertyFilters.length ? propertyFilters : [{}]).map(
        (propertyFilter) => ({
          ...vehicleFilter,
          ...yearConditions,
          ...mileageConditions,
          property: {
            ...propertyFilter,
            ...priceConditions.property,
          },
        }),
      ),
    );

    const vehicles: Vehicle[] = await this.vehicleRepository.find({
      where,
      relations: { property: true },
      select: {
        property: {
          user: {
            username: true,
          },
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
      where: { property: { user: { id: userId } } },
    });
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto) {
    const vehicle = await this.findById(id);
    return this.vehicleRepository.update(id, updateVehicleDto);
  }

  async deleteMyVehicle(id: number, userId: number, password: string) {
    const vehicle = await this.vehicleRepository.findOne({
      //if it is mine && get password
      where: { id: id, property: { user: { id: userId } } },
      relations: { property: true },
      select: { property: { user: { password: true } } },
    });
    if (!vehicle) {
      throw new NotFoundException('Removed by Admin Or it is not yours');
    }
    const isPass = await bcrypt.compare(
      password,
      vehicle.property.user.password,
    );
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
      relations: { property: { user: true } },
      select: {
        property: { user: { username: true } },
      },
    });
    if (!vehicle) {
      throw new NotFoundException('vehicle Not Found ');
    }
    return vehicle;
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
}
