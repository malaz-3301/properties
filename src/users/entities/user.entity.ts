import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { CURRENT_TIMESTAMP } from '../../utils/constants';
import { UserType } from '../../utils/enums';
import { Property } from '../../properties/entities/property.entity';
import { Location } from '../../geolocation/entities/location.embedded';
import { Favorite } from 'src/favorite/entites/favorite.entity';
import { Love } from '../../loves/entities/love.entity';
import { Plan } from '../../plans/entities/plan.entity';

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

  @Column(() => Location) //embedded
  location: Location;

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

  @OneToMany(() => Property, (property: Property) => property.user)
  properties?: Property[];

  @OneToMany(() => Love, (love: Love) => love.user)
  loves?: Love[];

  @ManyToOne(() => Plan, (plan: Plan) => plan.users)
  plan?: Plan;

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

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];
}
