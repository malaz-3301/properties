import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlanDuration, PlanType } from '../../utils/enums';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 14 })
  planDuration: string;

  @Column({ type: 'varchar', length: 140 })
  ar_description: string;

  @Column({ type: 'varchar', length: 140 })
  en_description: string;

  @Column({
    type: 'enum',
    enum: PlanType,
    default: PlanType.BASIC,
  })
  planType: PlanType;

  @Column({ type: 'numeric', precision: 4, scale: 2 })
  planPrice: number;

  @Column({ type: 'integer', default: 1 })
  limit: number;

  @OneToMany(() => Order, (order: Order) => order.plan)
  orders: Order[];

  @OneToMany(() => User, (user: User) => user.plan)
  users: User[];
}
