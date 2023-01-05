import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Example } from './example';
import { WordFile } from '../../file/entities/word-file';
import { SimilarWord } from './similar-word';

/**
 * 단어에 대한 엔티티 정의
 */
@Entity('word')
export class Word {
  // 단어 번호
  @PrimaryGeneratedColumn({
    name: 'word_id',
    type: 'bigint',
  })
  wordId: number;

  // 단어 레벨 번호
  @Column({
    name: 'word_level_id',
    type: 'bigint',
  })
  wordLevelId!: number;

  // 프로젝트 번호
  @Column({
    name: 'project_id',
    type: 'bigint',
  })
  projectId!: number;

  // 연결 단어 번호
  @Column({
    name: 'connect_word_id',
    type: 'bigint',
  })
  connectWordId: number;

  // 단어명
  @Column({
    name: 'word_name',
    type: 'varchar',
    length: '50',
  })
  wordName: string;

  // 의미
  @Column({
    name: 'mean',
    type: 'varchar',
    length: '100',
  })
  mean: string;

  // 단어 상태 (0:본단어, 1:일반단어, 2:연결된 단어, 3:연결이 끊긴 단어)
  @Column({
    name: 'word_status',
    type: 'char',
    length: '1',
  })
  wordStatus: string;

  // 대표단어 여부
  @Column({
    name: 'is_main_word',
    type: 'boolean',
  })
  isMainWord: boolean;

  // 대표단어 자동설정 여부
  @Column({
    name: 'is_auto_main',
    type: 'boolean',
  })
  isAutoMain: boolean;

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

  @OneToMany((type) => Example, (example) => example.wordId, {
    eager: true,
    cascade: ['soft-remove'], // word 삭제 시, 자동 삭제 처리
  })
  examples: Example[];

  @OneToMany((type) => WordFile, (wordFile) => wordFile.wordId, {
    eager: true,
    // cascade: ['soft-remove'],
  })
  wordFiles: WordFile[];

  @OneToMany(() => SimilarWord, (similarWord) => similarWord.wordId, {
    eager: true,
    cascade: ['soft-remove'],
  })
  similarWords: SimilarWord[];
}
