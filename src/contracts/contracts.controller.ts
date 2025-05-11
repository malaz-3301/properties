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
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayloadType } from '../utils/constants';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractsService.create(createContractDto);
  }

  @Get('active')
  @UseGuards(AuthGuard)
  getMyActiveContracts(@CurrentUser() user: JwtPayloadType) {
    console.log('ldasfjl');

    console.log(user.id);

    return this.contractsService.getMyActiveContracts(user.id);
  }

  @Get('expired')
  @UseGuards(AuthGuard)
  getMyExpiredContracts(@CurrentUser() user: JwtPayloadType) {
    return this.contractsService.getMyExpiredContracts(user.id);
  }

  @Get('all')
  @UseGuards(AuthGuard)
  getMyContracts(@CurrentUser() user: JwtPayloadType) {
    return this.contractsService.getMyContracts(user.id);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.contractsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return this.contractsService.update(id, updateContractDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contractsService.remove(id);
  }
}
