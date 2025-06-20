import { Column } from 'typeorm';

export class PriorityScoreEntity {
  @Column({ type: 'float', default: 0 })
  adminsScoreRate: number;
  @Column({ type: 'float', default: 0 })
  suitabilityScoreRate: number;
  @Column({ type: 'float', default: 0 })
  voteScoreRate: number;
}
