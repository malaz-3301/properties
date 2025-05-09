import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { join } from 'node:path';
import { unlinkSync } from 'node:fs';
import * as process from 'node:process';
import { Property } from './entities/property.entity'; //important

@Injectable()
export class PropertiesImgProvider {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  /**
   *  Remove Profile Image
   * @param id
   * @param userId
   * @param filename
   */
  async setPropertyImg(id: number, userId: number, filename: string) {
    const property = await this.MyProperty(id, userId);

    if (property.propertyImage) {
      unlinkSync(join(process.cwd(), `./images/estate/${filename}`)); //file path
    }
    property.propertyImage = filename;
    await this.propertyRepository.save(property);
    return { message: `File uploaded successfully :  ${filename}` };
  }

  async setMultiImg(id: number, userId: number, filenames: string[]) {
    const property = await this.MyProperty(id, userId);

    property.propertyImages = filenames;
    await this.propertyRepository.save(property);
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
    const property = await this.MyProperty(id, userId);
    if (!property.propertyImage) {
      throw new BadRequestException('User does not have image');
    }
    //current working directory
    const imagePath = join(
      process.cwd(),
      `./images/estate/${property.propertyImage}`,
    );
    unlinkSync(imagePath); //delete
    property.propertyImage = null;
    return this.propertyRepository.save(property);
  }

  async removeAnyImg(id: number, userId: number, imageName: string) {
    const property = await this.MyProperty(id, userId);
    if (!property.propertyImages.includes(imageName)) {
      throw new BadRequestException('User does not have image');
    }
    const imagePath = join(process.cwd(), `./images/vehicles/${imageName}`);
    unlinkSync(imagePath); //delete
    property.propertyImage = null;
    return this.propertyRepository.save(property);
  }

  async MyProperty(id: number, userId: number) {
    const vehicle = await this.propertyRepository.findOne({
      //if it is mine && get password
      where: { id: id, user: { id: userId } },
      relations: { user: true },
      select: { user: { password: true } },
    });
    if (!vehicle) {
      throw new UnauthorizedException('Property not yours');
    }
    return vehicle;
  }
}
