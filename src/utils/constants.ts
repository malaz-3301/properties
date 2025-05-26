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
    limit: 14, //4
  },
  //
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

export const ideal = {
  rooms: 3,
  bathrooms: 2,
  area: 120,
};

export const weights = {
  rooms: 20,
  bathrooms: 15,
  area: 25,
  garden: 10,
  garage: 10,
  price: 20,
};
