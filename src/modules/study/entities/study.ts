import { StudyType } from 'src/modules/studyType/entities/studyType';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('study')
export class Study {
  //학습 관리 번호
  @PrimaryGeneratedColumn({
    name: 'study_id',
    type: 'bigint',
  })
  studyId: number;

  //학습영역 코드
  @Column({
    name: 'study_type_code',
    type: 'varchar',
    length: '2',
  })
  studyTypeCode: string;

  //학습명
  @Column({
    name: 'study_name',
    type: 'varchar',
    length: '100',
  })
  studyName: string;

  //학습대상
  @Column({
    name: 'study_target',
    type: 'varchar',
  })
  studyTarget: string;

  //학습 정보
  @Column({
    name: 'study_information',
    type: 'text',
  })
  studyInformation: string;

  //성취도 평가 점수
  @Column({
    name: 'test_score',
    type: 'tinyint',
  })
  testScore: number;

  //서비스 여부
  @Column({
    name: 'is_service',
    type: 'boolean',
  })
  isService: boolean;

  @Column({
    name: 'check_level_under',
    type: 'varchar',
    length: '5',
  })
  checkLevelUnder: string;

  @Column({
    name: 'check_level',
    type: 'varchar',
    length: '5',
  })
  checkLevel: string;

  //등록자
  @Column({
    name: 'reg_by',
    type: 'varchar',
    length: '20',
  })
  regBy: string;

  //수정자
  @Column({
    name: 'update_by',
    type: 'varchar',
    length: '20',
  })
  updateBy: string;

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

  //학습 영역 정보 가져오기
  @OneToOne(() => StudyType)
  @JoinColumn({ name: 'study_type_code' })
  studyType: StudyType;
}
