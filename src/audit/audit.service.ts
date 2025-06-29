import { Injectable } from '@nestjs/common';
import { CreateAuditDto } from './dto/create-audit.dto';
import { UpdateAuditDto } from './dto/update-audit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Audit } from './entities/audit.entity';
import { Repository } from 'typeorm';
import { UsersGetProvider } from '../users/providers/users-get.provider';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(Audit)
    private readonly auditRepository: Repository<Audit>,
    private readonly usersGetProvider: UsersGetProvider,
  ) {}

  async create(adminId: number, meta: any) {
    //admin
    const admin = await this.usersGetProvider.getAdminById(adminId);
    meta.admin = {
      adminId: admin?.id,
      username: admin?.username,
    };
    return this.auditRepository.save({
      admin: {
        id: adminId,
      },
      meta: meta,
    });
  }

  async findAll() {
    const logs = await this.auditRepository.find({
      select: {
        meta: true,
        createdAt: true,
      },
      order: { createdAt: 'DESC' },
    });
    //+1 لانه يعد من 0   padStart اذا اقل من رقمين
    return logs.map((log) => ({
      meta: log.meta,
      createdAt: `${log.createdAt.getFullYear()}/${String(log.createdAt.getMonth() + 1).padStart(2, '0')}/${String(log.createdAt.getDate()).padStart(2, '0')}  ${log.createdAt.getHours()}:${log.createdAt.getMinutes()}`,
    }));
  }

  async findOne(id: number) {
    await this.auditRepository.findOneBy({ id: id });
  }

  update(id: number, updateAuditDto: UpdateAuditDto) {
    return `This action updates a #${id} audit`;
  }

  remove(id: number) {
    return `This action removes a #${id} audit`;
  }
}
