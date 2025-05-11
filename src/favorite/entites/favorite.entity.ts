import { User } from 'src/users/entities/user.entity';

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';

@Entity()
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Property, (property) => property.favorites, {
    onDelete: 'CASCADE',
  })
  property: Property;

  @Column({ type: 'boolean', default: true })
  isFavorite: boolean;

  @ManyToOne(() => User, (user) => user.favorites)
  user: User;
}
