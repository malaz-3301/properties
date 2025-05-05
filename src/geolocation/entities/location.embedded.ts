import { Column } from 'typeorm';

export class Location {
  @Column()
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
