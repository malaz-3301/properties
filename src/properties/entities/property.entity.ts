import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
  UpdateDateColumn,
} from 'typeorm';
import { CURRENT_TIMESTAMP } from '../../utils/constants';
import {
  FlooringType,
  HeatingType,
  PropertyStatus,
  PropertyType,
} from '../../utils/enums';
import { Location } from '../../geolocation/entities/location.embedded';
import { User } from '../../users/entities/user.entity';
import { Favorite } from '../../favorite/entites/favorite.entity';
import { Estate } from './estate.entity';
import { Love } from '../../loves/entities/love.entity';

@Entity('property')
export abstract class Property extends Estate {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Favorite, (favorites) => favorites.property, {
    cascade: true,
  })
  favorites?: Favorite[];

  @OneToMany(() => Love, (loves) => loves.property, { cascade: true })
  loves?: Love[];

  @ManyToOne(() => User, (user: User) => user.properties, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'varchar', length: 20 })
  title: string;

  @Column({ type: 'varchar', length: 180 })
  description: string;

  @Column({ type: 'integer' })
  price: number;

  @Column(() => Location) //embedded
  location: Location;

  @Column({ default: false })
  isForRent: boolean;

  @Column({
    type: 'enum',
    enum: PropertyStatus,
    default: PropertyStatus.PENDING,
  })
  state: PropertyStatus;

  @Column({ type: 'varchar', nullable: true, default: null })
  propertyImage: string | null;

  @Column('simple-array', { nullable: true })
  propertyImages: string[];

  @Column({ default: 0 })
  loveCount: number;

  @Column()
  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;
}
