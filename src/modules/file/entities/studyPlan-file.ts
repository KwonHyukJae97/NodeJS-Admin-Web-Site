import { StudyPlan } from 'src/modules/studyPlan/entities/studyPlan';
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

/**
 * 학습구성 파일에 대한 엔티티 정의
 */
@Entity('study_plan_file')
export class StudyPlanFile {
  // 파일 번호
  @PrimaryGeneratedColumn({
    name: 'study_plan_file_id',
    type: 'bigint',
  })
  studyPlanFileId: number;

  // 계정 번호
  @Column({
    name: 'study_plan_id',
    type: 'bigint',
  })
  studyPlanId!: number;

  // 원본 파일명
  @Column({
    name: 'original_name',
    type: 'varchar',
    length: '255',
  })
  originalFileName: string;

  // 파일명
  @Column({
    name: 'file_name',
    type: 'varchar',
    length: '255',
  })
  fileName: string;

  // 파일 확장자
  @Column({
    name: 'file_ext',
    type: 'varchar',
    length: '5',
  })
  fileExt: string;

  // 파일 경로
  @Column({
    name: 'file_path',
    type: 'varchar',
    length: '255',
  })
  filePath: string;

  // 파일 용량
  @Column({
    name: 'file_size',
    type: 'bigint',
  })
  fileSize: number;

  // 등록일시
  @CreateDateColumn({
    name: 'reg_date',
    type: 'datetime',
  })
  regDate: Date;

  // 변경일시
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

  //학습 관리 정보
  @OneToOne(() => StudyPlan)
  @JoinColumn({ name: 'study_plan_id' })
  studyPlan: StudyPlan;
}
