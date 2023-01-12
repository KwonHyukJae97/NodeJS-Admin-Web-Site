import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Board } from '../../entities/board.entity';
import { FaqCategory } from './faq_category.entity';

/**
 * FAQ에 대한 엔티티 정의
 */
@Entity('faq')
export class Faq {
  // FAQ 번호
  @PrimaryGeneratedColumn({
    name: 'faq_id',
    type: 'smallint',
  })
  faqId: number;

  // 분류 번호
  @Column({
    name: 'category_id',
    type: 'tinyint',
  })
  categoryId: number;

  // 게시글 번호
  @Column({
    name: 'board_id',
    type: 'bigint',
  })
  boardId: number;

  // 분류 정보
  @ManyToOne(() => FaqCategory)
  @JoinColumn({
    name: 'category_id',
  })
  category: FaqCategory;

  // 게시글 정보
  @OneToOne(() => Board)
  @JoinColumn({
    name: 'board_id',
  })
  board: Board;
}
