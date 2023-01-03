import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('study_type')
export class StudyType {
  //학습영역코드
  @PrimaryColumn({
    name: 'study_type_code',
    type: 'varchar',
  })
  studyTypeCode: string;

  //학습영역명
  @Column({
    name: 'study_type_name',
    type: 'varchar',
  })
  studyTypeName: string;

  //학습영역정보
  @Column({
    name: 'study_type_information',
    type: 'varchar',
  })
  studyTypeInformation: string;

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
