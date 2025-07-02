import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Property } from './property.entity';

@Entity('priority ratio')
export class PriorityRatio {
  @PrimaryColumn()
  user_id: number;

  @OneToOne(() => Property, (property) => property.priorityRatio, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  property: Property;

  @Column({ type: 'float', default: 0 })
  suitabilityRatio: number;

  @Column({ type: 'float', default: 0 })
  voteRatio: number;
}

//suitabilityScoreRate voteScoreRate priorityScoreEntity