import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CURRENT_TIMESTAMP } from '../../utils/constants';

@Entity('audit')
export class Audit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json', nullable: true })
  meta: any;

  @ManyToOne(() => User, (user) => user.audits, {
    onDelete: 'CASCADE',
  })
  admin: User;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;
}
