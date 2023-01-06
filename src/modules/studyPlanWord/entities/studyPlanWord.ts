import { Word } from 'aws-sdk/clients/cloudsearch';
import { StudyPlan } from 'src/modules/studyPlan/entities/studyPlan';
import { StudyUnit } from 'src/modules/studyUnit/entities/studyUnit';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('study_plan_word')
export class StudyPlanWord {
  //학습 구성_단어 번호
  @PrimaryGeneratedColumn({
    name: 'study_plan_word_id',
    type: 'bigint',
  })
  studyPlanWordId: number;

  //학습 구성 번호
  @Column({
    name: 'study_plan_id',
    type: 'bigint',
  })
  studyPlanId: number;

  //학습 단원 번호
  @Column({
    name: 'study_unit_id',
    type: 'bigint',
  })
  studyUnitId: number;

  //단어 번호
  @Column({
    name: 'word_id',
    type: 'bigint',
  })
  wordId: number;

  //학습관리 정보 가져오기
  @OneToOne(() => StudyPlan)
  @JoinColumn({ name: 'study_plan_id' })
  studyPlan: StudyPlan;

  //학습구성 정보 가져오기
  @OneToOne(() => StudyUnit)
  @JoinColumn({ name: 'study_unit_id' })
  studyUnit: StudyUnit;

  // @OneToOne(() => Word)
  // @JoinColumn({ name: 'word_id' })
  // word: Word;
}
