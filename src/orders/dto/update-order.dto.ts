import { PartialType } from '@nestjs/swagger';
import { CreatePlanOrderDto } from './create-plan-order.dto';

export class UpdateOrderDto extends PartialType(CreatePlanOrderDto) {}
