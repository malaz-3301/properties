import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
//extends ThrottlerGuard (:
export class ThrottlerProxyGuard extends ThrottlerGuard {
  //X-Forwarded-For
  protected async getTracker(req: Record<string, any>): Promise<string> {
    if (req.ips && req.ips.length > 0) {
      return req.ips[0];
    }
    return req.ip;
  }
}
