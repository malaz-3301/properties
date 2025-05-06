import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";
import { PropertyType } from "src/utils/enums";

export class PropertyDetailsDto {
    @IsEnum(PropertyType)
    @IsNotEmpty()
    type : PropertyType;
    @IsNumber()
    @IsNotEmpty()
    id : number;
}