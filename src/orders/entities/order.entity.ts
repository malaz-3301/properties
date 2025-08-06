import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Plan } from '../../plans/entities/plan.entity';
import { CURRENT_TIMESTAMP } from '../../utils/constants';
import { extensionRegex } from 'ts-loader/dist/constants';
import { OrderStatus } from '../../utils/enums';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.ACTIVE })
  planStatus: OrderStatus;

  @Column({ type: 'timestamp', nullable: true })
  planExpiresAt?: Date;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ManyToOne(() => Plan, (plan: Plan) => plan.orders)
  plan: Plan;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;
}
