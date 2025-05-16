import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/user.entity';
import { CURRENT_TIMESTAMP } from '../../utils/constants';

@Entity('votes')
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Property, (property: Property) => property.votes, {
    onDelete: 'CASCADE',
  })
  property: Property;

  @ManyToOne(() => User, (user: User) => user.votes, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  value: number; // 1 = upvote, -1 = downvote

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;
}
