import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('word_level')
export class WordLevel {
  //단어레벨 번호
  @PrimaryGeneratedColumn({
    name: 'word_level_id',
    type: 'bigint',
  })
  wordLevelId: number;

  //단어 레벨명
  @Column({
    name: 'word_level_name',
    type: 'varchar',
  })
  wordLevelName: string;

  //서비스 여부
  @Column({
    name: 'is_service',
    type: 'boolean',
  })
  isService: boolean;

  //단어 레벨 순번
  @Column({
    name: 'word_level_sequence',
    type: 'tinyint',
  })
  wordLevelSequence: number;

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
}
