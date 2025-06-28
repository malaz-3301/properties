import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from '../plans/entities/plan.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { AuthRolesGuard } from '../auth/guards/auth-roles.guard';
import { UserType } from '../utils/enums';
import { Roles } from '../auth/decorators/user-role.decorator';
import { Order, OrderStatus } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: number) {
    const plan = await this.planRepository.findOneBy({
      id: createOrderDto.planId,
    });
    if (!plan) {
      throw new UnauthorizedException('Unauthorized');
    }
    const unit = plan?.planDuration.split('_')[1] ?? null;

    return await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'EasyRent',
              description: `${plan.description}`,
              images: [
                'https://i.postimg.cc/VsG6vRY1/photo.jpg', // ← هنا رابط الصورة
              ],
            },
            unit_amount: plan.planPrice * 100,
            recurring: {
              interval: unit as 'day' | 'week' | 'month' | 'year',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: createOrderDto.dataAfterPayment.success_url,
      cancel_url: createOrderDto.dataAfterPayment.cancel_url,
      client_reference_id: `${userId}`,
      metadata: {
        planId: String(plan.id),
        userId: String(userId),
      },
    });
  }

  async createHook(body: any, signature: any) {
    const webhookSecret =
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET') ?? '';
    let event: Stripe.Event | undefined;
    try {
      event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret,
      );
    } catch (error) {
      throw new HttpException(
        `Webhook Error: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        console.log(event.type);
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const metadata = session.metadata ?? {};
        const userId = parseInt(metadata.userId);
        const planId = parseInt(metadata.planId);
        console.log('اشتراك ناجح');
        console.log('Customer ID:', customerId);
        console.log('Subscription ID:', subscriptionId);
        await this.setOrder(userId, planId);
        break;
      }
      default:
        console.log(`${event.type}`);
    }
  }

  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  @UseGuards(AuthRolesGuard)
  @Roles(UserType.SUPER_ADMIN)
  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  @UseGuards(AuthRolesGuard)
  @Roles(UserType.SUPER_ADMIN)
  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  async setOrder(userId: number, planId: number) {
    const plan = await this.planRepository.findOne({
      where: { id: planId },
      select: { planDuration: true },
    });
    let durationMs: number;
    const [numStr, unit] = plan?.planDuration.split('_') ?? [];
    switch (unit) {
      case 'day':
        durationMs = parseInt(numStr) * 24 * 60 * 60 * 1000;
        break;
      case 'week':
        durationMs = parseInt(numStr) * 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        durationMs = parseInt(numStr) * 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        throw new Error(`Unsupported time unit: ${unit}`);
    }
    //make it
    //  planExpiresAt: new Date(Date.now() + durationMs),
    const order = this.orderRepository.create({
      plan: { id: planId },
      user: { id: userId },
      planStatus: OrderStatus.ACTIVE,
      planExpiresAt: new Date(Date.now() + durationMs),
    });
    await this.orderRepository.save(order);

    return await this.usersService.setUserPlan(userId, planId);
  }
}
