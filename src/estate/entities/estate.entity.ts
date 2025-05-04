import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { EstateType, HeatingType, FlooringType } from '../../utils/enums';
import { User } from '../../users/entities/user.entity';

@Entity('estate')
export class Estate extends Property {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ type: 'varchar', nullable: true, default: null })
  estateImage: string | null;
  @Column('simple-array', { nullable: true })
  estateImages: string[];

  @ManyToOne(() => User, (user: User) => user.estates, {
    onDelete: 'CASCADE',
  })
  user: User;
}
