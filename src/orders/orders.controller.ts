import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Req,
  Headers,
  HttpCode,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtPayloadType } from '../utils/constants';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { AuthRolesGuard } from '../auth/guards/auth-roles.guard';
import { Roles } from 'src/auth/decorators/user-role.decorator';
import { UserType } from '../utils/enums';

@Controller('webhook')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Throttle({ default: { ttl: 10000, limit: 5 } }) // منفصل overwrite
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.ordersService.create(createOrderDto, user.id);
  }

  @Post('/stripe')
  @SkipThrottle()
  @HttpCode(200)
  async createHook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    console.log('stripe webhook');
    const body = req.body;

    await this.ordersService.createHook(body, signature);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
