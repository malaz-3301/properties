import { IsNotEmpty, IsNumber, IsPositive, IsString, Max, MaxLength, Min, MinLength, minLength } from "class-validator";
import { Property } from "src/properties/entities/property.entity";

export class CreateNotificationDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    message : string;

    @IsString()
    @IsNotEmpty()
    @MinLength(0)
    title : string;

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    propertyId : number
}
