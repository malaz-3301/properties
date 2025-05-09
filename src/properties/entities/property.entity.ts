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
import { PropertyStatus } from '../../utils/enums';
import { PropertyType } from '../../utils/enums';
import { Location } from '../../geolocation/entities/location.embedded';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { User } from '../../users/entities/user.entity';
import { Estate } from '../../estate/entities/estate.entity';

//Mapped Superclass
//Abstract
@Entity('property')
export abstract class Property {
  /*    @Column({ type: 'enum', enum: PropertyType })
      type: PropertyType;*/

  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Vehicle, (vehicle) => vehicle.property, { cascade: true })
  vehicle?: Vehicle;

  @OneToOne(() => Estate, (estate) => estate.property, { cascade: true })
  estate?: Estate;

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
