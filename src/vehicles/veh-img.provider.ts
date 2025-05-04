import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { Repository } from 'typeorm';
import { join } from 'node:path';
import { unlinkSync } from 'node:fs';
import * as process from 'node:process'; //important

@Injectable()
export class VehImgProvider {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  /**
   *  Remove Profile Image
   * @param id
   * @param userId
   * @param filename
   */
  async setVehicleImg(id: number, userId: number, filename: string) {
    const vehicle = await this.MyVehicle(id, userId);

    if (vehicle.vehicleImage) {
      unlinkSync(join(process.cwd(), `./images/vehicles/${filename}`)); //file path
    }
    vehicle.vehicleImage = filename;
    await this.vehicleRepository.save(vehicle);
    return { message: `File uploaded successfully :  ${filename}` };
  }

  async setMultiImg(id: number, userId: number, filenames: string[]) {
    const vehicle = await this.MyVehicle(id, userId);

    vehicle.vehicleImages = filenames;
    await this.vehicleRepository.save(vehicle);
    return {
      message: `File uploaded successfully :  ${filenames}`,
    };
  }

  /**
   *
   * @param id
   * @param userId
   */
  async removeVehicleImage(id: number, userId: number) {
    const vehicle = await this.MyVehicle(id, userId);
    if (!vehicle.vehicleImage) {
      throw new BadRequestException('User does not have image');
    }
    //current working directory
    const imagePath = join(
      process.cwd(),
      `./images/vehicles/${vehicle.vehicleImage}`,
    );
    unlinkSync(imagePath); //delete
    vehicle.vehicleImage = null;
    return this.vehicleRepository.save(vehicle);
  }

  async removeAnyImg(id: number, userId: number, imageName: string) {
    const vehicle = await this.MyVehicle(id, userId);
    if (!vehicle.vehicleImages.includes(imageName)) {
      throw new BadRequestException('User does not have image');
    }
    const imagePath = join(process.cwd(), `./images/vehicles/${imageName}`);
    unlinkSync(imagePath); //delete
    vehicle.vehicleImage = null;
    return this.vehicleRepository.save(vehicle);
  }

  async MyVehicle(id: number, userId: number) {
    const vehicle = await this.vehicleRepository.findOne({
      //if it is mine && get password
      where: { id: id, user: { id: userId } },
      relations: { user: true },
      select: { user: { password: true } },
    });
    if (!vehicle) {
      throw new UnauthorizedException('Vehicle not yours');
    }
    return vehicle;
  }
}
