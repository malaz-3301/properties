import { Property } from "src/properties/entities/property.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Contract {
    @PrimaryGeneratedColumn()
    id : number;
    @Column()
    validUntil : Date;
    @ManyToOne(()=>Property, (property)=>property.contacts)
    property : Property;
    @ManyToOne(()=>User, (user)=>user.contracts)
    user : User
}
