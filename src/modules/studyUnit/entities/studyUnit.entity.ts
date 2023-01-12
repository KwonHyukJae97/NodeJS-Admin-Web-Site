import { Study } from 'src/modules/study/entities/study.entity';
import { StudyPlan } from 'src/modules/studyPlan/entities/studyPlan.entity';
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

@Entity('study_unit')
export class StudyUnit {
  //학습 단원 번호
  @PrimaryGeneratedColumn({
    name: 'study_unit_id',
    type: 'bigint',
  })
  studyUnitId: number;

  //학습 구성 번호
  @ManyToOne((type) => StudyPlan, (studyPlan) => studyPlan.studyUnits, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'study_plan_id',
  })
  studyPlanId: number;

  //단원명
  @Column({
    name: 'unit_name',
    type: 'varchar',
    length: '100',
  })
  unitName: string;

  //단원 순번
  @Column({
    name: 'unit_sequence',
    type: 'tinyint',
  })
  unitSequence: number;

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
}
