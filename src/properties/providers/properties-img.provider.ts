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
import * as sharp from 'sharp';
import * as jpeg from 'jpeg-js';
import * as fs from 'node:fs';
import * as fileType from 'file-type';

@Injectable()
export class PropertiesImgProvider {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly propertiesGetProvider: PropertiesGetProvider,
  ) {}

  async analyzeImage(buffer: Buffer): Promise<Buffer> {
    try {
      // تحويل الصورة إلى JPEG أولًا
      buffer = await sharp(buffer).jpeg().toBuffer();

      // التحقق من التنسيق
      const metadata = await sharp(buffer).metadata();
      if (metadata.format !== 'jpeg') {
        throw new Error('الصورة يجب أن تكون JPEG');
      }

      // إعادة الضغط بجودة منخفضة (50%)
      const compressedImage = await sharp(buffer)
        .jpeg({ quality: 50 })
        .toBuffer();

      // الحصول على بيانات البكسل للصورتين
      const originalPixels = await this.getPixelData(buffer);
      const compressedPixels = await this.getPixelData(compressedImage);

      // حساب الفروق بين البكسلات
      const diff = new Uint8ClampedArray(originalPixels.length);
      for (let i = 0; i < originalPixels.length; i += 3) {
        diff[i] = Math.abs(originalPixels[i] - compressedPixels[i]);
        diff[i + 1] = Math.abs(originalPixels[i + 1] - compressedPixels[i + 1]);
        diff[i + 2] = Math.abs(originalPixels[i + 2] - compressedPixels[i + 2]);
      }

      // إنشاء صورة ELA الناتجة
      const elaImage = await sharp(diff, {
        raw: {
          width: metadata.width,
          height: metadata.height,
          channels: 3,
        },
      })
        .png()
        .toBuffer();

      return elaImage;
    } catch (error) {
      throw new Error(`فشل في التحليل: ${error.message}`);
    }
  }

  private async getPixelData(buffer: Buffer): Promise<Uint8ClampedArray> {
    const { data, info } = await sharp(buffer)
      .raw() // لا نضيف قناة Alpha
      .toBuffer({ resolveWithObject: true });
    return new Uint8ClampedArray(data.buffer);
  }

  /**
   *  Remove Profile Image
   * @param id
   * @param userId
   * @param file
   */

  async setSingleImg(id: number, userId: number, file: Express.Multer.File) {
    const pro = await this.propertiesGetProvider.getProByUser(
      id,
      userId,
      UserType.Owner,
    );

    try {
      // قراءة الملف من القرص
      const buffer = fs.readFileSync(file.path);
      const elaBuffer = await this.analyzeImage(buffer);
      const elaImageBase64 = elaBuffer.toString('base64');
      console.log({ elaImage: elaBuffer.toString('base64') });

      if (pro.propertyImage) {
        try {
          unlinkSync(
            join(process.cwd(), `./images/properties/${pro.propertyImage}`),
          ); //file path
        } catch (err) {
          console.log(err);
        }
      }
      pro.propertyImage = file.filename;
      await this.propertyRepository.save(pro);
      //   return { message: `File uploaded successfully :  ${file.filename}` };
      return {
        message: 'File uploaded successfully',
        elaImage: `data:image/png;base64,${elaBuffer.toString('base64')}`,
        filename: file.filename,
      };
    } catch (error) {
      console.log(error);
    }
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

  async setMultiPanorama(
    id: number,
    userId: number,
    panoramaNames: string[],
    filenames: string[],
  ) {
    const pro = await this.propertiesGetProvider.getProByUser(
      id,
      userId,
      UserType.Owner,
    );
    //مقارنة المفاتيح المتشابهة لحذف القيم
    const panoramaNamesParse = JSON.parse((pro.panoramaImages as any) || {});
    const forDelete: string[] = panoramaNames.reduce((acc: string[], name) => {
      if (panoramaNamesParse.hasOwnProperty(name)) {
        acc.push(panoramaNamesParse[name]);
      }
      return acc;
    }, []);
    for (const filename of forDelete) {
      unlinkSync(join(process.cwd(), `./images/properties/${filename}`));
    }

    //تهيئة ال record
    const panoramaImages: Record<string, string> = panoramaNames.reduce(
      (acc, pN, i) => {
        acc[pN] = filenames[i];
        return acc;
      },
      {
        /*قيمة ابتدائية*/
      },
    );

    await this.propertyRepository.save({
      ...pro,
      panoramaImages: panoramaImages,
    });
    return {
      message: `File uploaded successfully :  ${filenames}`,
    };
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
