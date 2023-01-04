import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Word } from './word';
import { WordFile } from '../../file/entities/word-file';

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
  @ManyToOne((type) => Word, (word) => word.similarWords, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'word_id',
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

  @OneToMany((type) => WordFile, (wordFile) => wordFile.wordId, { eager: true })
  similarWordFiles: WordFile[];
}
