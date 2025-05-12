import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import Stripe from 'stripe';

@Injectable()
export class OrdersService {
  constructor() {}

  async create1(createOrderDto: CreateOrderDto) {
    /*    const stripe = new Stripe(
          '',
        );*/
    /*    return await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'EasyRent',
                },
                unit_amount: 1000, // السعر بـ السنت => 10 دولار
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: 'https://example.com/success',
          cancel_url: 'https://example.com/cancel',
          client_reference_id: 2,
        });*/
  }

  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
