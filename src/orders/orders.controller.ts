import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreatePlanOrderDto } from './dto/create-plan-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayloadType } from '../utils/constants';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { Roles } from 'src/auth/decorators/user-role.decorator';
import { UserType } from '../utils/enums';
import { AuthRolesGuard } from '../auth/guards/auth-roles.guard';
import { CreateCommOrderDto } from './dto/create-comm-order.dto';

@Controller('webhook')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(UserType.AGENCY)
  @UseGuards(AuthRolesGuard)
  @Throttle({ default: { ttl: 10000, limit: 5 } }) // منفصل overwrite
  createPlanStripe(
    @Body() createPlanOrderDto: CreatePlanOrderDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.ordersService.createPlanStripe(createPlanOrderDto, user.id);
  }

  @Post('commission')
  @UseGuards(AuthGuard)
  @Throttle({ default: { ttl: 10000, limit: 5 } }) // منفصل overwrite
  createCommissionStripe(@Body() createCommOrderDto: CreateCommOrderDto) {
    return this.ordersService.createCommissionStrip(createCommOrderDto);
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
}
