export const CURRENT_TIMESTAMP = 'CURRENT_TIMESTAMP(6)';
export type JwtPayloadType = {
  id: number;
  userType: string;
};

//array
export const rateLimiting = [
  {
    name: 'short',
    ttl: 10000,
    limit: 4,
  },
  {
    name: 'medium',
    ttl: 10000,
    limit: 20,
  },
  {
    name: 'long',
    ttl: 60000,
    limit: 100,
  },
];
