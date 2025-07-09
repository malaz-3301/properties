import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class PanoramaPro {
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((v) => v.trim());
    }
    return value;
  })
  @IsArray()
  @ArrayNotEmpty() //not []
  @IsString({ each: true })
  panoramaNames: string[];
}
