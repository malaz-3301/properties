import { IsDate, IsNotEmpty, MinDate } from "class-validator";

export class CreateContractDto {
    @IsDate()
    @IsNotEmpty()
    @MinDate(new Date())
    validUntil : Date;
}
