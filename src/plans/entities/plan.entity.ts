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
  @Column({
    type: 'enum',
    enum: PlanDuration,
    default: PlanDuration.ONE_DAY,
  })
  planDuration: PlanDuration;

  @Column({ type: 'varchar', length: 140 })
  description: string;

  @Column({
    type: 'enum',
    enum: PlanType,
    default: PlanType.BASIC,
  })
  planType: PlanType;

  @Column({ type: 'integer' })
  planPrice: number;

  @OneToMany(() => Order, (order: Order) => order.plan)
  orders: Order[];

  @OneToMany(() => User, (user: User) => user.plan)
  users: User[];
}
