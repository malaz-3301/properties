import { SetMetadata } from '@nestjs/common';
import { UserType } from '../../utils/enums';
//method decorator
export const Roles =
  (...roles: UserType[]) => SetMetadata('roles', roles);
