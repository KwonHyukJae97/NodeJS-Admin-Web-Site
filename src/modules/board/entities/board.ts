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

@Entity()
export class Board {
  // 게시글 번호
  @PrimaryGeneratedColumn({
    name: 'board_id',
  })
  boardId: number;

  // 계정 번호
  @IsNumber()
  @Column({
    name: 'account_id',
  })
  accountId!: number;

  // 게시글 타입코드
  @IsString()
  @Column({
    name: 'board_type_code',
  })
  boardTypeCode: string;

  // 제목
  @IsString()
  @Column()
  title: string;

  // 내용
  @IsString()
  @Column()
  content: string;

  // 조회수
  @IsNumber()
  @Column({
    name: 'view_count',
  })
  viewCount: number;

  // 등록일시
  @CreateDateColumn({
    name: 'reg_date',
  })
  regDate: Date;

  // 수정일시
  @UpdateDateColumn({
    name: 'update_date',
    nullable: true,
  })
  updateDate: Date;

  // 삭제일시
  @DeleteDateColumn({
    name: 'del_date',
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
