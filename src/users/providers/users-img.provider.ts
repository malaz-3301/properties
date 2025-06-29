import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { join } from 'node:path';
import * as process from 'node:process';
import { unlinkSync } from 'node:fs';
import { UsersGetProvider } from './users-get.provider';
import { UserType } from '../../utils/enums';
import { AgencyInfo } from '../entities/agency-info.entity';

@Injectable()
export class UsersImgProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(AgencyInfo)
    private readonly agencyInfoRepository: Repository<AgencyInfo>,
    private readonly usersGetProvider: UsersGetProvider,
  ) {}

  async setProfileImage(userId: number, profileImage: string) {
    const user = await this.usersGetProvider.findById(userId);
    if (user.profileImage) {
      await this.removeProfileImage(userId);
    }
    user.profileImage = profileImage;
    await this.usersRepository.save(user);
    return { message: 'File uploaded successfully' };
  }

  async removeProfileImage(userId: number) {
    const user = await this.usersGetProvider.findById(userId);
    if (!user.profileImage) {
      throw new BadRequestException('User does not have image');
    }
    //current working directory
    const imagePath = join(
      process.cwd(),
      `./images/users/${user.profileImage}`,
    );
    unlinkSync(imagePath); //delete
    user.profileImage = null;
    return this.usersRepository.save(user);
  }

  async upgrade(userId: number, filenames: string[]) {
    const agency = await this.usersGetProvider.getOneAgencyInfo(userId);
    //بقي الحذف لسا
    const length = agency.docImages?.length + filenames.length;

    if (length > 2) {
      console.log(filenames.length);
      console.log(agency.docImages?.length);
      console.log(length);
      console.log('docImages');
      const sub = length - 2;
      const forDelete = agency.docImages.splice(0, sub); //حذف + عرفت الاسماء
      for (const photo of forDelete) {
        unlinkSync(join(process.cwd(), `./images/users/${photo}`)); //file path
      }
    }

    agency.docImages = agency.docImages
      ? agency.docImages.concat(filenames)
      : filenames.concat(); //concat

    await this.usersRepository.save({
      ...agency,
      userType: UserType.PENDING,
      agencyInfo: { docImages: agency.docImages },
    });

    return {
      message: `File uploaded successfully :  ${filenames}`,
    };
  }
}
