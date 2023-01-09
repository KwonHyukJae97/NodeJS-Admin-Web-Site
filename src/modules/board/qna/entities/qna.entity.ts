import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Board } from '../../entities/board.entity';

/**
 * 1:1 문의에 대한 엔티티 정의
 */
@Entity()
export class Qna {
  // 문의 번호
  @PrimaryGeneratedColumn({
    name: 'qna_id',
    type: 'bigint',
  })
  qnaId: number;

  // 게시글 번호
  @Column({
    name: 'board_id',
    type: 'bigint',
  })
  boardId: number;

  // 게시글 정보
  @OneToOne(() => Board)
  @JoinColumn({
    name: 'board_id',
  })
  board: Board;
}
