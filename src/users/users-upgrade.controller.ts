import {
  BadRequestException,
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayloadType } from '../utils/constants';

@Controller('userU')
export class UsersUpgradeController {
  constructor(private readonly usersService: UsersService) {}

  @Post('upgrade/:cR')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('user-images', 2))
  //function
  upgrade(
    @UploadedFiles()
    files: Array<Express.Multer.File>,
    @CurrentUser() payload: JwtPayloadType,
    @Param('cR', ParseIntPipe) agencyCommissionRate: number,
  ) {
    //بدل dto
    if (agencyCommissionRate < 0 || agencyCommissionRate > 10) {
      throw new BadRequestException('Commission rate must be between 0 and 10');
    }
    if (!files || files.length === 0) {
      throw new BadRequestException('No file uploaded');
    }

    //من الغرض بس الاسم
    const filenames: string[] = files.map((f) => f.filename);
    console.log('File uploaded ', { files });
    return this.usersService.upgrade(
      payload.id,
      filenames,
      agencyCommissionRate,
    );
  }
}
