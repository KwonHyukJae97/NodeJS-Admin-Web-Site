import { Study } from 'src/modules/study/entities/study';
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

@Entity('percent')
export class Percent {
  //백분율 번호
  @PrimaryGeneratedColumn({
    name: 'percent_id',
    type: 'bigint',
  })
  percentId: number;

  //학습 관리 번호
  @ManyToOne((type) => Study, (study) => study.percents, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'study_id',
  })
  studyId!: number;
  // @Column({
  //   name: 'study_id',
  //   type: 'bigint',
  // })
  // studyId: number;

  //등급명
  @Column({
    name: 'rank_name',
    type: 'varchar',
    length: '10',
  })
  rankName: string;

  //백분율
  @Column({
    name: 'percent',
    type: 'tinyint',
  })
  percent: number;

  //백분율 순서
  @Column({
    name: 'percent_sequence',
    type: 'tinyint',
  })
  percentSequence: number;

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
  @OneToOne(() => Study)
  @JoinColumn({ name: 'study_id' })
  study: Study;
}
