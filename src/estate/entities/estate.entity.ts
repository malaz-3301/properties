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
import { Property } from '../../properties/entities/property.entity';
import { EstateType, HeatingType, FlooringType } from '../../utils/enums';
import { User } from '../../users/entities/user.entity';

@Entity('estate')
export class Estate {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Property, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  property: Property;

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
    enum: EstateType,
    default: EstateType.HOUSE,
  })
  propertyType: EstateType;

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
}
