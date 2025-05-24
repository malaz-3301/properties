import { IsDate, IsNotEmpty, IsNumber, IsPositive, isPositive, MinDate } from "class-validator";
import { Property } from "src/properties/entities/property.entity";
import { User } from "src/users/entities/user.entity";

export class CreateContractDto {
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    time : number;
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    propertyId : number
}
