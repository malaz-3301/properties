import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

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

  @Column({ nullable: true })
  otpTries: number;
}
