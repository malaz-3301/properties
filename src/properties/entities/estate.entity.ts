import { Column } from 'typeorm';
import { FlooringType, HeatingType, PropertyType } from '../../utils/enums';

export abstract class Estate {
  /////////////

  @Column()
  rooms: number;

  @Column()
  bathrooms: number;

  @Column({type : 'float'})
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
}
