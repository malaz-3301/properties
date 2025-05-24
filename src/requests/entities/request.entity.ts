import { Property } from "src/properties/entities/property.entity";
import { User } from "src/users/entities/user.entity";
import { AfterRemove, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Request {
    @PrimaryGeneratedColumn()
    id : number;
    @ManyToOne(()=>User, (user)=>user.requests)
    user : User;
    @ManyToOne(()=>Property, (property)=>property.requests)
    property : Property;
    @Column()
    time : number;
    @Column({type : 'float'})
    price : number;
}
