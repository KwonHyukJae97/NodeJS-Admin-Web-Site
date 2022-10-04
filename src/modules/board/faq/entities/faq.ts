import { Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Board } from '../../entities/board';
import { FaqCategory } from './faq_category';

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
  @ManyToOne((type) => FaqCategory, (category) => category.faqList, { eager: true })
  @JoinColumn({
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
