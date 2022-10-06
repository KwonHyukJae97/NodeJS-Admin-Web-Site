import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsNumber, IsString } from 'class-validator';
import { Qna } from '../../qna/entities/qna';

/**
 * 답변에 대한 엔티티 정의
 */

@Entity('qna_comment')
export class Comment {
  // 문의 번호
  @PrimaryGeneratedColumn({
    name: 'comment_id',
  })
  commentId: number;

  // 관리자 번호
  @IsNumber()
  @Column({
    name: 'admin_id',
  })
  adminId: number;

  // 문의 번호
  @IsNumber()
  @Column({
    name: 'qna_id',
  })
  qnaId: number;

  // 답변내용
  @IsString()
  @Column({
    name: 'comment',
  })
  comment: string;

  // 등록일시
  @CreateDateColumn({
    name: 'reg_date',
  })
  regDate: Date;

  // 수정일시
  @CreateDateColumn({
    name: 'update_date',
    nullable: true,
  })
  updateDate: Date;

  // 삭제일시
  @CreateDateColumn({
    name: 'del_date',
    nullable: true,
  })
  delDate: Date;

  // @ManyToOne((type) => Qna, (qna) => qna.commentList, { eager: true })
  // qnaId: number;
}
