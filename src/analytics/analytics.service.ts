import { Injectable } from '@nestjs/common';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from '../properties/entities/property.entity';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { create } from 'axios';
import { Report } from '../reports/entities/report.entity';
import { UserType } from '../utils/enums';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  create(createAnalyticsDto: CreateAnalyticsDto) {
    return 'This action adds a new analytics';
  }

  findOne(id: number) {
    return `This action returns a #${id} analytics`;
  }

  update(id: number, updateAnalyticsDto: UpdateAnalyticsDto) {
    return `This action updates a #${id} analytics`;
  }

  remove(id: number) {
    return `This action removes a #${id} analytics`;
  }

  async findAll() {
    // Get total counts - only regular users
    const totalUsers = await this.userRepository.count({
      where: {
        userType: UserType.NORMAL_USER,
      },
    });
    const totalProperties = await this.propertyRepository.count();
    const totalComplaints = await this.reportRepository.count();

    const [users, properties, complaints] = await Promise.all([
      this.userRepository.find({
        where: { userType: UserType.NORMAL_USER },
        select: ['createdAt'],
      }),
      this.propertyRepository.find({ select: ['createdAt'] }),
      this.reportRepository.find({ select: ['createdAt'] }),
    ]);

    // 2) دالة مساعدة لتحويل قائمة تواريخ إلى خريطة monthIndex ➔ count
    const countByMonth = (dates: Date[]) =>
      dates.reduce<Record<number, number>>((acc, dt) => {
        const m = dt.getMonth(); // 0 = Jan, 11 = Dec
        acc[m] = (acc[m] || 0) + 1;
        return acc;
      }, {});

    // نبني مصفوفة شهور لكل كيان
    const usersCount = countByMonth(users.map((u) => u.createdAt));
    const propsCount = countByMonth(properties.map((p) => p.createdAt));
    const complaintsCount = countByMonth(complaints.map((r) => r.createdAt));
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    // 3) إنشاء المصفوفة النهائية وملؤها
    const monthlyStats = monthNames.map((name, idx) => ({
      name,
      users: usersCount[idx] || 0,
      properties: propsCount[idx] || 0,
      complaints: complaintsCount[idx] || 0,
    }));

    return {
      totalCounts: {
        users: totalUsers,
        properties: totalProperties,
        complaints: totalComplaints,
      },
      monthlyStats,
    };
  }
}
