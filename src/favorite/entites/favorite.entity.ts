import { User } from 'src/users/entities/user.entity';
import { PropertyType } from 'src/utils/enums';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'enum', enum: PropertyType })
  propertyType: PropertyType;

  @Column()
  propertyId: number;

  @ManyToOne(() => User, (user) => user.favorites)
  user: User;
}
