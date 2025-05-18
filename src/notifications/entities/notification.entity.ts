import { Property } from "src/properties/entities/property.entity";
import { User } from "src/users/entities/user.entity";
import { CURRENT_TIMESTAMP } from "src/utils/constants";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id :number;
    @ManyToOne(()=>User, (user)=>user.notifications)
    user : User;
    @Column()
    message : string;
    @CreateDateColumn({ type: 'timestamp', nullable : true})
    readAt : Date;
    @ManyToOne(()=>Property, (property)=>property.notifications)
    property : Property;
}
