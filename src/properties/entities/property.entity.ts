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
import { Contract } from '../../contracts/entities/contract.entity';
import { Vote } from '../../votes/entities/vote.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { View } from '../../views/entities/view.entity';
import { PriorityRatio } from './priority-ratio.entity';

@Entity('property')
export abstract class Property extends Estate {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Favorite, (favorites) => favorites.property, {
    cascade: true,
  })
  favorites?: Favorite[];

  @OneToMany(() => Vote, (vote) => vote.property, { cascade: true })
  votes?: Vote[];

  @OneToMany(() => View, (view) => view.property, { cascade: true })
  views?: View[];

  @ManyToOne(() => User, (user: User) => user.ownerProperties, {
    onDelete: 'CASCADE',
  })
  owner: User;

  @ManyToOne(() => User, (user: User) => user.agencyProperties, {
    onDelete: 'CASCADE',
  })
  agency: User;

  @Column({ type: 'varchar', length: 20 })
  ar_title: string;

  @Column({ type: 'varchar', length: 20 })
  en_title: string;

  @Column({ type: 'varchar', length: 180 })
  ar_description: string;

  
  @Column({ type: 'varchar', length: 180 })
  en_description: string;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  price: number;

  @Column(() => Location) //embedded
  location: Location;

  @OneToOne(() => PriorityRatio, (priorityRatio) => priorityRatio.property, {
    cascade: true,
    eager: false,
  })
  priorityRatio: PriorityRatio;

  @Column({ type: 'float', default: 0 })
  primacy: number;

  @Column({ default: false })
  isForRent: boolean;

  @Column({
    type: 'int',
    default: 0,
  })
  acceptCount: number;

  @Column({
    type: 'enum',
    enum: PropertyStatus,
    //make it Pending
    default: PropertyStatus.PENDING,
  })
  status: PropertyStatus;

  @Column({ type: 'varchar', nullable: true, default: null })
  propertyImage: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  firstImage: string | null;

  @Column('simple-array', { nullable: true })
  propertyImages: string[];
  /*  @Column({ type: 'jsonb', nullable: true })
    propertyImages: string[];*/

  //Record هو json مع مفاتيح
  @Column('jsonb', { nullable: true })
  panoramaImages: Record<string, string>;

  @Column({ default: 0 })
  voteScore: number;

  @Column({ default: 0 })
  @Column({ default: 0 })
  viewCount: number;

  @Column()
  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;

  //عملتها numeric لان ادق من float بس بتستهلك ذاكرة اكبر
  @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
  propertyCommissionRate: number;

  @Column({ type: 'boolean', default: false })
  commissionPaid: boolean;

  @OneToMany(() => Contract, (contracts) => contracts.property)
  contacts: Contract[];

  @OneToMany(() => Notification, (notifications) => notifications.property)
  notifications: Notification[];

}
