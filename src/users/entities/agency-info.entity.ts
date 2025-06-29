import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { CURRENT_TIMESTAMP } from '../../utils/constants';

@Entity('agency')
export class AgencyInfo {
  @PrimaryColumn()
  user_id: number;

  @OneToOne(() => User, (user) => user.agencyInfo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('simple-array', { nullable: true })
  docImages: string[];

  //عملتها numeric لان ادق من float بس بتستهلك ذاكرة اكبر
  @Column({ type: 'numeric', precision: 4, scale: 2, default: 0 })
  commissionRate: number;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;
}
