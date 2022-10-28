import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 답변에 대한 엔티티 정의
 */
@Entity('qna_comment')
export class Comment {
  // 답변 번호
  @PrimaryGeneratedColumn({
    name: 'comment_id',
    type: 'bigint',
  })
  commentId: number;

  // 관리자 번호
  @Column({
    name: 'admin_id',
    type: 'int',
  })
  adminId: number;

  // 문의 번호
  @Column({
    name: 'qna_id',
    type: 'bigint',
  })
  qnaId: number;

  // 답변내용
  @Column({
    name: 'comment',
    type: 'text',
  })
  comment: string;

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

  // 문의 정보
  // @ManyToOne(() => Qna)
  // @JoinColumn({ name: 'qna_id' })
  // qna: Qna;
}
