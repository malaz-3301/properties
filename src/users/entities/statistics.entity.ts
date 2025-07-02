import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('statistics')
export class Statistics {
  @PrimaryColumn()
  user_id: number;

  @OneToOne(() => User, (user) => user.otpEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: 0 })
  propertyCount: number;
}
