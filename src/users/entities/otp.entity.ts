import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { CURRENT_TIMESTAMP } from '../../utils/constants';

@Entity('otp')
export class OtpEntity {
  @PrimaryColumn()
  user_id: number;

  @OneToOne(() => User, (user) => user.otpEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  otpCode: string;

  @Column({ nullable: true, default: 0 })
  otpTries: number;

  @Column({ nullable: true })
  passChangeAccess: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;
}
