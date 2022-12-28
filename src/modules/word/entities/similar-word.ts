import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 비슷하지만 다른말에 대한 엔티티 정의
 */
@Entity('similar_word')
export class SimilarWord {
  // 비슷하지만 다른말 번호
  @PrimaryGeneratedColumn({
    name: 'similar_info_id',
    type: 'bigint',
  })
  similarInfoId: number;

  // 단어 번호
  @Column({
    name: 'word_id',
    type: 'bigint',
  })
  wordId!: number;

  // 유사단어 번호
  @Column({
    name: 'similar_word_id',
    type: 'bigint',
  })
  similarWordId!: number;

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
