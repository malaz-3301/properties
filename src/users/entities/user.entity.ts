import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { CURRENT_TIMESTAMP } from '../../utils/constants';
import { UserType } from '../../utils/enums';
import { Property } from '../../properties/entities/property.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Estate } from '../../estate/entities/estate.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 11 })
  phone: string;
  //make it unique
  @Column({ type: 'varchar', length: 18 })
  username: string;

  @Column({ type: 'varchar' })
  @Exclude()
  password: string;

  @Column({ type: 'integer', default: 18 })
  age: number;

  @Column({ type: 'enum', enum: UserType, default: UserType.ADMIN })
  userType: UserType;

  @Column({ type: 'boolean', default: false })
  isAccountVerified: boolean;

  @Column({ nullable: true })
  otpCode: string;

  @Column({ nullable: true })
  otpTries: number;

  @OneToMany(() => Vehicle, (vehicle: Vehicle) => vehicle.user)
  vehicles: Vehicle[];

  @OneToMany(() => Estate, (estate: Estate) => estate.user)
  estates: Estate[];

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: true, default: null })
  profileImage: string | null;
}
