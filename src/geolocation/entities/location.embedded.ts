import { Column } from 'typeorm';
import { defaults } from 'axios';

export class Location {
  @Column({ default: 'syria' })
  country: string; //"سوريا,

  @Column({ nullable: true })
  governorate: string; //"محافظة دمشق",

  @Column({ nullable: true })
  city: string; //"بلدية كفر سوسة"

  @Column({ nullable: true })
  quarter: string; //"حي كفر سوسة البلد",

  @Column({ nullable: true })
  street: string; //عبد الله بن حذافة
  //make not nullable
  @Column({type : 'float',  nullable: false })
  lat: number;

  @Column({type : 'float',  nullable: false })
  lon: number;
}
