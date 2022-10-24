import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsNumber, IsString } from 'class-validator';
import { Faq } from '../faq/entities/faq';
import { Notice } from '../notice/entities/notice';
import { Qna } from '../qna/entities/qna';

/**
 * 게시글에 대한 엔티티 정의
 */
@Entity('board')
export class Board {
  // 게시글 번호
  @PrimaryGeneratedColumn({
    name: 'board_id',
    type: 'bigint',
  })
  boardId: number;

  // 계정 번호
  @Column({
    name: 'account_id',
    type: 'bigint',
  })
  accountId!: number;

  // 게시글 타입코드 (0:Notice, 1:FAQ, 3.QnA)
  @Column({
    name: 'board_type_code',
    type: 'char',
  })
  fileTypeCode: string;

  // 제목
  @Column({
    name: 'title',
    type: 'varchar',
    length: '100',
  })
  title: string;

  // 내용
  @Column({
    name: 'content',
    type: 'text',
  })
  content: string;

  // 조회수
  @Column({
    name: 'view_count',
    type: 'int',
  })
  viewCount: number;

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

  @OneToOne((type) => Notice, (notice) => notice.boardId)
  noticeId: number;

  @OneToOne((type) => Faq, (faq) => faq.boardId)
  faqId: number;

  @OneToOne((type) => Qna, (qna) => qna.boardId)
  qnaId: number;
}
