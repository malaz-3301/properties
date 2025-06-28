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
import { Request } from 'src/requests/entities/request.entity';
import { PriorityScoreEntity } from './priority-score.entity';

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
  title: string;

  @Column({ type: 'varchar', length: 180 })
  description: string;

  @Column({ type: 'float' })
  price: number;

  @Column(() => Location) //embedded
  location: Location;

  @Column(() => PriorityScoreEntity) //embedded
  priorityScoreEntity: PriorityScoreEntity;

  @Column({ type: 'float', default: 0 })
  priorityScoreRate: number;

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

  @Column('simple-array', { nullable: true })
  panoramaImages: string[];

  @Column({ default: 0 })
  voteScore: number;

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

  @OneToMany(() => Contract, (contracts) => contracts.property)
  contacts: Contract[];

  @OneToMany(() => Notification, (notifications) => notifications.property)
  notifications: Notification[];

  @OneToMany(() => Request, (requests) => requests.property)
  requests: Request[];
}
