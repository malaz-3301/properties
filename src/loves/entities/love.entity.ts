import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CURRENT_TIMESTAMP } from '../../utils/constants';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';

@Entity('loves')
export class Love {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Property, (property: Property) => property.loves, {
    onDelete: 'CASCADE',
  })
  property: Property;

  @ManyToOne(() => User, (user: User) => user.loves, {
    onDelete: 'CASCADE',
  })
  user: User;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;
}
