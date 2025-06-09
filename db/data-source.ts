import { DataSource, DataSourceOptions } from 'typeorm';
import * as process from 'node:process';
import { User } from '../src/users/entities/user.entity';
import { Property } from '../src/properties/entities/property.entity';
import { OtpEntity } from '../src/users/entities/otp.entity';
import { Favorite } from '../src/favorite/entites/favorite.entity';
import { Vote } from '../src/votes/entities/vote.entity';
import { Plan } from '../src/plans/entities/plan.entity';
import { Order } from '../src/orders/entities/order.entity';
import { View } from '../src/views/entities/view.entity';
import { Request } from '../src/requests/entities/request.entity';
import { Audit } from '../src/audit/entities/audit.entity';
import { Notification } from '../src/notifications/entities/notification.entity';
import { config } from 'dotenv';
//dotenv config
config({ path: '.env' });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  // ... الإعدادات الأخرى
  ssl: {
    rejectUnauthorized: false, // ضروري مع Neon
  },
  synchronize: false,
  logging: true,
  entities: [
    User,
    Audit,
    Notification,
    Property,
    OtpEntity,
    Favorite,
    Vote,
    Plan,
    Order,
    View,
    Request,
  ],
  migrations: ['dist/db/migrations/*.js'],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;

//    "migration:generate": "npm run typeorm -- migration:generate",اوعك الفراغ --