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
    @Column({type : 'jsonb'})
    usre_language_message : string;
    @CreateDateColumn({ type: 'timestamp', nullable : true, default : null})
    readAt : Date|null;
    @ManyToOne(()=>Property, (property)=>property.notifications)
    property : Property;
    @Column()
    title : string;
}
