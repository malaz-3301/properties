import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
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

//Mapped Superclass
//Abstract
@Entity('property')
export abstract class Property {
  /*    @Column({ type: 'enum', enum: PropertyType })
      type: PropertyType;*/

  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Favorite, (favorite) => favorite.property, { cascade: true })
  favorite?: Favorite;

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

  /////////////

  @Column()
  rooms: number;

  @Column()
  bathrooms: number;

  @Column()
  area: number;

  @Column({ type: 'boolean', default: true })
  isFloor: boolean;

  @Column({ nullable: true })
  floorNumber: number;

  @Column({ nullable: true })
  hasGarage: boolean;

  @Column({ nullable: true })
  hasGarden: boolean;

  @Column({
    type: 'enum',
    enum: PropertyType,
    default: PropertyType.HOUSE,
  })
  propertyType: PropertyType;

  @Column({
    type: 'enum',
    enum: HeatingType,
    default: HeatingType.NONE,
  })
  heatingType: HeatingType;

  @Column({
    type: 'enum',
    enum: FlooringType,
    default: FlooringType.CERAMIC,
  })
  flooringType: FlooringType;

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
