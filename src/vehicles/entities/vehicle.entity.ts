import { Property } from '../../properties/entities/property.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import {
  FuelType,
  TransmissionType,
  VehicleCondition,
} from '../../utils/enums';
import { User } from '../../users/entities/user.entity';

@Entity('vehicle')
export class Vehicle extends Property {
  @PrimaryGeneratedColumn()
  id: number;

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

  @ManyToOne(() => User, (user: User) => user.vehicles, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'varchar', nullable: true, default: null })
  vehicleImage: string | null;

  @Column('simple-array', { nullable: true })
  vehicleImages: string[];
}
