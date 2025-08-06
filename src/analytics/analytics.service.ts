import { Injectable } from '@nestjs/common';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from '../properties/entities/property.entity';
import { User } from '../users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { create } from 'axios';
import { Report } from '../reports/entities/report.entity';
import {
  OrderStatus,
  ReportStatus,
  ReportTitle,
  UserType,
} from '../utils/enums';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private dataSource: DataSource,
  ) {}

  create(createAnalyticsDto: CreateAnalyticsDto) {
    return 'This action adds a new analytics';
  }

  findOne(id: number) {
    return `This action returns a #${id} analytics`;
  }

  /*
  
  Statistics
  
  
   */
  async findAll() {
    const [result1] = await this.dataSource.query(
      `
          SELECT COUNT(*) FILTER (WHERE u."userType" = $1)                 AS "Users",
                 COUNT(*) FILTER (WHERE u."userType" = $2)                 AS "Agencies", --للاختصار 
                 (SELECT COUNT(*) FROM property p)                         AS "Properties",
                 (SELECT COUNT(*) FROM votes v)                            AS "Voting interactions",
                 (SELECT COUNT(*) FROM orders o)                           AS "All Subscriptions",
                 (SELECT AVG(p."propertyCommissionRate") FROM property p)  AS "AVG of commissions rate",
                 (SELECT COUNT(*) FROM orders o WHERE o."planStatus" = $3) AS "Active Subscriptions",
                 (SELECT COUNT(*) FROM report r)                           AS "Complaints",
                 (SELECT COUNT(*)
                  FROM report r
                  WHERE r.title = $4
                    AND r."reportStatus" = $5)                             AS "Fixed Refund Complaints"

          FROM users u; --للاختصار 
      `,
      [
        UserType.Owner,
        UserType.AGENCY,
        OrderStatus.ACTIVE,
        ReportTitle.T3,
        ReportStatus.FIXED,
      ],
    );

    const result2 = await this.dataSource.query(
      `
          SELECT m.name                                            AS "Month",
                 (SELECT COUNT(*)
                  FROM users u
                  WHERE u."userType" = $1
                    AND EXTRACT(MONTH FROM u."createdAt") = m.mon) AS "Users",
                 --
                 (SELECT COUNT(*)
                  FROM users u
                  WHERE u."userType" = $2
                    AND EXTRACT(MONTH FROM u."createdAt") = m.mon) AS "Agencies",
                 --
                 (SELECT COUNT(*)
                  FROM property p
                  WHERE EXTRACT(MONTH FROM p."createdAt") = m.mon) AS "Properties",
                 --
                 (SELECT COUNT(*)
                  FROM votes v
                  WHERE EXTRACT(MONTH FROM v."createdAt") = m.mon) AS "Voting interactions",
                 --
                 (SELECT COUNT(*)
                  FROM orders o
                  WHERE EXTRACT(MONTH FROM o."createdAt") = m.mon) AS "All Subscriptions",
                 --
                 (SELECT COUNT(*)
                  FROM orders o
                  WHERE o."planStatus" = $3
                    AND EXTRACT(MONTH FROM o."createdAt") = m.mon) AS "Active Subscriptions",
                 --
                 (SELECT COUNT(*)
                  FROM report r
                  WHERE EXTRACT(MONTH FROM r."createdAt") = m.mon) AS "Complaints",
                 --
                 (SELECT COUNT(*)
                  FROM report r
                  WHERE r.title = $4
                    AND r."reportStatus" = $5
                    AND EXTRACT(MONTH FROM r."createdAt") = m.mon) AS "Fixed Refund Complaints"
          --
          FROM unnest(
                       ARRAY [
                           'January','February','March','April','May','June',
                           'July','August','September','October','November','December'
                           ]
               ) WITH ORDINALITY AS m(name, mon) --ترقيم يصبح عمودين واحد قيم والثاني ترقيم  
          ORDER BY m.mon;
      `,
      [
        UserType.Owner,
        UserType.AGENCY,
        OrderStatus.ACTIVE,
        ReportTitle.T3,
        ReportStatus.FIXED,
      ],
    );
    //unnest(ARRAY[...])
    // كل عنصر في المصفوفة يصبح صفًّا واحدًا في الناتج
    return {
      TotalCounts: result1,
      MonthlyStats: result2,
    };
  }
}
