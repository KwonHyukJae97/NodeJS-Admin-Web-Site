import { Study } from 'src/modules/study/entities/study';
import { WordLevel } from 'src/modules/wordLevel/entities/wordLevel';
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

@Entity('level_standard')
export class LevelStandard {
  //레벨 수준 번호
  @PrimaryGeneratedColumn({
    name: 'level_standard_id',
    type: 'bigint',
  })
  levelStandardId: number;

  //학습 관리 번호
  @Column({
    name: 'study_id',
    type: 'bigint',
  })
  studyId: number;

  //단어 레벨 번호
  @Column({
    name: 'word_level_id',
    type: 'bigint',
  })
  wordLevelId: number;

  //아는 수 오차
  @Column({
    name: 'known_error',
    type: 'tinyint',
  })
  knownError: number;

  //수준
  @Column({
    name: 'standard',
    type: 'varchar',
    length: '10',
  })
  standard: string;

  //레벨 수준 순번
  @Column({
    name: 'level_standard_sequence',
    type: 'tinyint',
  })
  levelStandardSequence: number;

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

  //단어레벨 정보 가져오기
  @OneToOne(() => WordLevel)
  @JoinColumn({ name: 'word_level_id' })
  wordLevel: WordLevel;
}
