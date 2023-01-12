import { LevelStandard } from 'src/modules/levelStandard/entities/levelStandard.entity';
import { Percent } from 'src/modules/percent/entities/percent.entity';
import { Study } from 'src/modules/study/entities/study.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('grade_level_rank')
export class GradeLevelRank {
  //학년별 레벨별 등급 번호
  @PrimaryGeneratedColumn({
    name: 'grade_level_rank_id',
    type: 'bigint',
  })
  gradeLevelRankId: number;

  //레벨 수준 번호
  @OneToOne((type) => LevelStandard, (levelStandard) => levelStandard.gradeLevelRanks, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'level_standard_id',
  })
  levelStandardId: number;

  //백분율 번호
  @Column({
    name: 'percent_id',
    type: 'bigint',
  })
  percentId: number;

  //학년
  @Column({
    name: 'grade_rank',
    type: 'int',
  })
  gradeRank: number;

  // 등록일시
  @CreateDateColumn({
    name: 'reg_date',
    type: 'datetime',
  })
  regDate: Date;

  // 수정일시
  @UpdateDateColumn({
    name: 'update_date',
    type: 'datetime',
    nullable: true,
  })
  updateDate: Date;

  // 삭제일시
  @DeleteDateColumn({
    name: 'del_date',
    type: 'datetime',
    nullable: true,
  })
  delDate: Date;

  //학습관리 정보 가져오기
  @OneToOne(() => LevelStandard)
  @JoinColumn({ name: 'level_standard_id' })
  levelStandard: LevelStandard;

  //학습관리 정보 가져오기
  @OneToOne(() => Percent)
  @JoinColumn({ name: 'percent_id' })
  percent: Percent;
}
