import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsNumber } from 'class-validator';
import { Board } from '../../entities/board';

/**
 * FAQ에 대한 엔티티 정의
 */

@Entity()
export class Faq {
  // FAQ 번호
  @PrimaryGeneratedColumn({
    name: 'faq_id',
  })
  faqId: number;

  // 분류 번호
  @IsNumber()
  @Column({
    name: 'category_id',
  })
  categoryId: number;

  // 게시글 번호
  @OneToOne((type) => Board, (board) => board.faqId, { eager: true })
  @JoinColumn({
    name: 'board_id',
  })
  boardId: Board;
}
