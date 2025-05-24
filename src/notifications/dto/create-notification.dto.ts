import { IsNotEmpty, IsNumber, IsString, Max, Min } from "class-validator";
import { Property } from "src/properties/entities/property.entity";

export class CreateNotificationDto {
    @IsString()
    @IsNotEmpty()
    @Max(1000)
    message : string;
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    propertyId : number
}
