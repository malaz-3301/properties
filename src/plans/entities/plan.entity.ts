import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlanDuration, PlanType } from '../../utils/enums';
import { Love } from '../../loves/entities/love.entity';
import { User } from '../../users/entities/user.entity';

@Entity('plan')
export class Plan {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    type: 'enum',
    enum: PlanDuration,
    default: PlanDuration.ONE_DAY,
  })
  planDuration: PlanDuration;

  @Column({
    type: 'enum',
    enum: PlanType,
    default: PlanType.BASIC,
  })
  planType: PlanType;

  @Column({ type: 'integer' })
  planPrice: number;

  @OneToMany(() => User, (user: User) => user.plan)
  users: User[];
}
