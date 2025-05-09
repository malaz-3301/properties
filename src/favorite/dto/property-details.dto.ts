import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";
import { PropertyType } from "src/utils/enums";

export class PropertyDetailsDto {
    @IsNumber()
    @IsNotEmpty()
    id : number;
}