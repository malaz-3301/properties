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
import { Contract } from '../src/contracts/entities/contract.entity';
import { AgencyInfo } from '../src/users/entities/agency-info.entity';
import { Statistics } from '../src/users/entities/statistics.entity';
import { PriorityRatio } from '../src/properties/entities/priority-ratio.entity';
//dotenv config

config({ path: '.env.development' });
//config({ path: '.env' });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',

  host: process.env.DB_HOST,
  port: process.env.DB_PORT as any, // بورت PostgreSQL الافتراضي
  username: process.env.DB_USERNAME, // اسم المستخدم عندك
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE, // اسم قاعدة البيانات
  //url: process.env.DATABASE_URL,
  //تاكد من الجداول
  entities: [
    Contract,
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
    AgencyInfo,
    Statistics,
    PriorityRatio,
  ],
  migrations: ['dist/db/migrations/*.js'],

  // Syria Time Zone -configuration
  extra: {
    options: '-c timezone=+03',
  },
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;

//    "migration:generate": "npm run typeorm -- migration:generate",اوعك الفراغ --