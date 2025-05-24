import { Exclude } from "class-transformer";
import { IsNotEmpty, IsNumber, IsPositive, Min } from "class-validator";
import { Property } from "src/properties/entities/property.entity";
import { User } from "src/users/entities/user.entity";

export class CreateRequestDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    propertyId : number;
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    time : number
}
