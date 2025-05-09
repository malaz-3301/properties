import { Property } from '../../properties/entities/property.entity';
import {
  ChildEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  FuelType,
  TransmissionType,
  VehicleCondition,
} from '../../utils/enums';
import { User } from '../../users/entities/user.entity';

import { Type } from 'class-transformer';
import { PointsDto } from '../../geolocation/dto/points.dto';

@Entity('vehicle')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Property, (property) => property.vehicle, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column({ type: 'varchar', length: 10 })
  model: string;

  @Column({ type: 'integer' }) //scroll
  year: number;

  @Column({ type: 'enum', enum: VehicleCondition })
  condition: VehicleCondition;

  @Column({ type: 'integer', default: 0 })
  mileage: number; // for Kilometre

  @Column({ type: 'enum', enum: FuelType })
  fuelType: FuelType;

  @Column({ type: 'enum', enum: TransmissionType })
  transmission: TransmissionType;

  @Column({ type: 'varchar', length: 10, nullable: true })
  color: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  vehicleImage: string | null;

  @Column('simple-array', { nullable: true })
  vehicleImages: string[];
}
