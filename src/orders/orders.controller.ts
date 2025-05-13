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

@Controller('webhook')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.ordersService.create(createOrderDto, user.id);
  }

  @Post('/stripe')
  @HttpCode(200)
  async createHook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
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
