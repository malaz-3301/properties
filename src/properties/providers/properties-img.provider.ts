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
import { Property } from '../entities/property.entity'; //important

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
  async setSingleImg(id: number, userId: number, filename: string) {
    const pro = await this.MyProperty(id, userId);

    if (pro.propertyImage) {
      unlinkSync(
        join(process.cwd(), `./images/properties/${pro.propertyImage}`),
      ); //file path
    }
    pro.propertyImage = filename;
    await this.propertyRepository.save(pro);
    return { message: `File uploaded successfully :  ${filename}` };
  }

  async setMultiImg(id: number, userId: number, filenames: string[]) {
    const pro = await this.MyProperty(id, userId);
    //بقي الحذف لسا

    if (pro.propertyImages?.length ?? 0 >= 8) {
      console.log('ddddddddddddddddddddddddddddd');
      const sub = pro.propertyImages.length - 8 || 2;
      const forDelete = pro.propertyImages.splice(0, sub); //حذف + عرفت الاسماء
      for (const photo of forDelete) {
        unlinkSync(join(process.cwd(), `./images/properties/${photo}`)); //file path
      }
    }

    pro.propertyImages = pro.propertyImages
      ? pro.propertyImages.concat(filenames)
      : filenames.concat(); //concat

    await this.propertyRepository.save({
      firstImage:
        pro.propertyImages?.[0] ??
        'https://cdn-icons-png.flaticon.com/512/4757/4757668.png',
      propertyImages: pro.propertyImages,
    });
    return {
      message: `File uploaded successfully :  ${filenames}`,
    };
  }

  /**
   *
   * @param id
   * @param userId
   */
  async removeSingleImage(id: number, userId: number) {
    const pro = await this.MyProperty(id, userId);
    if (!pro.propertyImage) {
      throw new BadRequestException('User does not have image');
    }
    //current working directory
    const imagePath = join(
      process.cwd(),
      `./images/properties/${pro.propertyImage}`,
    );
    unlinkSync(imagePath); //delete
    pro.propertyImage = null;
    return this.propertyRepository.save(pro);
  }

  //حذف اي صورة من العقار
  async removeAnyImg(id: number, userId: number, imageName: string) {
    const pro = await this.MyProperty(id, userId);
    if (!pro.propertyImages.includes(imageName)) {
      throw new BadRequestException('User does not have image');
    }
    const imagePath = join(process.cwd(), `./images/properties/${imageName}`);
    unlinkSync(imagePath); //delete
    pro.propertyImage = null;
    return this.propertyRepository.save(pro);
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
