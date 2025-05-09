import { Column } from 'typeorm';
import { defaults } from 'axios';

export class Location {
  @Column({ default: 'syria' })
  country: string; //"سوريا,

  @Column()
  governorate: string; //"محافظة دمشق",

  @Column()
  city: string; //"بلدية كفر سوسة"

  @Column()
  quarter: string; //"حي كفر سوسة البلد",

  @Column()
  street: string; //عبد الله بن حذافة
}
