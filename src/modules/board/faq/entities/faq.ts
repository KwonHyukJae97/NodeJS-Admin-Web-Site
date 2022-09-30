import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsBoolean, IsString } from 'class-validator';
import { Board } from '../../entities/board';

/**
 * FAQ에 대한 엔티티 정의
 */

@Entity()
export class Faq {
  @PrimaryGeneratedColumn({
    name: 'faq_id',
  })
  faqId: number;

  @IsString()
  @Column({
    name: 'faq_grant',
  })
  faqGrant: string;

  @IsBoolean()
  @Column({
    name: 'is_top',
  })
  isTop: boolean;

  @OneToOne((type) => Board, (board) => board.faqId, { eager: true })
  @JoinColumn({
    name: 'board_id',
  })
  boardId: Board;
}
