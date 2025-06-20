import { IsNotEmpty, Max, Min } from 'class-validator';
import { Column } from 'typeorm';

export class AcceptProAdminDto {
  @IsNotEmpty()
  @Column({ type: 'int' })
  @Max(5)
  @Min(1)
  rating: number;
}
