import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReportStatus, ReportTitle } from '../../utils/enums';
import { CURRENT_TIMESTAMP } from '../../utils/constants';

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ReportTitle })
  title: ReportTitle;

  @Column({ length: 60, nullable: true })
  reason: string; //string

  @Column({ type : 'jsonb' })
  mult_description: Record<string, string>;

  @Column({ length: 32 })
  myEmail: string;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  reportStatus: ReportStatus;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;
}
