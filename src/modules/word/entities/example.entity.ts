import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Word } from './word.entity';

/**
 * 예문에 대한 엔티티 정의
 */
@Entity('example')
export class Example {
  // 예문 번호
  @PrimaryGeneratedColumn({
    name: 'example_id',
    type: 'bigint',
  })
  exampleId: number;

  // 단어 번호
  @ManyToOne((type) => Word, (word) => word.examples, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'word_id',
  })
  wordId!: number;

  // 영문 문장
  @Column({
    name: 'sentence',
    type: 'text',
  })
  sentence: string;

  // 해석
  @Column({
    name: 'translation',
    type: 'text',
  })
  translation: string;

  // 출제처
  @Column({
    name: 'source',
    type: 'varchar',
    length: '100',
  })
  source: string;

  // 예문 순번
  @Column({
    name: 'example_sequence',
    type: 'tinyint',
  })
  exampleSequence: number;

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

  // 부모 엔티티에서 자식 정보 조회가 필요할 경우, 아래와 같이 사용
  // @OneToOne((type) => NoticeEntity, (notice) => notice.boardId)
  // noticeId: number;
  //
  // @OneToOne((type) => FaqEntity, (faq) => faq.boardId)
  // faqId: number;
  //
  // @OneToOne((type) => QnaEntity, (qna) => qna.boardId)
  // qnaId: number;
  //
  // @ManyToOne((type) => Word, (word) => word.examples, {
  //   createForeignKeyConstraints: false,
  // })
  // word: Word;
}
