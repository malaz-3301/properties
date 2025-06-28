import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { CURRENT_TIMESTAMP } from '../../utils/constants';
import { PropertyStatus, UserType } from '../../utils/enums';
import { Property } from '../../properties/entities/property.entity';
import { Location } from '../../geolocation/entities/location.embedded';
import { Favorite } from 'src/favorite/entites/favorite.entity';
import { Plan } from '../../plans/entities/plan.entity';
import { Contract } from '../../contracts/entities/contract.entity';
import { Vote } from '../../votes/entities/vote.entity';
import { Order } from '../../orders/entities/order.entity';
import { OtpEntity } from './otp.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { Audit } from '../../audit/entities/audit.entity';
import { View } from '../../views/entities/view.entity';
import { Request } from 'src/requests/entities/request.entity';
import { Statistics } from './statistics.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 11, unique: true })
  phone: string;
  //make it unique
  @Column({ type: 'varchar', length: 18, unique: true })
  username: string;

  @Column({ type: 'varchar' })
  @Exclude() //SerializerInterceptor
  password: string;

  @Column(() => Location) //embedded
  location: Location;

  @Column({ type: 'integer', default: 18 })
  age: number;

  @Column({ type: 'enum', enum: UserType, default: UserType.Owner })
  userType: UserType;

  @Column({ type: 'boolean', default: false })
  isAccountVerified: boolean;

  @OneToOne(() => OtpEntity, (otpEntity) => otpEntity.user, {
    cascade: true,
  })
  otpEntity: OtpEntity;

  @OneToOne(() => Statistics, (statistics) => statistics.user, {
    cascade: true,
  })
  statistics?: Statistics;

  @OneToMany(() => Property, (property: Property) => property.owner)
  ownerProperties?: Property[];

  @OneToMany(() => Property, (property: Property) => property.agency)
  agencyProperties?: Property[];

  @OneToMany(() => Vote, (vote: Vote) => vote.user)
  votes?: Vote[];

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

  @Column('simple-array', { nullable: true })
  docImages: string[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => Contract, (contracts) => contracts.user)
  contracts: Contract[];
  ////
  @ManyToOne(() => Plan, (plan: Plan) => plan.users, { eager: true })
  plan?: Plan;

  /*ازلها  @Column({ type: 'int', nullable: true })
    planId: number;*/

  @Column({ default: false })
  hasUsedTrial: boolean;
  ////
  @OneToMany(() => Order, (order: Order) => order.user)
  orders?: Order[];

  @OneToMany(() => Notification, (notifications) => notifications.user)
  notifications: Notification[];

  @OneToMany(() => Audit, (audit) => audit.admin)
  audits: Audit[];

  @OneToMany(() => View, (view) => view.user, { cascade: true })
  views?: View[];

  @OneToMany(() => Request, (requests) => requests.user)
  requests: Request[];

  @Column()
  token: string;
}
