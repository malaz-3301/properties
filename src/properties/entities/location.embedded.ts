import { Column } from 'typeorm';

export class Location {
  @Column()
  country: string;

  @Column()
  city: string;

  @Column()
  street: string;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;
}
