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
  totalPropertyCount: number;

  @Column({ default: 0 })
  totalVoteScore: number;

  @Column({ default: 0 })
  totalViewCount: number;
}
