import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadType } from '../../utils/constants';
//param decorator
export const CurrentUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const payload: JwtPayloadType = req['payload'];
    return payload;
  },
);
