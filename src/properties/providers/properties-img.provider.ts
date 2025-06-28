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
import { Property } from '../entities/property.entity';
import { PropertiesGetProvider } from './properties-get.provider';
import { UserType } from '../../utils/enums'; //important

@Injectable()
export class PropertiesImgProvider {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly propertiesGetProvider: PropertiesGetProvider,
  ) {}

  /**
   *  Remove Profile Image
   * @param id
   * @param userId
   * @param filename
   */
  async setSingleImg(id: number, userId: number, filename: string) {
    const pro = await this.propertiesGetProvider.getProByUser(
      id,
      userId,
      UserType.Owner,
    );

    if (pro.propertyImage) {
      try {
        unlinkSync(
          join(process.cwd(), `./images/properties/${pro.propertyImage}`),
        ); //file path
      } catch (err) {
        console.log(err);
      }
    }
    pro.propertyImage = filename;
    await this.propertyRepository.save(pro);
    return { message: `File uploaded successfully :  ${filename}` };
  }

  async setMultiImg(id: number, userId: number, filenames: string[]) {
    const pro = await this.propertiesGetProvider.getProByUser(
      id,
      userId,
      UserType.Owner,
    );
    //بقي الحذف لسا
    const length = pro.propertyImages?.length + filenames.length;
    if (length > 8) {
      console.log('delete');
      const sub = length - 8;
      const forDelete = pro.propertyImages.splice(0, sub); //حذف + عرفت الاسماء
      for (const photo of forDelete) {
        unlinkSync(join(process.cwd(), `./images/properties/${photo}`)); //file path
      }
    }

    pro.propertyImages = pro.propertyImages
      ? pro.propertyImages.concat(filenames)
      : filenames.concat(); //concat

    await this.propertyRepository.save({
      ...pro,
      firstImage: pro.propertyImages?.[0],
      propertyImages: pro.propertyImages,
    });
    return {
      message: `File uploaded successfully :  ${filenames}`,
    };
  }

  //حذف اي صورة من العقار
  async removeAnyImg(id: number, userId: number, imageName: string) {
    const pro = await this.propertiesGetProvider.getProByUser(
      id,
      userId,
      UserType.Owner,
    );
    if (!pro.propertyImages.includes(imageName)) {
      throw new BadRequestException('User does not have image');
    }
    const imagePath = join(process.cwd(), `./images/properties/${imageName}`);
    unlinkSync(imagePath); //delete
    pro.propertyImage = null;
    return this.propertyRepository.save(pro);
  }

  /*  async removeSingleImage(id: number, userId: number) {
      const pro = await this.propertiesGetProvider.getProByOwner(id, userId);
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
    }*/
}
