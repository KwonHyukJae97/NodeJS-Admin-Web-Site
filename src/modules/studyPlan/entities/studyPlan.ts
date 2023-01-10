import { Study } from 'src/modules/study/entities/study';
import { StudyUnit } from 'src/modules/studyUnit/entities/studyUnit';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('study_plan')
export class StudyPlan {
  //학습 구성 번호
  @PrimaryGeneratedColumn({
    name: 'study_plan_id',
    type: 'bigint',
  })
  studyPlanId: number;

  //학습 관리 번호
  @ManyToOne((type) => Study, (study) => study.studyPlans, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'study_id',
  })
  studyId: number;
  // @Column({
  //   name: 'study_id',
  //   type: 'bigint',
  // })
  // studyId: number;

  //등록 진행방식
  @Column({
    name: 'register_mode',
    type: 'char',
    length: '1',
  })
  registerMode: string;

  //기본 학습 진행방식
  @Column({
    name: 'study_mode',
    type: 'char',
    length: '1',
  })
  studyMode: string;

  //교재명
  @Column({
    name: 'textbook_name',
    type: 'varchar',
    length: '100',
  })
  textbookName: string;

  //교재 순번
  @Column({
    name: 'textbook_sequence',
    type: 'tinyint',
  })
  textbookSequence: number;

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

  //학습 관리 정보 가져오기
  @OneToOne(() => Study)
  @JoinColumn({ name: 'study_id' })
  study: Study;

  @OneToMany((type) => StudyUnit, (studyUnit) => studyUnit.studyPlanId, {
    eager: true,
    cascade: ['soft-remove'],
  })
  studyUnits: StudyUnit;
}
