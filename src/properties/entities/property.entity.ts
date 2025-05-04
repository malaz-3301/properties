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
import { Location } from './location.embedded';

//Mapped Superclass
//Abstract

export abstract class Property {
  /*    @Column({ type: 'enum', enum: PropertyType })
      type: PropertyType;*/

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
