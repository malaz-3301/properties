import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { join } from 'node:path';
import process from 'node:process';
import { unlinkSync } from 'node:fs';
import { UsersGetProvider } from './users-get.provider';

@Injectable()
export class UsersImgProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersGetProvider: UsersGetProvider,
  ) {}

  async setProfileImage(id: number, profileImage: string) {
    const user = await this.usersGetProvider.findById(id);
    if (user.profileImage) {
      await this.removeProfileImage(id);
    }
    user.profileImage = profileImage;
    await this.usersRepository.save(user);
    return { message: 'File uploaded successfully' };
  }

  async removeProfileImage(id: number) {
    const user = await this.usersGetProvider.findById(id);
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
}
