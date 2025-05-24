import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayloadType } from 'src/utils/constants';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateContractDto } from 'src/contracts/dto/create-contract.dto';
import { User } from 'src/users/entities/user.entity';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post('accept/:id')
  @UseGuards(AuthGuard)
  accept(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.requestsService.accept(id, user.id);
  }

  @Get('my_requests/:id')
  @UseGuards(AuthGuard)
  getMyRequests(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.requestsService.getMyRequests(id, user.id);
  }

  @Post('reject_my_requests')
  @UseGuards(AuthGuard)
  rejectAllMyRequests(
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.requestsService.rejectMyRequests(user.id);
  }

  @Post('reject_my_property_requests/:id')
  @UseGuards(AuthGuard)
  rejectAllMyPropertyRequests(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.requestsService.rejectMyPropertyRequests(id, user.id);
  }

  @Get('my_property_requests/:id')
  @UseGuards(AuthGuard)
  getMyPropertyRequests(@Param('id', ParseIntPipe) id : number, @CurrentUser() user: JwtPayloadType){
    return this.requestsService.getMyPropertyRequests(id, user.id)
  }

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createRequestDto: CreateRequestDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.requestsService.create(createRequestDto, user.id);
  }

  @Get()
  findAll(@Body('propertyId') propertyId: number) {
    return this.requestsService.findAll(propertyId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: number, @CurrentUser() user: JwtPayloadType) {
    return this.requestsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: number,
    @Body() updateRequestDto: UpdateRequestDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.requestsService.update(id, updateRequestDto, user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: number,  @CurrentUser() user: JwtPayloadType) {
    return this.requestsService.remove(id, user.id);
  }
}
