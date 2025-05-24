import { Property } from 'src/properties/entities/property.entity';
import { User } from 'src/users/entities/user.entity';
import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  validUntil: Date;

  @ManyToOne(() => Property, (property) => property.contacts)
  property: Property;

  @ManyToOne(() => User, (user) => user.contracts)
  user: User;

  @Column()
  price: number;
}
